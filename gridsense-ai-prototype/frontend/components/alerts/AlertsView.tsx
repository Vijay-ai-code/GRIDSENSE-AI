'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';
import { AlertItem, AlertSeverity, AlertStatus } from '../../lib/types';
import { updateAlertStatus } from '../../lib/api';

interface AlertsViewProps {
  alerts: AlertItem[];
  onAlertUpdated?: (updated: AlertItem) => void;
}

export function AlertsView({ alerts, onAlertUpdated }: AlertsViewProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSev = selectedSeverity === 'ALL' || alert.severity === selectedSeverity;
    const matchesStat = selectedStatus === 'ALL' || alert.status === selectedStatus;
    return matchesSev && matchesStat;
  });

  const handleStatusChange = async (id: number, newStatus: AlertStatus) => {
    setProcessingId(id);
    try {
      const updated = await updateAlertStatus(id, newStatus);
      if (onAlertUpdated) {
        onAlertUpdated(updated);
      }
    } catch (err) {
      console.error('Failed to update alert:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'WARNING':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'OPEN':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
      case 'ACKNOWLEDGED':
        return 'text-blue-300 bg-blue-500/10 border-blue-500/30';
      case 'RESOLVED':
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Grid Security & Operational Alerts</h1>
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-mono text-amber-300 border border-amber-500/20">
              DISPATCH NOTIFIER
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Real-time threshold violation alarms, frequency excursions, and voltage regulation notifications.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#0b1929] p-4">
        {/* Severity Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Severity:
          </span>
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                selectedSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-800/80'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Status:</span>
          {['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'].map((stat) => (
            <button
              key={stat}
              onClick={() => setSelectedStatus(stat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                selectedStatus === stat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-800/80'
              }`}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Cards List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-2xl border bg-[#0b1929] p-5 transition-all shadow-md ${
              alert.severity === 'CRITICAL'
                ? 'border-red-500/30 shadow-red-500/5'
                : alert.severity === 'WARNING'
                ? 'border-amber-500/30 shadow-amber-500/5'
                : 'border-slate-800 shadow-cyan-500/5'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded-full px-2.5 py-0.5 font-bold border ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-slate-300 border border-slate-700 font-mono">
                    Parameter: {alert.related_parameter}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 font-medium border ${getStatusBadge(alert.status)}`}>
                    {alert.status}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1 ml-1">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Message */}
                <p className="text-sm font-medium text-slate-200 leading-relaxed max-w-3xl">
                  {alert.message}
                </p>

                {alert.acknowledged_at && (
                  <div className="text-[11px] text-slate-500">
                    Acknowledged by Operator at {new Date(alert.acknowledged_at).toLocaleTimeString()}
                  </div>
                )}
              </div>

              {/* Operator Action Buttons */}
              <div className="flex sm:flex-col gap-2 shrink-0">
                {alert.status === 'OPEN' && (
                  <button
                    onClick={() => handleStatusChange(alert.id, 'ACKNOWLEDGED')}
                    disabled={processingId === alert.id}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Acknowledge</span>
                  </button>
                )}

                {alert.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleStatusChange(alert.id, 'RESOLVED')}
                    disabled={processingId === alert.id}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Resolve</span>
                  </button>
                )}

                {alert.status === 'RESOLVED' && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-[#0b1929] p-12 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
            <div className="text-sm font-semibold text-slate-200">No matching alerts found</div>
            <p className="text-xs text-slate-400">All grid alarms within this filter category are cleared or resolved.</p>
          </div>
        )}
      </div>
    </div>
  );
}
