-- =============================================================================
-- GridSense AI - Database Seed Script (PostgreSQL)
-- Provides realistic baseline operational scenarios, predictions, and alerts.
-- =============================================================================

INSERT INTO model_versions (version, algorithm, dataset_name, metrics, status)
VALUES
('v0.1.0-prototype', 'RandomForest + Physics-informed Heuristic Ensemble', 'IEEE 39-Bus New England Power System (Synthetic Augmentation)', '{"f1_score": 0.912, "accuracy": 0.934, "auc_roc": 0.958}', 'ACTIVE')
ON CONFLICT (version) DO NOTHING;

-- Seed Scenarios
INSERT INTO grid_scenarios (id, scenario_name, solar_mw, wind_mw, load_mw, voltage_pu, frequency_hz, reactive_power_mvar, renewable_ramp_pct, load_variation_pct, notes)
VALUES
(1, 'Nominal Steady-State Grid', 420.0, 260.0, 1100.0, 1.002, 50.012, 115.0, 2.1, 1.2, 'Balanced operating condition during mild afternoon.'),
(2, 'Solar Ramp Overgeneration (Duck Curve)', 890.0, 310.0, 1050.0, 1.035, 50.145, 185.0, 14.5, 3.4, 'Midday solar peak resulting in net demand trough.'),
(3, 'Sudden Wind Drop with Peak Load', 120.0, 85.0, 1380.0, 0.962, 49.885, 290.0, 18.2, 5.8, 'Evening peak load coupled with sudden offshore wind deceleration.'),
(4, 'Voltage Depression Scenario', 540.0, 410.0, 1220.0, 0.941, 49.930, 380.0, 6.4, 2.1, 'Insufficient local VAR support causing voltage sag.')
ON CONFLICT (id) DO NOTHING;

-- Seed Predictions
INSERT INTO predictions (id, scenario_id, risk_score, risk_level, confidence, contributing_factors, mitigation_notes, model_version, model_status)
VALUES
(1, 1, 0.185, 'LOW', 0.92, 
 '{"frequency_deviation": 0.012, "voltage_deviation": 0.002, "renewable_penetration": 0.618, "ramp_stress": 0.074}',
 'Normal grid stability state. Adequate rotational inertia and nominal voltage regulation.',
 'v0.1.0-prototype', 'demo_verified'),

(2, 2, 0.742, 'HIGH', 0.88,
 '{"frequency_deviation": 0.145, "voltage_deviation": 0.035, "renewable_penetration": 1.142, "ramp_stress": 0.508}',
 'High overgeneration risk. Recommend activating BESS charging and initiating solar inverter curtailment.',
 'v0.1.0-prototype', 'demo_verified'),

(3, 3, 0.820, 'CRITICAL', 0.89,
 '{"frequency_deviation": 0.115, "voltage_deviation": 0.038, "renewable_penetration": 0.148, "ramp_stress": 0.637}',
 'Severe frequency droop hazard and low generation reserve. Dispatch fast-start peaker gas turbines.',
 'v0.1.0-prototype', 'demo_verified'),

(4, 4, 0.535, 'MODERATE', 0.86,
 '{"frequency_deviation": 0.070, "voltage_deviation": 0.059, "renewable_penetration": 0.778, "ramp_stress": 0.224}',
 'Voltage approaching lower statutory limit (0.95 pu). Engage capacitor banks and STATCOM reactive compensation.',
 'v0.1.0-prototype', 'demo_verified')
ON CONFLICT (id) DO NOTHING;

-- Seed Alerts
INSERT INTO alerts (id, prediction_id, severity, message, related_parameter, status)
VALUES
(1, 3, 'CRITICAL', 'Under-frequency alert: 49.885 Hz exceeds primary frequency response threshold.', 'Frequency', 'OPEN'),
(2, 2, 'WARNING', 'Steep renewable ramp rate (14.5%/interval) exceeds flexibility ramping limit.', 'Ramp Rate', 'OPEN'),
(3, 4, 'WARNING', 'Bus voltage sag (0.941 pu) below standard operating margin (0.950 pu).', 'Voltage', 'ACKNOWLEDGED'),
(4, 1, 'INFO', 'System operating parameters nominal; reserve margins adequate.', 'Status', 'RESOLVED')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence IDs
SELECT setval('grid_scenarios_id_seq', (SELECT MAX(id) FROM grid_scenarios));
SELECT setval('predictions_id_seq', (SELECT MAX(id) FROM predictions));
SELECT setval('alerts_id_seq', (SELECT MAX(id) FROM alerts));
