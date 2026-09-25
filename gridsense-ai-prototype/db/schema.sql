-- =============================================================================
-- GridSense AI - Database Schema DDL (PostgreSQL)
-- Defines persistence models for scenarios, ML predictions, alerts, and RAG chats.
-- =============================================================================

-- 1. Users table (for future authentication & role-based grid operations)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'GRID_OPERATOR', -- 'ADMIN', 'GRID_OPERATOR', 'ANALYST'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Grid Scenarios table (captures operational electrical conditions)
CREATE TABLE IF NOT EXISTS grid_scenarios (
    id BIGSERIAL PRIMARY KEY,
    scenario_name VARCHAR(100) DEFAULT 'Manual Scenario',
    solar_mw NUMERIC(10, 2) NOT NULL,
    wind_mw NUMERIC(10, 2) NOT NULL,
    load_mw NUMERIC(10, 2) NOT NULL,
    voltage_pu NUMERIC(6, 4) NOT NULL,           -- Per-unit voltage (nominal: 1.00 pu)
    frequency_hz NUMERIC(6, 3) NOT NULL,         -- System frequency in Hz (nominal: 50.00 or 60.00 Hz)
    reactive_power_mvar NUMERIC(10, 2) NOT NULL, -- Reactive power in MVAr
    renewable_ramp_pct NUMERIC(6, 2) NOT NULL,   -- Ramp rate % per interval
    load_variation_pct NUMERIC(6, 2) DEFAULT 0,  -- Load fluctuation %
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Model Versions table (tracks registered ML models and metadata)
CREATE TABLE IF NOT EXISTS model_versions (
    id BIGSERIAL PRIMARY KEY,
    version VARCHAR(100) UNIQUE NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    dataset_name TEXT NOT NULL,
    metrics JSONB,                               -- e.g. {"accuracy": 0.94, "f1": 0.92, "roc_auc": 0.96}
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'DEPRECATED', 'PROTOTYPE'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Predictions table (results from the ML service and business interpretation rules)
CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    scenario_id BIGINT NOT NULL REFERENCES grid_scenarios(id) ON DELETE CASCADE,
    risk_score NUMERIC(5, 4) NOT NULL,           -- Continuous risk score [0.0000 - 1.0000]
    risk_level VARCHAR(20) NOT NULL,             -- 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
    confidence NUMERIC(5, 4) DEFAULT 0.85,       -- Model prediction confidence
    contributing_factors JSONB,                  -- Top features driving the risk score
    mitigation_notes TEXT,                       -- Advisory operational recommendations
    model_version VARCHAR(100) DEFAULT 'v0.1.0-prototype',
    model_status VARCHAR(50) DEFAULT 'prototype', -- 'active_ml', 'demo_fallback', 'prototype'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Alerts table (generated system warnings, threshold breaches, and risk notifications)
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    prediction_id BIGINT REFERENCES predictions(id) ON DELETE SET NULL,
    severity VARCHAR(20) NOT NULL,               -- 'INFO', 'WARNING', 'CRITICAL'
    message TEXT NOT NULL,
    related_parameter VARCHAR(50),               -- 'Frequency', 'Voltage', 'Ramp Rate', 'Penetration'
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',  -- 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Chat Sessions table (for the AI Knowledge & RAG Assistant)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL DEFAULT 'Grid Consultation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Chat Messages table (stores conversation turns and retrieved literature sources)
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,                   -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    sources JSONB,                               -- Retrieved document citations [{title, section, score}]
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_grid_scenarios_created ON grid_scenarios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_created ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_scenario ON predictions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status_severity ON alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at ASC);
