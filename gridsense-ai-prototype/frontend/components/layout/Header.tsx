'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  Server,
  User
} from 'lucide-react';
import { SystemHealthData } from '../../lib/types';

interface HeaderProps {
  health?: SystemHealthData | null;
  activeAlertsCount?: number;
  onOpenAlerts?: () => void;
}

export function Header({ health, activeAlertsCount = 0, onOpenAlerts }: HeaderProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isMlConnected = health?.services?.python_ml_service?.status === 'CONNECTED';
  const isPostgres = health?.services?.storage?.isPostgres;
  const isGatewayOk = health?.status === 'HEALTHY' || health?.status === 'OK' || true;

  // Determine overall health dot color
  const allHealthy = isGatewayOk && isMlConnected;

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-base)] px-6">
      <div className="flex h-full items-center justify-between gap-4">
        {/* Zone 1: Logo & Demo Mode indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {/* Custom minimalist electrical grid symbol */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--accent)] font-mono font-bold text-xs tracking-tighter">
              GS
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-semibold text-base tracking-tight text-[var(--text-primary)]">
                GridSense
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                AI
              </span>
            </div>
          </div>

          <span className="hidden sm:inline-block text-xs text-[var(--text-tertiary)] font-mono pl-2 border-l border-[var(--border-subtle)]">
            demo mode
          </span>
        </div>

        {/* Zone 2: Empty center-left spacing for clean breathing room */}
        <div className="flex-1" />

        {/* Zone 3: Systems Status Dropdown, Alerts Icon with count, User Avatar */}
        <div className="flex items-center gap-3">
          {/* Systems Status Dropdown */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setPopoverOpen(!popoverOpen)}
              className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)] transition-all duration-200 hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] active:scale-[0.98]"
              aria-label="Toggle system status popover"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  allHealthy ? 'bg-[var(--status-success)]' : 'bg-[var(--status-warning)]'
                }`}
              />
              <span className="font-medium">Systems</span>
              <ChevronDown className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
            </button>

            {popoverOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--border-hover)] bg-[var(--bg-elevated)] p-3 shadow-2xl z-50 animate-fade-up">
                <div className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                  Microservices Status
                </div>

                <div className="space-y-2 text-xs">
                  {/* Gateway */}
                  <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Server className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                      <span>API Gateway</span>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--status-success)] flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> OK :4000
                    </span>
                  </div>

                  {/* ML Microservice */}
                  <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Cpu className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                      <span>Python ML</span>
                    </div>
                    <span
                      className={`font-mono text-[10px] flex items-center gap-1 ${
                        isMlConnected ? 'text-[var(--status-success)]' : 'text-[var(--status-warning)]'
                      }`}
                    >
                      {isMlConnected ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> FASTAPI
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" /> BASELINE
                        </>
                      )}
                    </span>
                  </div>

                  {/* Storage */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Database className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                      <span>Persistence</span>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                      {isPostgres ? 'POSTGRESQL' : 'IN_MEMORY'}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-tertiary)] font-mono">
                  Autonomous physics fallback active
                </div>
              </div>
            )}
          </div>

          {/* Alerts Bell Icon with Count */}
          <button
            onClick={onOpenAlerts}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-all duration-200 hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] active:scale-[0.98]"
            title={`${activeAlertsCount} active contingencies`}
            aria-label="View alerts"
          >
            <Bell className="h-4 w-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-[var(--border-hover)] bg-[var(--bg-elevated)] px-1 font-mono text-[9px] font-semibold text-[var(--accent)]">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
