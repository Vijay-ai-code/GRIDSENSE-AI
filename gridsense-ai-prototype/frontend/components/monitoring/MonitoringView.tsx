'use client';

import React from 'react';
import {
  Activity,
  Zap,
  TrendingUp,
  Cpu,
  BarChart3,
  Layers,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Legend
} from 'recharts';
import { GridTimeSeriesPoint, GridStatusSnapshot } from '../../lib/types';

interface MonitoringViewProps {
  history: GridTimeSeriesPoint[];
  status: GridStatusSnapshot | null;
}

export function MonitoringView({ history, status }: MonitoringViewProps) {
  return (
    <div className="space-y-6">
      {/* View Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Grid Monitoring & Telemetry Suite</h1>
            <span className="rounded-md bg-cyan-400/10 px-2 py-0.5 text-xs font-mono text-cyan-300 border border-cyan-400/20">
              HIGH-RES CHANNELS
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Real-time multi-channel telemetry tracking synchronous frequency, bus voltages, and reactive VAR reserves.
          </p>
        </div>
      </div>

      {/* Real-time Telemetry Snapshot Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-[#0b1929] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider">
            <span>Primary Frequency Response</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-white font-mono">
            {status?.frequencyHz ? status.frequencyHz.toFixed(3) : '49.982'} <span className="text-sm font-normal text-slate-400">Hz</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>ROCOF Estimate:</span>
            <span className="font-mono text-emerald-300">+0.012 Hz/s</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0b1929] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider">
            <span>Transmission Voltage</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-white font-mono">
            {status?.voltagePu ? status.voltagePu.toFixed(3) : '0.995'} <span className="text-sm font-normal text-slate-400">pu</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Nominal Deviation:</span>
            <span className="font-mono text-cyan-300">-0.005 pu</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0b1929] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider">
            <span>Active Power Balance</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-white font-mono">
            {status?.loadDemandMw ?? 1150} <span className="text-sm font-normal text-slate-400">MW</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Spinning Reserve Margin:</span>
            <span className="font-mono text-emerald-300">18.4%</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0b1929] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider">
            <span>Reactive VAR Loading</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-white font-mono">
            {status?.reactivePowerMvar ?? 145} <span className="text-sm font-normal text-slate-400">MVAr</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Power Factor (cos φ):</span>
            <span className="font-mono text-indigo-300">0.98 lagging</span>
          </div>
        </div>
      </div>

      {/* Channel 1: Frequency Deviation & Rate of Change (ROCOF) */}
      <div className="rounded-2xl border border-slate-800 bg-[#0b1929] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white">System Synchronous Frequency Profile (Hz)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Reference nominal at 50.00 Hz with statutory frequency containment bounds (49.80 - 50.20 Hz).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Continuous Telemetry
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis domain={[49.7, 50.3]} stroke="#64748b" fontSize={11} tickLine={false} unit=" Hz" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#07111f',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc'
                }}
              />
              <ReferenceLine y={50.0} stroke="#38bdf8" strokeDasharray="4 4" label={{ value: '50.00 Hz Nominal', fill: '#38bdf8', fontSize: 10 }} />
              <ReferenceLine y={49.8} stroke="#ef4444" strokeDasharray="2 2" label={{ value: 'UFLS Trigger (49.80)', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine y={50.2} stroke="#f59e0b" strokeDasharray="2 2" label={{ value: 'Over-frequency Trip (50.20)', fill: '#f59e0b', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="frequencyHz"
                name="Grid Frequency"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel 2 & 3: Voltage Profile and Renewable Penetration in 2 Cols */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Voltage Profile */}
        <div className="rounded-2xl border border-slate-800 bg-[#0b1929] p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white">Transmission Bus Voltage Profile (pu)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Normal operating band 0.95 to 1.05 pu per grid code.
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[0.92, 1.08]} stroke="#64748b" fontSize={11} tickLine={false} unit=" pu" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#07111f',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <ReferenceLine y={1.00} stroke="#64748b" strokeDasharray="3 3" />
                <ReferenceLine y={0.95} stroke="#ef4444" strokeDasharray="2 2" label={{ value: 'Lower Statutory', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={1.05} stroke="#f59e0b" strokeDasharray="2 2" label={{ value: 'Upper Statutory', fill: '#f59e0b', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="voltagePu"
                  name="Bus Voltage"
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Renewable Penetration Timeline */}
        <div className="rounded-2xl border border-slate-800 bg-[#0b1929] p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white">Renewable Penetration Percentage (%)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ratio of non-synchronous IBR generation to total instantaneous demand.
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="penetrationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 120]} stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#07111f',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Inertia Watch Limit (70%)', fill: '#f59e0b', fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="penetrationPct"
                  name="Penetration %"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#penetrationGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
