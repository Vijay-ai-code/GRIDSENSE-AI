'use client';

import React, { useState } from 'react';
import { Database, Search, Filter, ArrowUpDown, Eye, Clock, Download } from 'lucide-react';
import { PredictionResult, RiskLevel } from '../../lib/types';
import { ScenarioModal } from './ScenarioModal';

interface HistoryViewProps {
  predictions: PredictionResult[];
}

export function HistoryView({ predictions }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'time' | 'risk'>('time');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<PredictionResult | null>(null);

  // Filter predictions
  const filtered = predictions.filter((item) => {
    const matchesSearch =
      item.scenario?.scenario_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mitigation_notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model_version.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = selectedRisk === 'ALL' || item.risk_level === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  // Sort predictions
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'risk') {
      return sortAsc ? a.risk_score - b.risk_score : b.risk_score - a.risk_score;
    }
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortAsc ? timeA - timeB : timeB - timeA;
  });

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'MODERATE':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Prediction Scenarios & Audit History</h1>
            <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-mono text-indigo-300 border border-indigo-500/20">
              POSTGRESQL AUDIT LOG
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Historical record of evaluated operational states, model versions, and risk classifications.
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-2xl border border-slate-800 bg-[#0b1929] p-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search scenario name or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-400"
          />
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          <div className="flex items-center gap-1 text-xs text-slate-400 mr-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Risk:</span>
          </div>
          {['ALL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedRisk(lvl)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                selectedRisk === lvl
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-800/80'
              }`}
            >
              {lvl}
            </button>
          ))}

          <button
            onClick={() => {
              if (sortField === 'risk') {
                setSortAsc(!sortAsc);
              } else {
                setSortField('risk');
                setSortAsc(false);
              }
            }}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800 transition ml-2"
          >
            <ArrowUpDown className="h-3 w-3 text-cyan-400" />
            <span>Sort by {sortField === 'risk' ? 'Risk' : 'Date'}</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1929] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Scenario Name</th>
                <th className="px-5 py-3.5">Renewable Penetration</th>
                <th className="px-5 py-3.5">Load (MW)</th>
                <th className="px-5 py-3.5">Frequency (Hz)</th>
                <th className="px-5 py-3.5">Voltage (pu)</th>
                <th className="px-5 py-3.5">Risk Score</th>
                <th className="px-5 py-3.5">Risk Level</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sorted.map((item) => {
                const s = item.scenario;
                const solar = s?.solar_mw ?? 0;
                const wind = s?.wind_mw ?? 0;
                const load = s?.load_mw ?? 1000;
                const renPct = load > 0 ? (((solar + wind) / load) * 100).toFixed(1) : '0';

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-mono text-slate-400">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-4 font-medium text-white max-w-xs truncate">
                      {s?.scenario_name || `Scenario #${item.scenario_id}`}
                    </td>
                    <td className="px-5 py-4 font-mono text-cyan-300 font-semibold">{renPct}%</td>
                    <td className="px-5 py-4 font-mono text-slate-300">{load} MW</td>
                    <td className="px-5 py-4 font-mono text-emerald-400">{s?.frequency_hz ?? 50.0} Hz</td>
                    <td className="px-5 py-4 font-mono text-indigo-300">{s?.voltage_pu ?? 1.0} pu</td>
                    <td className="px-5 py-4 font-mono font-bold text-white">
                      {(item.risk_score * 100).toFixed(1)}%
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 font-semibold text-[10px] border ${getRiskBadge(item.risk_level)}`}>
                        {item.risk_level}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedScenario(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                    No prediction scenarios matched the current search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scenario Detail Inspection Modal */}
      <ScenarioModal prediction={selectedScenario} onClose={() => setSelectedScenario(null)} />
    </div>
  );
}
