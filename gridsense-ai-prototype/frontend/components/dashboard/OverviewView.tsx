'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { BentoOverview } from './BentoOverview';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from '../ui/chart';
import { GridStatusSnapshot, GridTimeSeriesPoint, AlertItem } from '../../lib/types';

interface OverviewViewProps {
  status: GridStatusSnapshot | null;
  history: GridTimeSeriesPoint[];
  alerts: AlertItem[];
  onNavigateToTab: (tab: any) => void;
}

// Lightweight animated counter hook
function useAnimatedCount(targetValue: number, decimals: number = 0, duration: number = 800) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(startVal + (targetValue - startVal) * easeProgress);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetValue, duration]);

  return count.toFixed(decimals);
}

// Mini Sparkline component
function Sparkline({ data, stroke = '#A82020' }: { data: number[]; stroke?: string }) {
  const chartData = data.map((val, idx) => ({ i: idx, v: val }));
  return (
    <div className="h-7 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OverviewView({ status, history, alerts, onNavigateToTab }: OverviewViewProps) {
  // Client-side dynamic greeting calculation
  const [greeting, setGreeting] = useState<string>('Good day');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon');
    } else if (hour >= 17 && hour < 22) {
      setGreeting('Good evening');
    } else {
      setGreeting('Good night');
    }
  }, []);

  const stabilityScore = status?.stabilityScore ?? 78;
  const riskLevel = status?.riskLevel ?? 'MODERATE';
  const riskScore = status?.riskScore ?? 0.22;
  const penetration = status?.renewablePenetration ?? 58.4;
  const loadDemand = status?.loadDemandMw ?? 1150;
  const solarGen = status?.solarMw ?? 420;
  const windGen = status?.windMw ?? 252;
  const totalRen = status?.totalRenewableMw ?? 672;
  const netDemand = status?.netDemandMw ?? 478;
  const frequency = status?.frequencyHz ?? 49.982;
  const voltage = status?.voltagePu ?? 0.994;

  // Animated counters
  const animatedStability = useAnimatedCount(stabilityScore, 0);
  const animatedPenetration = useAnimatedCount(penetration, 1);
  const animatedFrequency = useAnimatedCount(frequency, 3);
  const animatedVoltage = useAnimatedCount(voltage, 3);

  // Sparkline data points from history (last 8 points)
  const sparkStability = history.length > 0 ? history.slice(-8).map((h) => h.stabilityScore) : [72, 74, 76, 75, 78, 80, 78, 78];
  const sparkPenetration = history.length > 0 ? history.slice(-8).map((h) => h.penetrationPct) : [45, 52, 58, 62, 65, 60, 58, 58];
  const sparkFrequency = history.length > 0 ? history.slice(-8).map((h) => h.frequencyHz) : [49.95, 49.98, 50.01, 49.99, 49.97, 49.98, 49.98, 49.98];
  const sparkVoltage = history.length > 0 ? history.slice(-8).map((h) => h.voltagePu) : [0.99, 0.992, 0.995, 0.996, 0.994, 0.993, 0.994, 0.994];

  // Risk status indicator dot mapping
  const getRiskStatusDot = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-[var(--accent)]';
      case 'HIGH':
      case 'MODERATE':
        return 'bg-[var(--status-warning)]';
      default:
        return 'bg-[var(--status-success)]';
    }
  };

  // shadcn chart configuration
  const chartConfig: ChartConfig = {
    stabilityScore: {
      label: 'Stability Index (%)',
      color: '#A82020',
    },
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Dynamic Greeting Row with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            {greeting}, Vijay
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Here&apos;s the current operational stability of your grid.
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('Stability Prediction')}
          className="group flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] active:scale-[0.98] self-start sm:self-auto"
        >
          <Zap className="h-3.5 w-3.5 text-[var(--text-tertiary)] transition-colors duration-200 group-hover:text-[var(--accent)]" />
          <span>Run New Prediction</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Overall Grid Stability */}
        <div className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 transition-all duration-200 hover:border-[var(--border-hover)] hover:-translate-y-0.5">
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Overall Grid Stability
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span className={`h-2 w-2 rounded-full ${getRiskStatusDot(riskLevel)}`} />
              <span>{riskLevel} RISK</span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="font-mono-data text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
              {animatedStability}%
            </div>
            <Sparkline data={sparkStability} stroke="#A82020" />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-3">
            <span>Contingency Probability:</span>
            <span className="font-mono text-[var(--text-primary)] font-medium">{riskScore.toFixed(3)}</span>
          </div>
        </div>

        {/* Card 2: Renewable Penetration */}
        <div className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 transition-all duration-200 hover:border-[var(--border-hover)] hover:-translate-y-0.5">
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Renewable Penetration
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span className={`h-2 w-2 rounded-full ${penetration > 60 ? 'bg-[var(--status-warning)]' : 'bg-[var(--status-success)]'}`} />
              <span>{penetration > 60 ? 'HIGH IBR' : 'NORMAL'}</span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="font-mono-data text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
              {animatedPenetration}%
            </div>
            <Sparkline data={sparkPenetration} stroke="#A82020" />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-3">
            <span>Renewable / Load:</span>
            <span className="font-mono text-[var(--text-primary)]">{totalRen} / {loadDemand} MW</span>
          </div>
        </div>

        {/* Card 3: System Frequency */}
        <div className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 transition-all duration-200 hover:border-[var(--border-hover)] hover:-translate-y-0.5">
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              System Frequency
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span
                className={`h-2 w-2 rounded-full ${
                  Math.abs(frequency - 50.0) > 0.05 ? 'bg-[var(--status-warning)]' : 'bg-[var(--status-success)]'
                }`}
              />
              <span>50 Hz NOMINAL</span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="font-mono-data text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
              {animatedFrequency}
              <span className="text-sm font-sans text-[var(--text-tertiary)] ml-1">Hz</span>
            </div>
            <Sparkline data={sparkFrequency} stroke="#A82020" />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-3">
            <span>Nominal Delta:</span>
            <span className="font-mono text-[var(--text-primary)]">
              {(frequency - 50.0) >= 0 ? '+' : ''}{(frequency - 50.0).toFixed(3)} Hz
            </span>
          </div>
        </div>

        {/* Card 4: Bus Voltage Profile */}
        <div className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 transition-all duration-200 hover:border-[var(--border-hover)] hover:-translate-y-0.5">
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Bus Voltage Profile
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--status-success)]" />
              <span>1.000 pu NOM</span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="font-mono-data text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
              {animatedVoltage}
              <span className="text-sm font-sans text-[var(--text-tertiary)] ml-1">pu</span>
            </div>
            <Sparkline data={sparkVoltage} stroke="#A82020" />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-3">
            <span>Statutory Margin:</span>
            <span className="font-mono text-[var(--text-primary)]">0.950 - 1.050 pu</span>
          </div>
        </div>
      </div>

      {/* Main Analytical Section: 24-Hour Stability Chart + Minimalist Alerts Panel */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* 24-Hour Grid Stability Chart (2 Cols) using shadcn ChartContainer */}
        <div className="xl:col-span-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base font-semibold text-[var(--text-primary)]">
                  24-Hour Grid Stability Trend
                </h2>
                <span className="text-[11px] font-mono italic text-[var(--text-tertiary)]">
                  Demo telemetry
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Composite stability index trajectory tracking renewable ramp shifts.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              <span>Stability Index (%)</span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="stabilityGradDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A82020" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#A82020" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} />
                <YAxis domain={[40, 100]} stroke="var(--text-tertiary)" fontSize={11} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area
                  type="monotone"
                  dataKey="stabilityScore"
                  name="Stability Index"
                  stroke="#A82020"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#stabilityGradDark)"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>

        {/* Alerts Panel (1 Col) - Section 9 Specification */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--accent)]" />
                <h2 className="font-heading text-base font-semibold text-[var(--text-primary)]">
                  Active Grid Alerts
                </h2>
              </div>
              <button
                onClick={() => onNavigateToTab('Alerts')}
                className="group text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150 flex items-center gap-1"
              >
                <span className="group-hover:underline">View all</span>
                <ArrowRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Threshold violations and contingency alerts.
            </p>

            <div className="mt-4 space-y-3">
              {alerts.slice(0, 3).map((alert) => {
                // Left border severity color
                const borderColor =
                  alert.severity === 'CRITICAL'
                    ? 'border-l-[var(--accent)]'
                    : alert.severity === 'WARNING'
                    ? 'border-l-[var(--status-warning)]'
                    : 'border-l-[var(--status-info)]';

                return (
                  <div
                    key={alert.id}
                    onClick={() => onNavigateToTab('Alerts')}
                    className={`group cursor-pointer rounded-lg border border-[var(--border-subtle)] border-l-4 ${borderColor} bg-[var(--bg-elevated)] p-3 space-y-1.5 transition-all duration-150 hover:bg-[var(--bg-elevated-hover)] hover:border-[var(--border-hover)]`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] uppercase font-semibold text-[var(--text-secondary)] tracking-wider">
                        {alert.severity} • {alert.related_parameter}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                          {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <ArrowRight className="h-3 w-3 text-[var(--text-tertiary)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:text-[var(--accent)]" />
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                );
              })}

              {alerts.length === 0 && (
                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] p-6 text-center text-xs text-[var(--text-secondary)]">
                  No active alerts. Grid operating conditions are nominal.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/50 p-3 text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--status-success)] shrink-0" />
            <span>Automated alert engine actively evaluating electrical contingencies.</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Section - Section 7 Specification */}
      <BentoOverview
        status={status}
        history={history}
        alerts={alerts}
        onNavigateToTab={onNavigateToTab}
      />
    </div>
  );
}
