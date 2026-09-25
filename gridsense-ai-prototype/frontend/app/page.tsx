'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar, NavTab } from '../components/layout/Sidebar';
import { OverviewView } from '../components/dashboard/OverviewView';
import { PredictionView } from '../components/prediction/PredictionView';
import { MonitoringView } from '../components/monitoring/MonitoringView';
import { HistoryView } from '../components/history/HistoryView';
import { AlertsView } from '../components/alerts/AlertsView';
import { AssistantView } from '../components/assistant/AssistantView';
import { ModelInfoView } from '../components/model/ModelInfoView';
import { SettingsView } from '../components/settings/SettingsView';

import {
  getGridStatus,
  getGridHistory,
  getPredictions,
  getAlerts,
  getSystemHealth
} from '../lib/api';
import {
  GridStatusSnapshot,
  GridTimeSeriesPoint,
  PredictionResult,
  AlertItem,
  SystemHealthData
} from '../lib/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('Overview');
  const [status, setStatus] = useState<GridStatusSnapshot | null>(null);
  const [history, setHistory] = useState<GridTimeSeriesPoint[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load all initial grid state from Express API
  const refreshAllData = useCallback(async () => {
    try {
      const [st, hist, preds, alts, hlth] = await Promise.allSettled([
        getGridStatus(),
        getGridHistory(),
        getPredictions(),
        getAlerts(),
        getSystemHealth()
      ]);

      if (st.status === 'fulfilled') setStatus(st.value);
      if (hist.status === 'fulfilled') setHistory(hist.value);
      if (preds.status === 'fulfilled') setPredictions(preds.value);
      if (alts.status === 'fulfilled') setAlerts(alts.value);
      if (hlth.status === 'fulfilled') setHealth(hlth.value);
    } catch (err) {
      console.warn('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
    // Poll telemetry snapshot periodically (every 15s)
    const interval = setInterval(() => {
      getGridStatus().then(setStatus).catch(() => {});
      getAlerts().then(setAlerts).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  // Handler for newly submitted prediction
  const handlePredictionComplete = (newPred: PredictionResult, newAlerts: AlertItem[]) => {
    setPredictions((prev) => [newPred, ...prev]);
    if (newAlerts && newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev]);
    }
    // Update live status snapshot with latest prediction
    getGridStatus().then(setStatus).catch(() => {});
  };

  // Handler for updated alert (e.g. acknowledged or resolved)
  const handleAlertUpdated = (updatedAlert: AlertItem) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === updatedAlert.id ? updatedAlert : a))
    );
  };

  const openAlertsCount = alerts.filter((a) => a.status === 'OPEN').length;

  return (
    <div className="min-h-screen flex bg-[var(--bg-base)] text-[var(--text-primary)] font-body selection:bg-[var(--accent)] selection:text-white">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAlertsCount={openAlertsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          health={health}
          activeAlertsCount={openAlertsCount}
          onOpenAlerts={() => setActiveTab('Alerts')}
        />

        {/* Mobile / Tablet Horizontal Navigation Scroll */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--bg-base)] px-4 py-2">
          {(
            [
              'Overview',
              'Stability Prediction',
              'Grid Monitoring',
              'Prediction History',
              'Alerts',
              'AI Assistant',
              'Model Information',
              'Settings'
            ] as NavTab[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition duration-150 ${
                activeTab === tab
                  ? 'border-b-2 border-[var(--accent)] text-[var(--text-primary)] bg-[rgba(168,32,32,0.06)]'
                  : 'text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Body */}
        <main className="flex-1 p-5 md:p-8 max-w-[1600px] w-full mx-auto">
          {activeTab === 'Overview' && (
            <OverviewView
              status={status}
              history={history}
              alerts={alerts}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'Stability Prediction' && (
            <PredictionView onPredictionComplete={handlePredictionComplete} />
          )}

          {activeTab === 'Grid Monitoring' && (
            <MonitoringView history={history} status={status} />
          )}

          {activeTab === 'Prediction History' && (
            <HistoryView predictions={predictions} />
          )}

          {activeTab === 'Alerts' && (
            <AlertsView alerts={alerts} onAlertUpdated={handleAlertUpdated} />
          )}

          {activeTab === 'AI Assistant' && <AssistantView />}

          {activeTab === 'Model Information' && <ModelInfoView />}

          {activeTab === 'Settings' && (
            <SettingsView
              health={health}
              onRefreshHealth={refreshAllData}
              onDataReset={refreshAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
