'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  FileCode2,
  Settings2
} from 'lucide-react';
import { getModelInfo } from '../../lib/api';
import { ModelInfoData } from '../../lib/types';

export function ModelInfoView() {
  const [modelInfo, setModelInfo] = useState<ModelInfoData | null>(null);

  useEffect(() => {
    getModelInfo().then(setModelInfo).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Machine Learning System Architecture</h1>
          <span className="rounded-md bg-cyan-400/10 px-2 py-0.5 text-xs font-mono text-cyan-300 border border-cyan-400/20">
            MODEL SPECIFICATION
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Transparent overview of the ML inference pipeline, engineered physical features, and decision boundaries.
        </p>
      </div>

      {/* Honest Prototype Notice */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-300">SCIENTIFIC & PROVENANCE TRANSPARENCY:</span> This prototype uses synthetic calibration operating points derived from the IEEE 39-bus topology. Final dataset selection, empirical validation, and benchmark metrics will be integrated once field data agreements are finalized.
        </div>
      </div>

      {/* Visual Pipeline Flowchart Diagram */}
      <div className="rounded-2xl border border-slate-800 bg-[#0b1929] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">End-to-End Prediction Data Pipeline</h2>
          <span className="text-xs text-slate-400 font-mono">Input → Physics Features → ML → Rules</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          {[
            { step: '1. Input Telemetry', desc: 'Solar, Wind, Load, Frequency, Voltage, Ramp', color: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-300' },
            { step: '2. Preprocessing', desc: 'Unit conversion (MW, pu, Hz) & boundary checks', color: 'border-blue-500/30 bg-blue-500/5 text-blue-300' },
            { step: '3. Feature Engineering', desc: 'Inertia constant (H), Net demand, Excursion deltas', color: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-300' },
            { step: '4. Python ML Model', desc: 'Scikit-learn Random Forest regression ensemble', color: 'border-purple-500/30 bg-purple-500/5 text-purple-300' },
            { step: '5. Decision Rules', desc: 'Risk categorization: LOW / MOD / HIGH / CRIT', color: 'border-amber-500/30 bg-amber-500/5 text-amber-300' },
            { step: '6. UI & Dispatches', desc: 'Real-time dashboard, history, and automated alerts', color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' },
          ].map((s, idx) => (
            <div key={idx} className={`rounded-xl border p-3.5 space-y-1.5 ${s.color}`}>
              <div className="text-xs font-bold font-mono">{s.step}</div>
              <p className="text-[11px] text-slate-400 leading-tight">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Model Metadata Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <div className="rounded-2xl border border-slate-800 bg-[#0b1929] p-6 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>Model Overview & Status</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Model Name:</span>
              <span className="font-semibold text-white">GridSense Stability Ensemble</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Task:</span>
              <span className="font-medium text-slate-200">Grid Stability Risk Prediction</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Algorithm:</span>
              <span className="font-mono text-cyan-300">Physics-guided Random Forest Regressor</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Output:</span>
              <span className="text-slate-200">Continuous Risk Score (0.00 - 1.00) & Categorization</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Model Status:</span>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/20">
                PROTOTYPE
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Training Dataset:</span>
              <span className="text-slate-300">Synthetic IEEE 39-Bus New England Dynamics</span>
            </div>
          </div>
        </div>

        {/* Decision Rules Matrix */}
        <div className="rounded-2xl border border-slate-800 bg-[#0b1929] p-6 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-cyan-400" />
            <span>Operational Decision Rules & Actions</span>
          </h2>

          <div className="space-y-2 text-xs">
            {[
              { level: 'LOW', range: '0.00 - 0.34', color: 'text-emerald-400', action: 'Standard economic dispatch; normal telemetry polling.' },
              { level: 'MODERATE', range: '0.35 - 0.64', color: 'text-cyan-300', action: 'Elevate tie-line monitoring; prepare flexible spinning reserve.' },
              { level: 'HIGH', range: '0.65 - 0.79', color: 'text-amber-300', action: 'Dispatch active frequency regulation; command inverter VAR injection.' },
              { level: 'CRITICAL', range: '0.80 - 1.00', color: 'text-red-400', action: 'Emergency dispatch; activate BESS FFR; initiate renewable curtailment.' },
            ].map((rule) => (
              <div key={rule.level} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${rule.color}`}>{rule.level} RISK</span>
                  <span className="font-mono text-slate-400 text-[11px]">Score: {rule.range}</span>
                </div>
                <p className="text-[11px] text-slate-300">{rule.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Engineering Specifications */}
      <div className="rounded-2xl border border-slate-800 bg-[#0b1929] p-6 space-y-4">
        <h2 className="text-base font-semibold text-white">Engineered Electrical Proxy Features</h2>
        <p className="text-xs text-slate-400">
          Raw measurements are transformed into physical stability sensitivities before ML ingestion:
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <div className="font-semibold text-cyan-300">Renewable Penetration Ratio</div>
            <div className="font-mono text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg">
              (Solar + Wind) / Total Load Demand
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Measures percentage of system load served by non-synchronous inverter generation.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <div className="font-semibold text-cyan-300">Net Demand (Duck Curve Index)</div>
            <div className="font-mono text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg">
              Total Load - (Solar + Wind)
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Defines residual generation that must be supplied by dispatchable synchronous plants.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <div className="font-semibold text-cyan-300">System Rotational Inertia Proxy</div>
            <div className="font-mono text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg">
              H_base * (1.0 - 0.70 * Penetration)
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Quantifies kinetic rotational mass deficit and susceptibility to steep ROCOF transients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
