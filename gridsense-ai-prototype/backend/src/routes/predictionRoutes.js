// =============================================================================
// GridSense AI - Prediction Routes
// Handles scenario submission, ML risk prediction, and prediction audit queries.
// =============================================================================

const express = require('express');
const { z } = require('zod');
const { getDb } = require('../db');
const { validateBody } = require('../middleware/validate');
const { predictGridRisk } = require('../services/mlClient');
const { evaluateAlerts } = require('../services/alertEngine');

const router = express.Router();

const scenarioSchema = z.object({
  scenario_name: z.string().max(100).optional().default('Operational Scenario'),
  solar_mw: z.coerce.number().min(0, 'Solar generation must be >= 0 MW'),
  wind_mw: z.coerce.number().min(0, 'Wind generation must be >= 0 MW'),
  load_mw: z.coerce.number().positive('Load demand must be > 0 MW'),
  voltage_pu: z.coerce.number().min(0.5).max(1.5, 'Voltage must be within 0.5 - 1.5 pu'),
  frequency_hz: z.coerce.number().min(45.0).max(65.0, 'Frequency must be within 45.0 - 65.0 Hz'),
  reactive_power_mvar: z.coerce.number().optional().default(100),
  renewable_ramp_pct: z.coerce.number().min(0).max(100).optional().default(0),
  load_variation_pct: z.coerce.number().min(0).max(100).optional().default(0),
  notes: z.string().max(500).optional().default('')
});

// POST /api/predictions - Run stability prediction on grid scenario
router.post('/', validateBody(scenarioSchema), async (req, res, next) => {
  try {
    const db = getDb();
    const scenarioData = req.validatedBody;

    // 1. Persist the operating scenario
    const scenario = await db.createScenario(scenarioData);

    // 2. Call ML Service / physics baseline
    const mlResult = await predictGridRisk(scenario);

    // 3. Persist the prediction result
    const prediction = await db.createPrediction({
      scenario_id: scenario.id,
      risk_score: mlResult.riskScore,
      risk_level: mlResult.riskLevel,
      confidence: mlResult.confidence,
      contributing_factors: mlResult.contributingFactors,
      mitigation_notes: mlResult.mitigationNotes,
      model_version: mlResult.modelVersion,
      model_status: mlResult.modelStatus
    });

    // 4. Run Alert Rule Engine on scenario and prediction
    const generatedAlerts = evaluateAlerts(scenario, prediction);
    const savedAlerts = [];
    for (const alertData of generatedAlerts) {
      const saved = await db.createAlert({
        prediction_id: prediction.id,
        severity: alertData.severity,
        message: alertData.message,
        related_parameter: alertData.related_parameter
      });
      savedAlerts.push(saved);
    }

    res.status(201).json({
      success: true,
      data: {
        scenario,
        prediction: {
          ...prediction,
          scenario
        },
        alerts: savedAlerts
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/predictions - List previous predictions with optional filtering
router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const limit = Number(req.query.limit) || 50;
    const riskLevel = req.query.riskLevel || null;

    const list = await db.getPredictions({ limit, riskLevel });
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/predictions/:id - Retrieve detailed prediction scenario and alerts
router.get('/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const id = Number(req.params.id);
    const item = await db.getPredictionById(id);

    if (!item) {
      return res.status(404).json({ error: 'NotFound', message: `Prediction #${id} not found.` });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
