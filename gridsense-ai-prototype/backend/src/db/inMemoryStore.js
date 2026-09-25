// =============================================================================
// GridSense AI - In-Memory Repository Store
// Provides a zero-dependency, resilient persistence layer for prototype demonstration.
// Can be swapped seamlessly with PostgreSQL in production.
// =============================================================================

const defaultScenarios = [
  {
    id: 1,
    scenario_name: 'Nominal Steady-State Grid',
    solar_mw: 420.0,
    wind_mw: 260.0,
    load_mw: 1100.0,
    voltage_pu: 1.002,
    frequency_hz: 50.012,
    reactive_power_mvar: 115.0,
    renewable_ramp_pct: 2.1,
    load_variation_pct: 1.2,
    notes: 'Balanced operating condition during mild afternoon.',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 2,
    scenario_name: 'Solar Ramp Overgeneration (Duck Curve)',
    solar_mw: 890.0,
    wind_mw: 310.0,
    load_mw: 1050.0,
    voltage_pu: 1.035,
    frequency_hz: 50.145,
    reactive_power_mvar: 185.0,
    renewable_ramp_pct: 14.5,
    load_variation_pct: 3.4,
    notes: 'Midday solar peak resulting in net demand trough.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 3,
    scenario_name: 'Sudden Wind Drop with Peak Load',
    solar_mw: 120.0,
    wind_mw: 85.0,
    load_mw: 1380.0,
    voltage_pu: 0.962,
    frequency_hz: 49.885,
    reactive_power_mvar: 290.0,
    renewable_ramp_pct: 18.2,
    load_variation_pct: 5.8,
    notes: 'Evening peak load coupled with sudden offshore wind deceleration.',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 4,
    scenario_name: 'Voltage Depression Scenario',
    solar_mw: 540.0,
    wind_mw: 410.0,
    load_mw: 1220.0,
    voltage_pu: 0.941,
    frequency_hz: 49.930,
    reactive_power_mvar: 380.0,
    renewable_ramp_pct: 6.4,
    load_variation_pct: 2.1,
    notes: 'Insufficient local VAR support causing voltage sag.',
    created_at: new Date(Date.now() - 1800000).toISOString()
  }
];

const defaultPredictions = [
  {
    id: 1,
    scenario_id: 1,
    risk_score: 0.185,
    risk_level: 'LOW',
    confidence: 0.92,
    contributing_factors: {
      frequency_deviation: 0.012,
      voltage_deviation: 0.002,
      renewable_penetration: 0.618,
      ramp_stress: 0.074
    },
    mitigation_notes: 'Normal grid stability state. Adequate rotational inertia and nominal voltage regulation.',
    model_version: 'v0.1.0-prototype',
    model_status: 'demo_verified',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 2,
    scenario_id: 2,
    risk_score: 0.742,
    risk_level: 'HIGH',
    confidence: 0.88,
    contributing_factors: {
      frequency_deviation: 0.145,
      voltage_deviation: 0.035,
      renewable_penetration: 1.142,
      ramp_stress: 0.508
    },
    mitigation_notes: 'High overgeneration risk. Recommend activating BESS charging and initiating solar inverter curtailment.',
    model_version: 'v0.1.0-prototype',
    model_status: 'demo_verified',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 3,
    scenario_id: 3,
    risk_score: 0.820,
    risk_level: 'CRITICAL',
    confidence: 0.89,
    contributing_factors: {
      frequency_deviation: 0.115,
      voltage_deviation: 0.038,
      renewable_penetration: 0.148,
      ramp_stress: 0.637
    },
    mitigation_notes: 'Severe frequency droop hazard and low generation reserve. Dispatch fast-start peaker gas turbines.',
    model_version: 'v0.1.0-prototype',
    model_status: 'demo_verified',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 4,
    scenario_id: 4,
    risk_score: 0.535,
    risk_level: 'MODERATE',
    confidence: 0.86,
    contributing_factors: {
      frequency_deviation: 0.070,
      voltage_deviation: 0.059,
      renewable_penetration: 0.778,
      ramp_stress: 0.224
    },
    mitigation_notes: 'Voltage approaching lower statutory limit (0.95 pu). Engage capacitor banks and STATCOM reactive compensation.',
    model_version: 'v0.1.0-prototype',
    model_status: 'demo_verified',
    created_at: new Date(Date.now() - 1800000).toISOString()
  }
];

