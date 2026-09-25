'use client';

import React from 'react';
import {
  LayoutDashboard,
  Gauge,
  Activity,
  History,
  AlertTriangle,
  Bot,
  ShieldCheck,
  Settings
} from 'lucide-react';

export type NavTab = 
  | 'Overview'
  | 'Stability Prediction'
  | 'Grid Monitoring'
  | 'Prediction History'
  | 'Alerts'
  | 'AI Assistant'
  | 'Model Information'
  | 'Settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openAlertsCount: number;
}

const navItems: { name: NavTab; icon: React.ElementType; badge?: boolean }[] = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Stability Prediction', icon: Gauge },
  { name: 'Grid Monitoring', icon: Activity },
  { name: 'Prediction History', icon: History },
  { name: 'Alerts', icon: AlertTriangle, badge: true },
  { name: 'AI Assistant', icon: Bot },
  { name: 'Model Information', icon: ShieldCheck },
  { name: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab, openAlertsCount }: SidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-[var(--border-subtle)] bg-[var(--bg-base)] p-4 min-h-screen">
      <div className="space-y-6">
        {/* Workspace Brand Label */}
        <div className="px-3 pt-2">
          <div className="font-heading text-xs font-semibold tracking-wider text-[var(--text-tertiary)] uppercase">
            Operations Console
          </div>
          <div className="text-sm font-medium text-[var(--text-primary)] mt-0.5">
            Balancing Area Dispatch
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;

            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`group w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-all duration-200 rounded-lg text-left active:scale-[0.99] ${
                  isActive
                    ? 'border-l-2 border-[var(--accent)] text-[var(--text-primary)] bg-[rgba(168,32,32,0.06)]'
                    : 'border-l-2 border-transparent text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    strokeWidth={1.5}
                    className={`h-4 w-4 transition-colors duration-200 ${
                      isActive
                        ? 'text-[var(--accent)]'
                        : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && openAlertsCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-1.5 font-mono text-[10px] font-semibold text-[var(--accent)]">
                    {openAlertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Technical Spec Box */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 space-y-1.5 text-left">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
          <span>Engine Status</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-success)]" />
        </div>
        <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Decoupled telemetry & contingency scoring.
        </div>
        <div className="pt-1 text-[10px] font-mono text-[var(--text-tertiary)]">
          IEEE-39 System Calibrated
        </div>
      </div>
    </aside>
  );
}
