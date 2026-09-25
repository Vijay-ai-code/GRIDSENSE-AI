// =============================================================================
// GridSense AI - PostgreSQL Storage Implementation
// Implements the repository interface against a live PostgreSQL instance.
// =============================================================================

const { Pool } = require('pg');

class PostgresStore {
  constructor(connectionString) {
    this.pool = new Pool({
      connectionString: connectionString || process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  async testConnection() {
    const client = await this.pool.connect();
    try {
      const res = await client.query('SELECT NOW()');
      return !!res.rows[0];
    } finally {
      client.release();
    }
  }

  // Scenarios
  async getScenarios() {
    const res = await this.pool.query(
      'SELECT * FROM grid_scenarios ORDER BY created_at DESC LIMIT 100'
    );
    return res.rows;
  }

  async getScenarioById(id) {
    const res = await this.pool.query('SELECT * FROM grid_scenarios WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async createScenario(data) {
    const query = `
      INSERT INTO grid_scenarios (
        scenario_name, solar_mw, wind_mw, load_mw, voltage_pu,
        frequency_hz, reactive_power_mvar, renewable_ramp_pct, load_variation_pct, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      data.scenario_name || 'Operational Scenario',
      data.solar_mw,
      data.wind_mw,
      data.load_mw,
      data.voltage_pu,
      data.frequency_hz,
      data.reactive_power_mvar || 100,
      data.renewable_ramp_pct || 0,
      data.load_variation_pct || 0,
      data.notes || ''
    ];
    const res = await this.pool.query(query, values);
    return res.rows[0];
  }

  // Predictions
  async getPredictions({ limit = 50, riskLevel = null } = {}) {
    let query = `
      SELECT p.*, 
             row_to_json(s.*) as scenario
      FROM predictions p
      LEFT JOIN grid_scenarios s ON p.scenario_id = s.id
    `;
    const params = [];

    if (riskLevel && riskLevel !== 'ALL') {
      params.push(riskLevel);
      query += ` WHERE p.risk_level = $${params.length}`;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const res = await this.pool.query(query, params);
    return res.rows;
  }

  async getPredictionById(id) {
    const predQuery = `
      SELECT p.*, row_to_json(s.*) as scenario
      FROM predictions p
      LEFT JOIN grid_scenarios s ON p.scenario_id = s.id
      WHERE p.id = $1;
    `;
    const predRes = await this.pool.query(predQuery, [id]);
    if (!predRes.rows[0]) return null;

    const alertQuery = 'SELECT * FROM alerts WHERE prediction_id = $1 ORDER BY created_at DESC;';
    const alertRes = await this.pool.query(alertQuery, [id]);

    return {
      ...predRes.rows[0],
      alerts: alertRes.rows
    };
  }

  async createPrediction(data) {
    const query = `
      INSERT INTO predictions (
        scenario_id, risk_score, risk_level, confidence,
        contributing_factors, mitigation_notes, model_version, model_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      data.scenario_id,
      data.risk_score,
      data.risk_level,
      data.confidence || 0.88,
      JSON.stringify(data.contributing_factors || {}),
      data.mitigation_notes || '',
      data.model_version || 'v0.1.0-prototype',
      data.model_status || 'prototype'
    ];
    const res = await this.pool.query(query, values);
    return res.rows[0];
  }

  // Alerts
  async getAlerts({ status = null, severity = null, limit = 50 } = {}) {
    let query = 'SELECT * FROM alerts WHERE 1=1';
    const params = [];

    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (severity && severity !== 'ALL') {
      params.push(severity);
      query += ` AND severity = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const res = await this.pool.query(query, params);
    return res.rows;
  }

  async createAlert(data) {
    const query = `
      INSERT INTO alerts (prediction_id, severity, message, related_parameter, status)
      VALUES ($1, $2, $3, $4, 'OPEN')
      RETURNING *;
    `;
    const values = [
      data.prediction_id || null,
      data.severity,
      data.message,
      data.related_parameter || 'General'
    ];
    const res = await this.pool.query(query, values);
    return res.rows[0];
  }

  async updateAlertStatus(id, newStatus) {
    const query = `
      UPDATE alerts
      SET status = $1,
          acknowledged_at = CASE WHEN $1 IN ('ACKNOWLEDGED', 'RESOLVED') THEN NOW() ELSE acknowledged_at END
      WHERE id = $2
      RETURNING *;
    `;
    const res = await this.pool.query(query, [newStatus, id]);
    return res.rows[0] || null;
  }

  // AI Chat Messages
  async addChatMessage({ sessionId, role, content, sources = [] }) {
    const query = `
      INSERT INTO chat_messages (session_id, role, content, sources)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const res = await this.pool.query(query, [sessionId, role, content, JSON.stringify(sources)]);
    return res.rows[0];
  }

  async getChatHistory(sessionId) {
    const query = 'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC;';
    const res = await this.pool.query(query, [sessionId]);
    return res.rows;
  }
}

module.exports = PostgresStore;
