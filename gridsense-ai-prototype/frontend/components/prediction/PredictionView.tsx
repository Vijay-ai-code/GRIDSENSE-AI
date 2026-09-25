'use client';

import React, { useState } from 'react';
import {
  Gauge,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { submitPrediction } from '../../lib/api';
import { GridScenario, PredictionResult, AlertItem } from '../../lib/types';

const PRESET_SCENARIOS: { name: string; description: string; data: Partial<GridScenario> }[] = [
  {
    name: 'Nominal Steady-State Grid',
    description: 'Balanced power generation with conventional synchronous reserve and minimal frequency delta.',
    data: {
      scenario_name: 'Nominal Steady-State Grid',
      solar_mw: 420,
      wind_mw: 260,
      load_mw: 1100,
      voltage_pu: 1.002,
      frequency_hz: 50.012,
      reactive_power_mvar: 115,
      renewable_ramp_pct: 2.1,
      load_variation_pct: 1.2,
      notes: 'Standard mild weather operating condition.'
    }
  },
  {
    name: 'Midday Duck Curve (High Solar)',
    description: 'Deep solar feed-in with low net demand, approaching overgeneration and inertia deficit.',
    data: {
      scenario_name: 'Solar Ramp Overgeneration (Duck Curve)',
      solar_mw: 920,
      wind_mw: 340,
      load_mw: 1050,
      voltage_pu: 1.038,
      frequency_hz: 50.148,
      reactive_power_mvar: 190,
      renewable_ramp_pct: 15.2,
      load_variation_pct: 3.5,
      notes: 'Peak solar noon window with steep ramping risk.'
    }
  },
  {
    name: 'Sudden Wind Drop & Peak Load',
    description: 'Rapid loss of wind generation during evening demand peak causing under-frequency excursion.',
    data: {
      scenario_name: 'Sudden Wind Drop with Peak Load',
      solar_mw: 90,
      wind_mw: 70,
      load_mw: 1420,
      voltage_pu: 0.958,
      frequency_hz: 49.882,
      reactive_power_mvar: 310,
      renewable_ramp_pct: 19.5,
      load_variation_pct: 6.2,
      notes: 'Severe ramping deficit requiring fast peaking units.'
    }
  },
  {
    name: 'Bus Voltage Sag / VAR Stress',
    description: 'High inductive load with deficient reactive power compensation, pulling bus voltage down.',
    data: {
      scenario_name: 'Voltage Depression Scenario',
      solar_mw: 520,
      wind_mw: 380,
      load_mw: 1240,
      voltage_pu: 0.938,
      frequency_hz: 49.932,
      reactive_power_mvar: 420,
      renewable_ramp_pct: 5.5,
      load_variation_pct: 2.0,
      notes: 'Substation capacitor bank deficit.'
    }
  }
];

interface PredictionViewProps {
  onPredictionComplete?: (result: PredictionResult, alerts: AlertItem[]) => void;
}

export function PredictionView({ onPredictionComplete }: PredictionViewProps) {
  const [formData, setFormData] = useState<GridScenario>({
    scenario_name: 'Manual Scenario',
    solar_mw: 650,
    wind_mw: 380,
    load_mw: 1180,
    voltage_pu: 0.985,
    frequency_hz: 49.945,
    reactive_power_mvar: 165,
    renewable_ramp_pct: 8.5,
    load_variation_pct: 2.5,
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [generatedAlerts, setGeneratedAlerts] = useState<AlertItem[]>([]);

  const totalRenewable = Number(formData.solar_mw) + Number(formData.wind_mw);
  const penetration = formData.load_mw > 0 ? ((totalRenewable / formData.load_mw) * 100).toFixed(1) : '0';
  const netDemand = formData.load_mw - totalRenewable;

  const handleInputChange = (field: keyof GridScenario, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const applyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setFormData((prev) => ({
      ...prev,
      ...preset.data,
      scenario_name: preset.name
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await submitPrediction({
        ...formData,
        solar_mw: Number(formData.solar_mw),
        wind_mw: Number(formData.wind_mw),
        load_mw: Number(formData.load_mw),
        voltage_pu: Number(formData.voltage_pu),
        frequency_hz: Number(formData.frequency_hz),
        reactive_power_mvar: Number(formData.reactive_power_mvar || 100),
        renewable_ramp_pct: Number(formData.renewable_ramp_pct || 0),
        load_variation_pct: Number(formData.load_variation_pct || 0)
      });

      setPredictionResult(response.prediction);
      setGeneratedAlerts(response.alerts || []);
      if (onPredictionComplete) {
        onPredictionComplete(response.prediction, response.alerts || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute grid stability prediction.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'HIGH':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'MODERATE':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Grid Stability Risk Predictor</h1>
          <span className="rounded-md bg-cyan-400/10 px-2 py-0.5 text-xs font-mono text-cyan-300 border border-cyan-400/20">
            ML SERVICE CLIENT
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Simulate operational scenarios under dynamic renewable penetration, ramp variations, and load demand.
        </p>
      </div>

      {/* Demo Warning Notice */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-300">DEMO ENVIRONMENT DISCLAIMER:</span> Predictions are generated by the prototype Python ML / physics baseline ensemble. Results demonstrate system workflow, input-output contracts, and risk interpretations; they are not certified for utility transmission control.
        </div>
      </div>

      {/* Preset Scenarios Selector Bar */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Quick Scenario Presets (Recommended for Presentation):</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`rounded-xl border p-3 text-left transition ${
                formData.scenario_name === preset.name
                  ? 'border-cyan-400 bg-cyan-400/10 shadow-sm shadow-cyan-400/10'
                  : 'border-slate-800 bg-[#0b1929] hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="text-xs font-semibold text-white">{preset.name}</div>
              <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: Inputs on Left, Prediction Output on Right */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* Form Column (7 Cols) */}
        <form onSubmit={handleSubmit} className="xl:col-span-7 rounded-2xl border border-slate-800 bg-[#0b1929] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Gauge className="h-4 w-4 text-cyan-400" />
              <span>Operating Conditions & Telemetry Inputs</span>
            </h2>
            <div className="text-xs text-slate-400 font-mono">
              Penetration: <span className="text-cyan-300 font-bold">{penetration}%</span>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Section 1: Renewable Generation */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Renewable Generation Parameters</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-slate-400 font-medium">Solar Generation</label>
                <div className="mt-1.5 flex items-center rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 focus-within:border-cyan-400">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.solar_mw}
                    onChange={(e) => handleInputChange('solar_mw', e.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none font-mono"
                    required
                  />
                  <span className="text-xs text-slate-400 font-mono">MW</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Wind Generation</label>
                <div className="mt-1.5 flex items-center rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 focus-within:border-cyan-400">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.wind_mw}
                    onChange={(e) => handleInputChange('wind_mw', e.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none font-mono"
                    required
                  />
                  <span className="text-xs text-slate-400 font-mono">MW</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Grid Electrical Parameters */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              <span>Grid & Transmission Parameters</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">Load Demand</label>
                <div className="mt-1.5 flex items-center rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 focus-within:border-cyan-400">
                  <input
                    type="number"
                    step="1"
                    min="100"
                    value={formData.load_mw}
                    onChange={(e) => handleInputChange('load_mw', e.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none font-mono"
                    required
                  />
                  <span className="text-xs text-slate-400 font-mono">MW</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">System Frequency</label>
                <div className="mt-1.5 flex items-center rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 focus-within:border-cyan-400">
                  <input
                    type="number"
                    step="0.001"
                    min="45.0"
                    max="65.0"
                    value={formData.frequency_hz}
                    onChange={(e) => handleInputChange('frequency_hz', e.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none font-mono"
                    required
                  />
                  <span className="text-xs text-slate-400 font-mono">Hz</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Bus Voltage</label>
                <div className="mt-1.5 flex items-center rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 focus-within:border-cyan-400">
                  <input
                    type="number"
                    step="0.001"
                    min="0.5"
                    max="1.5"
                    value={formData.voltage_pu}
                    onChange={(e) => handleInputChange('voltage_pu', e.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none font-mono"
                    required
                  />
                  <span className="text-xs text-slate-400 font-mono">pu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Contingency & Ramp Stress */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <span>Dynamic Conditions & Ramping Rates</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs text-slate-400 font-medium">Renewable Ramp Rate</label>
                <div className="mt-1.5 flex items-center rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 focus-within:border-cyan-400">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={formData.renewable_ramp_pct}
                    onChange={(e) => handleInputChange('renewable_ramp_pct', e.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none font-mono"
                  />
                  <span className="text-xs text-slate-400 font-mono">%/interval</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Reactive Power</label>
                <div className="mt-1.5 flex items-center rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 focus-within:border-cyan-400">
                  <input
                    type="number"
                    step="1"
                    value={formData.reactive_power_mvar}
                    onChange={(e) => handleInputChange('reactive_power_mvar', e.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none font-mono"
                  />
                  <span className="text-xs text-slate-400 font-mono">MVAr</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium">Load Fluctuation</label>
                <div className="mt-1.5 flex items-center rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2.5 focus-within:border-cyan-400">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.load_variation_pct}
                    onChange={(e) => handleInputChange('load_variation_pct', e.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none font-mono"
                  />
                  <span className="text-xs text-slate-400 font-mono">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Predict Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3.5 text-sm font-bold text-slate-950 transition hover:from-cyan-300 hover:to-blue-400 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  <span>Computing Grid Stability Inference...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>PREDICT STABILITY RISK</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Prediction Results Panel (5 Cols) */}
        <div className="xl:col-span-5 rounded-2xl border border-slate-800 bg-[#0b1929] p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-base font-semibold text-white">Prediction Results</h2>
              {predictionResult && (
                <span className={`rounded-full px-3 py-0.5 text-xs font-bold border ${getRiskColor(predictionResult.risk_level)}`}>
                  {predictionResult.risk_level} RISK
                </span>
              )}
            </div>

            {predictionResult ? (
              <div className="mt-6 space-y-6">
                {/* Risk Score Big Gauge Display */}
                <div className="text-center rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Computed Instability Risk Score
                  </div>
                  <div className="mt-3 flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-extrabold tracking-tight text-white font-mono">
                      {(predictionResult.risk_score * 100).toFixed(1)}
                    </span>
                    <span className="text-2xl text-slate-400 font-bold">%</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Confidence: <span className="text-cyan-300 font-mono">{(predictionResult.confidence * 100).toFixed(0)}%</span> • Model: <span className="font-mono text-slate-300">{predictionResult.model_status}</span>
                  </div>
                </div>

                {/* Key Contributing Conditions Breakdown */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Key Contributing Conditions:
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Frequency Excursion</span>
                      <span className="font-mono text-white font-semibold">
                        {predictionResult.contributing_factors?.frequency_deviation ?? '0.00'} Hz
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Renewable Penetration</span>
                      <span className="font-mono text-cyan-300 font-semibold">
                        {((predictionResult.contributing_factors?.renewable_penetration ?? 0) * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Voltage Deviation</span>
                      <span className="font-mono text-white font-semibold">
                        {predictionResult.contributing_factors?.voltage_deviation ?? '0.00'} pu
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Residual Net Demand</span>
                      <span className="font-mono text-slate-300 font-semibold">
                        {predictionResult.contributing_factors?.net_demand_mw ?? 0} MW
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operational Interpretation / Recommendation */}
                <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-4 space-y-1.5">
                  <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Recommended Operator Interpretation:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {predictionResult.mitigation_notes || 'Standard operational procedures apply.'}
                  </p>
                </div>

                {/* Automated Alerts Triggered */}
                {generatedAlerts.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{generatedAlerts.length} Automated Alarm(s) Dispatched:</span>
                    </div>
                    {generatedAlerts.map((alt, idx) => (
                      <div key={idx} className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-[11px] text-amber-200">
                        {alt.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="my-auto py-16 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-400">
                  <Gauge className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium text-slate-300">Awaiting Scenario Submission</div>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Select a scenario preset above or input custom operational parameters, then click Predict Stability Risk.
                </p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3">
            GridSense decision logic assigns risk categories using configurable operational thresholds: &lt;35% Low, 35-65% Moderate, 65-80% High, &gt;80% Critical.
          </div>
        </div>
      </div>
    </div>
  );
}