const defaultAlerts = [
  {
    id: 1,
    prediction_id: 3,
    severity: 'CRITICAL',
    message: 'Under-frequency alert: 49.885 Hz exceeds primary frequency response threshold.',
    related_parameter: 'Frequency',
    status: 'OPEN',
    acknowledged_at: null,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    prediction_id: 2,
    severity: 'WARNING',
    message: 'Steep renewable ramp rate (14.5%/interval) exceeds flexibility ramping limit.',
    related_parameter: 'Ramp Rate',
    status: 'OPEN',
    acknowledged_at: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 3,
    prediction_id: 4,
    severity: 'WARNING',
    message: 'Bus voltage sag (0.941 pu) below standard operating margin (0.950 pu).',
    related_parameter: 'Voltage',
    status: 'ACKNOWLEDGED',
    acknowledged_at: new Date(Date.now() - 900000).toISOString(),
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 4,
    prediction_id: 1,
    severity: 'INFO',
    message: 'System operating parameters nominal; reserve margins adequate.',
    related_parameter: 'Status',
    status: 'RESOLVED',
    acknowledged_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];

class InMemoryStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.scenarios = JSON.parse(JSON.stringify(defaultScenarios));
    this.predictions = JSON.parse(JSON.stringify(defaultPredictions));
    this.alerts = JSON.parse(JSON.stringify(defaultAlerts));
    this.chatMessages = [];
    this.nextScenarioId = 5;
    this.nextPredictionId = 5;
    this.nextAlertId = 5;
    this.nextChatId = 1;
  }

  // Scenarios
  async getScenarios() {
    return [...this.scenarios].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async getScenarioById(id) {
    return this.scenarios.find(s => s.id === Number(id)) || null;
  }

  async createScenario(data) {
    const scenario = {
      id: this.nextScenarioId++,
      scenario_name: data.scenario_name || `Scenario #${this.nextScenarioId - 1}`,
      solar_mw: Number(data.solar_mw),
      wind_mw: Number(data.wind_mw),
      load_mw: Number(data.load_mw),
      voltage_pu: Number(data.voltage_pu),
      frequency_hz: Number(data.frequency_hz),
      reactive_power_mvar: Number(data.reactive_power_mvar || 100),
      renewable_ramp_pct: Number(data.renewable_ramp_pct || 0),
      load_variation_pct: Number(data.load_variation_pct || 0),
      notes: data.notes || '',
      created_at: new Date().toISOString()
    };
    this.scenarios.unshift(scenario);
    return scenario;
  }

  // Predictions
  async getPredictions({ limit = 50, riskLevel = null } = {}) {
    let list = this.predictions.map(pred => {
      const scenario = this.scenarios.find(s => s.id === pred.scenario_id);
      return {
        ...pred,
        scenario: scenario || null
      };
    });

    if (riskLevel && riskLevel !== 'ALL') {
      list = list.filter(p => p.risk_level === riskLevel);
    }

    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list.slice(0, limit);
  }

  async getPredictionById(id) {
    const pred = this.predictions.find(p => p.id === Number(id));
    if (!pred) return null;
    const scenario = this.scenarios.find(s => s.id === pred.scenario_id);
    const relatedAlerts = this.alerts.filter(a => a.prediction_id === pred.id);
    return {
      ...pred,
      scenario,
      alerts: relatedAlerts
    };
  }

  async createPrediction(data) {
    const prediction = {
      id: this.nextPredictionId++,
      scenario_id: Number(data.scenario_id),
      risk_score: Number(data.risk_score),
      risk_level: data.risk_level,
      confidence: Number(data.confidence || 0.88),
      contributing_factors: data.contributing_factors || {},
      mitigation_notes: data.mitigation_notes || '',
      model_version: data.model_version || 'v0.1.0-prototype',
      model_status: data.model_status || 'prototype',
      created_at: new Date().toISOString()
    };
    this.predictions.unshift(prediction);
    return prediction;
  }

  // Alerts
  async getAlerts({ status = null, severity = null, limit = 50 } = {}) {
    let list = [...this.alerts];
    if (status && status !== 'ALL') {
      list = list.filter(a => a.status === status);
    }
    if (severity && severity !== 'ALL') {
      list = list.filter(a => a.severity === severity);
    }
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list.slice(0, limit);
  }

  async createAlert(data) {
    const alert = {
      id: this.nextAlertId++,
      prediction_id: data.prediction_id ? Number(data.prediction_id) : null,
      severity: data.severity,
      message: data.message,
      related_parameter: data.related_parameter || 'General',
      status: 'OPEN',
      acknowledged_at: null,
      created_at: new Date().toISOString()
    };
    this.alerts.unshift(alert);
    return alert;
  }

  async updateAlertStatus(id, newStatus) {
    const alert = this.alerts.find(a => a.id === Number(id));
    if (!alert) return null;
    alert.status = newStatus;
    if (newStatus === 'ACKNOWLEDGED' || newStatus === 'RESOLVED') {
      alert.acknowledged_at = new Date().toISOString();
    }
    return alert;
  }

  // AI Chat Messages
  async addChatMessage({ sessionId = 'default', role, content, sources = [] }) {
    const msg = {
      id: this.nextChatId++,
      session_id: sessionId,
      role,
      content,
      sources,
      created_at: new Date().toISOString()
    };
    this.chatMessages.push(msg);
    return msg;
  }

  async getChatHistory(sessionId = 'default') {
    return this.chatMessages.filter(m => m.session_id === sessionId);
  }
}

module.exports = new InMemoryStore();
