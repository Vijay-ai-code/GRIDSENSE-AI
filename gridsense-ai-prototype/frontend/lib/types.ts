// =============================================================================
// GridSense AI - Frontend TypeScript Definitions
// Common data structures across UI dashboards, charts, and API responses.
// =============================================================================

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface GridScenario {
  id?: number;
  scenario_name: string;
  solar_mw: number;
  wind_mw: number;
  load_mw: number;
  voltage_pu: number;
  frequency_hz: number;
  reactive_power_mvar?: number;
  renewable_ramp_pct?: number;
  load_variation_pct?: number;
  notes?: string;
  created_at?: string;
}

export interface ContributingFactors {
  frequency_deviation?: number;
  voltage_deviation?: number;
  renewable_penetration?: number;
  ramp_stress?: number;
  net_demand_mw?: number;
  [key: string]: number | undefined;
}

export interface PredictionResult {
  id: number;
  scenario_id: number;
  risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
  contributing_factors?: ContributingFactors;
  mitigation_notes?: string;
  model_version: string;
  model_status: string;
  created_at: string;
  scenario?: GridScenario;
  alerts?: AlertItem[];
}

export interface AlertItem {
  id: number;
  prediction_id?: number | null;
  severity: AlertSeverity;
  message: string;
  related_parameter: string;
  status: AlertStatus;
  acknowledged_at?: string | null;
  created_at: string;
}

export interface GridStatusSnapshot {
  stabilityScore: number;
  riskScore: number;
  riskLevel: RiskLevel;
  status: string;
  solarMw: number;
  windMw: number;
  totalRenewableMw: number;
  loadDemandMw: number;
  netDemandMw: number;
  renewablePenetration: number;
  frequencyHz: number;
  voltagePu: number;
  activePowerMw: number;
  reactivePowerMvar: number;
  lastUpdated: string;
  isDemo: boolean;
  source: string;
}

export interface GridTimeSeriesPoint {
  time: string;
  hour: number;
  stabilityScore: number;
  solarMw: number;
  windMw: number;
  renewableMw: number;
  loadMw: number;
  netDemandMw: number;
  penetrationPct: number;
  frequencyHz: number;
  voltagePu: number;
  reactivePowerMvar: number;
}

export interface RAGSource {
  id: string;
  documentTitle: string;
  sectionTitle: string;
  snippet: string;
  fullText?: string;
  relevanceScore: number;
}

export interface ChatMessage {
  id?: number | string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: RAGSource[];
  created_at?: string;
}

export interface ModelInfoData {
  modelName: string;
  version: string;
  task: string;
  status: string;
  architecture: string;
  frameworks: string[];
  inputFeatures: { name: string; label: string; unit: string; range: string; description: string }[];
  engineeredFeatures: { name: string; formula: string; interpretation: string }[];
  decisionThresholds: { level: RiskLevel; range: string; status: string; action: string }[];
  trainingDataset: { name: string; status: string; description: string };
  disclaimer: string;
}

export interface SystemHealthData {
  status: string;
  mode: string;
  timestamp: string;
  services: {
    express_api: { status: string; port: number };
    storage: { status: string; mode: string; isPostgres: boolean; fallbackActive: boolean; error: string | null };
    python_ml_service: { status: string; endpoint: string; fallbackActive: boolean; note: string };
    rag_assistant_service: { status: string; endpoint: string; note: string };
  };
}
