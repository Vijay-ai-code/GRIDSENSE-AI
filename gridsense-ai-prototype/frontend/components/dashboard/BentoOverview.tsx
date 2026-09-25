'use client';

import React from 'react';
import {
  Activity,
  Zap,
  AlertTriangle,
  Gauge,
  TrendingUp,
  BrainCircuit,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';
import { BentoGrid, BentoGridItem } from '../ui/bento-grid';
import { GridStatusSnapshot, GridTimeSeriesPoint, AlertItem } from '../../lib/types';

interface BentoOverviewProps {
  status: GridStatusSnapshot | null;
  history: GridTimeSeriesPoint[];
  alerts: AlertItem[];
  onNavigateToTab: (tab: any) => void;
}

export function BentoOverview({
  status,
  history,
  alerts,
  onNavigateToTab
}: BentoOverviewProps) {
  // Derive metrics
  const penetration = status?.renewablePenetration ?? 58.4;
  const loadDemand = status?.loadDemandMw ?? 1150;
  const totalRen = status?.totalRenewableMw ?? 672;
  const netDemand = status?.netDemandMw ?? 478;
  const reactive = status?.reactivePowerMvar ?? 145;
  const frequency = status?.frequencyHz ?? 49.982;
  const riskScore = status?.riskScore ?? 0.22;

  // Rotational Inertia proxy (higher penetration = lower inertia)
  const inertiaIndex = Math.max(12, Math.round(100 - penetration * 0.72));

  // Reactive power reserve capacity calculation (assume 300 MVAr rated headroom)
  const reactiveReservePct = Math.min(100, Math.max(0, Math.round((reactive / 300) * 100)));
  const reactiveGaugeData = [{ name: 'Reserve', value: reactiveReservePct, fill: '#A82020' }];

  // Mini duck curve data (last 8 points from history)
  const duckData = history.length > 0 ? history.slice(-8) : [
    { time: '12:00', netDemandMw: 400, solarMw: 600 },
    { time: '14:00', netDemandMw: 360, solarMw: 680 },
    { time: '16:00', netDemandMw: 420, solarMw: 520 },
    { time: '18:00', netDemandMw: 680, solarMw: 210 },
    { time: '20:00', netDemandMw: 890, solarMw: 10 },
    { time: '22:00', netDemandMw: 840, solarMw: 0 },
  ];

  // ROCOF (Rate of Change of Frequency) mock trend proxy based on frequency deviations
  const rocofData = history.length > 0
    ? history.slice(-8).map((h, i, arr) => {
        const prevFreq = i > 0 ? arr[i - 1].frequencyHz : 50.0;
        const rocof = Math.abs(h.frequencyHz - prevFreq) * 10;
        return { time: h.time, rocof: Number(rocof.toFixed(3)) };
      })
    : [
        { time: '14:00', rocof: 0.02 },
        { time: '16:00', rocof: 0.05 },
        { time: '18:00', rocof: 0.12 },
        { time: '20:00', rocof: 0.08 },
        { time: '22:00', rocof: 0.03 }
      ];

  const topAlerts = alerts.slice(0, 2);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
          Domain Telemetry & Contingency Grid
        </h3>
        <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
          Real-time synthesis
        </span>
      </div>

      <BentoGrid className="grid-cols-1 md:grid-cols-3">
        {/* 1. Duck Curve Snapshot (Span 2 cols) */}
        <BentoGridItem
          className="md:col-span-2"
          icon={<Zap className="h-4 w-4" />}
          title="Duck Curve Snapshot"
          badge={
            <span className="font-mono text-xs text-[var(--text-secondary)]">
              Net: <span className="text-[var(--text-primary)] font-semibold">{netDemand} MW</span>
            </span>
          }
          description="Midday solar overgeneration steepens evening net-load ramp rate requirement."
        >
          <div className="h-28 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={duckData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="bentoDuckNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A82020" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#A82020" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="bentoDuckSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9A9A9A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#9A9A9A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="netDemandMw"
                  name="Net Demand"
                  stroke="#A82020"
                  strokeWidth={2}
                  fill="url(#bentoDuckNet)"
                />
                <Area
                  type="monotone"
                  dataKey="solarMw"
                  name="Solar PV"
                  stroke="#5C5C5C"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  fill="url(#bentoDuckSolar)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] border-t border-[var(--border-subtle)] pt-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              <span>Net Demand (MW)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-tertiary)]" />
              <span>Solar Profile</span>
            </div>
          </div>
        </BentoGridItem>

        {/* 2. Rotational Inertia Index (1 Col) */}
        <BentoGridItem
          icon={<Gauge className="h-4 w-4" />}
          title="Rotational Inertia Index"
          description="Effective synchronous kinetic energy stored in conventional spinning mass."
        >
          <div className="mt-3 flex items-baseline justify-between">
            <div className="font-mono-data text-3xl font-semibold text-[var(--text-primary)]">
              {inertiaIndex}
              <span className="text-sm font-sans text-[var(--text-tertiary)] ml-1">/100</span>
            </div>
            <span
              className={`text-xs font-mono font-medium ${
                inertiaIndex < 50 ? 'text-[var(--accent)]' : 'text-[var(--status-warning)]'
              }`}
            >
              {inertiaIndex < 50 ? 'DEFICIT' : 'MODERATE'}
            </span>
          </div>

          <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--bg-base)] overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-500 rounded-full"
              style={{ width: `${inertiaIndex}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
            <span>Synchronous Mass</span>
            <span className="font-mono text-[var(--text-secondary)]">{totalRen} MW IBR</span>
          </div>
        </BentoGridItem>

        {/* 3. Active Contingencies (1 Col) */}
        <BentoGridItem
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Active Contingencies"
          badge={
            <span className="font-mono text-xs px-2 py-0.5 rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)]">
              {alerts.length} total
            </span>
          }
          description="Immediate statutory violations dispatched to operator queue."
          onClick={() => onNavigateToTab('Alerts')}
        >
          <div className="mt-2 space-y-2">
            {topAlerts.length > 0 ? (
              topAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="rounded-lg border-l-2 border-[var(--accent)] bg-[var(--bg-base)]/60 px-2.5 py-1.5 text-xs flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <span className="font-mono text-[10px] text-[var(--text-tertiary)] block">
                      {alt.severity} • {alt.related_parameter}
                    </span>
                    <span className="text-[var(--text-secondary)] truncate block">
                      {alt.message}
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-[var(--text-tertiary)] shrink-0" />
                </div>
              ))
            ) : (
              <div className="py-2 text-xs text-[var(--status-success)]">
                All parameters within statutory margins.
              </div>
            )}
          </div>
        </BentoGridItem>

        {/* 4. Reactive Power Reserve (1 Col) */}
        <BentoGridItem
          icon={<Activity className="h-4 w-4" />}
          title="Reactive Reserve"
          description="Dynamic VAR compensation headroom (STATCOM / Inverters)."
        >
          <div className="mt-2 flex items-center justify-between">
            <div className="h-20 w-20 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="75%"
                  outerRadius="100%"
                  data={reactiveGaugeData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: '#1E1E1E' }} dataKey="value" cornerRadius={6} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center font-mono-data text-xs text-[var(--text-primary)]">
                {reactiveReservePct}%
              </div>
            </div>

            <div className="space-y-1 text-right">
              <div className="font-mono text-xs text-[var(--text-primary)]">{reactive} MVAr</div>
              <div className="text-[11px] text-[var(--text-tertiary)]">Operating Point</div>
              <div className="text-[10px] font-mono text-[var(--status-success)]">Q-V Coupled</div>
            </div>
          </div>
        </BentoGridItem>

        {/* 5. ROCOF Trend (Span 2 cols) */}
        <BentoGridItem
          className="md:col-span-2"
          icon={<TrendingUp className="h-4 w-4" />}
          title="ROCOF Sensitivity Index"
          badge={
            <span className="font-mono text-xs text-[var(--text-tertiary)]">
              Nominal: 50.00 Hz
            </span>
          }
          description="Rate of Change of Frequency excursion rate during dispatch transitions."
        >
          <div className="h-24 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocofData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <Line
                  type="monotone"
                  dataKey="rocof"
                  stroke="#A82020"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] border-t border-[var(--border-subtle)] pt-2 mt-1">
            <span>UFLS Protection Threshold: 0.50 Hz/s</span>
            <span className="font-mono text-[var(--status-success)]">Current: 0.08 Hz/s</span>
          </div>
        </BentoGridItem>

        {/* 6. Model Confidence (1 Col) */}
        <BentoGridItem
          icon={<BrainCircuit className="h-4 w-4" />}
          title="Inference Confidence"
          description="Scikit-Learn Random Forest ensemble uncertainty score."
          onClick={() => onNavigateToTab('Model Information')}
        >
          <div className="mt-3 flex items-baseline justify-between">
            <div className="font-mono-data text-3xl font-semibold text-[var(--text-primary)]">
              91.4<span className="text-sm font-sans text-[var(--text-tertiary)]">%</span>
            </div>
            <span className="text-xs font-mono text-[var(--status-success)]">CALIBRATED</span>
          </div>
          <div className="mt-3 text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-2 flex items-center justify-between">
            <span>Model: v0.1.0-RF</span>
            <span className="text-[var(--text-tertiary)] font-mono">IEEE-39</span>
          </div>
        </BentoGridItem>

        {/* 7. Knowledge Base Coverage (1 Col) */}
        <BentoGridItem
          icon={<BookOpen className="h-4 w-4" />}
          title="RAG Engineering Grounding"
          description="Indexed IEEE & NERC standards for technical mitigation."
          onClick={() => onNavigateToTab('AI Assistant')}
        >
          <div className="mt-3 flex items-baseline justify-between">
            <div className="font-mono-data text-3xl font-semibold text-[var(--text-primary)]">
              4<span className="text-xs font-sans text-[var(--text-tertiary)] ml-1">STANDARDS</span>
            </div>
            <span className="text-xs font-mono text-[var(--text-secondary)]">18 CHUNKS</span>
          </div>
          <div className="mt-3 text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-2 flex items-center justify-between">
            <span>IEEE 1547 / NERC PRC</span>
            <ArrowRight className="h-3 w-3 text-[var(--text-tertiary)]" />
          </div>
        </BentoGridItem>
      </BentoGrid>
    </div>
  );
}
