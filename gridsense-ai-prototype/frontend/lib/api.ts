// =============================================================================
// GridSense AI - Centralized Frontend API Client
// Handles data transport between Next.js UI and the Express backend gateway.
// =============================================================================

import {
  GridStatusSnapshot,
  GridTimeSeriesPoint,
  PredictionResult,
  GridScenario,
  AlertItem,
  ChatMessage,
  ModelInfoData,
  SystemHealthData,
  RiskLevel
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function safeFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });

    if (!res.ok) {
      let errMsg = `Request failed with status ${res.status}`;
      try {
        const errorJson = await res.json();
        errMsg = errorJson.message || errorJson.error || errMsg;
      } catch (_) {}
      throw new Error(errMsg);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err: any) {
    console.warn(`[API] Failed to fetch ${endpoint}:`, err.message);
    throw err;
  }
}

// 1. Grid Telemetry & Status
export async function getGridStatus(): Promise<GridStatusSnapshot> {
  return safeFetch<GridStatusSnapshot>('/grid/status');
}

export async function getGridHistory(): Promise<GridTimeSeriesPoint[]> {
  return safeFetch<GridTimeSeriesPoint[]>('/grid/history');
}

// 2. Predictions
export async function submitPrediction(scenario: GridScenario): Promise<{
  scenario: GridScenario;
  prediction: PredictionResult;
  alerts: AlertItem[];
}> {
  return safeFetch('/predictions', {
    method: 'POST',
    body: JSON.stringify(scenario)
  });
}

export async function getPredictions(riskLevel?: string): Promise<PredictionResult[]> {
  const query = riskLevel && riskLevel !== 'ALL' ? `?riskLevel=${riskLevel}` : '';
  return safeFetch<PredictionResult[]>(`/predictions${query}`);
}

export async function getPredictionById(id: number): Promise<PredictionResult> {
  return safeFetch<PredictionResult>(`/predictions/${id}`);
}

// 3. Alerts
export async function getAlerts(status?: string, severity?: string): Promise<AlertItem[]> {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);
  if (severity && severity !== 'ALL') params.append('severity', severity);
  const query = params.toString() ? `?${params.toString()}` : '';
  return safeFetch<AlertItem[]>(`/alerts${query}`);
}

export async function updateAlertStatus(id: number, status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'): Promise<AlertItem> {
  return safeFetch<AlertItem>(`/alerts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

// 4. RAG Assistant
export async function queryAssistant(query: string, sessionId: string = 'web_session'): Promise<{
  answer: string;
  sources: any[];
  mode: string;
}> {
  return safeFetch('/assistant/query', {
    method: 'POST',
    body: JSON.stringify({ query, sessionId })
  });
}

export async function getAssistantDocuments(): Promise<any[]> {
  return safeFetch('/assistant/documents');
}

export async function getAssistantHistory(sessionId: string = 'web_session'): Promise<ChatMessage[]> {
  return safeFetch(`/assistant/history?sessionId=${sessionId}`);
}

// 5. Model Information
export async function getModelInfo(): Promise<ModelInfoData> {
  return safeFetch<ModelInfoData>('/model/info');
}

// 6. System Diagnostics
export async function getSystemHealth(): Promise<SystemHealthData> {
  return safeFetch<SystemHealthData>('/health');
}

export async function resetDemoSeed(): Promise<{ success: boolean; message: string }> {
  return safeFetch('/system/seed', { method: 'POST' });
}
