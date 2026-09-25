'use client';

import React from 'react';
import { X, Gauge, Zap, Activity, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { PredictionResult } from '../../lib/types';

interface ScenarioModalProps {
  prediction: PredictionResult | null;
  onClose: () => void;
}

export function ScenarioModal({ prediction, onClose }: ScenarioModalProps) {
  if (!prediction) return null;

  const scenario = prediction.scenario;
  const solar = scenario?.solar_mw ?? 0;
  const wind = scenario?.wind_mw ?? 0;
  const load = scenario?.load_mw ?? 0;
  const totalRen = solar + wind;
  const penetration = load > 0 ? ((totalRen / load) * 100).toFixed(1) : '0';

  const getRiskStyle = (level: string) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#091524] p-6 shadow-2xl shadow-cyan-500/10 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Scenario Inspection #{prediction.id}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${getRiskStyle(prediction.risk_level)}`}>
                {prediction.risk_level} RISK
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Recorded at {new Date(prediction.created_at).toLocaleString()} • Scenario: {scenario?.scenario_name || 'Operational Scenario'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Electrical Operating Parameters Grid */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Operational Electrical Telemetry
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-slate-400">Solar Generation</span>
              <div className="mt-1 text-sm font-semibold font-mono text-white">{solar} MW</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-slate-400">Wind Generation</span>
              <div className="mt-1 text-sm font-semibold font-mono text-white">{wind} MW</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-slate-400">Load Demand</span>
              <div className="mt-1 text-sm font-semibold font-mono text-white">{load} MW</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-slate-400">System Frequency</span>
              <div className="mt-1 text-sm font-semibold font-mono text-emerald-400">{scenario?.frequency_hz ?? 50.0} Hz</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-slate-400">Bus Voltage</span>
              <div className="mt-1 text-sm font-semibold font-mono text-cyan-400">{scenario?.voltage_pu ?? 1.0} pu</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-slate-400">Renewable Penetration</span>
              <div className="mt-1 text-sm font-semibold font-mono text-amber-300">{penetration}%</div>
            </div>
          </div>
        </div>

        {/* Prediction Breakdown and Risk Assessment */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            ML Prediction Risk Breakdown
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Computed Instability Risk Score:</span>
              <span className="font-mono text-base font-bold text-cyan-300">
                {(prediction.risk_score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Model Algorithm:</span>
              <span className="font-mono text-slate-300">{prediction.model_version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Confidence Metric:</span>
              <span className="font-mono text-emerald-400">{((prediction.confidence || 0.88) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Advisory Mitigation Notes */}
        <div className="rounded-xl border border-slate-700/80 bg-slate-900 p-4 space-y-1.5">
          <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
            Operational Interpretation & Recommended Mitigation:
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {prediction.mitigation_notes || 'Normal steady state operating conditions.'}
          </p>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
