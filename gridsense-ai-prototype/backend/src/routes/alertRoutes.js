// =============================================================================
// GridSense AI - Alerts Management Routes
// Handles alert querying, filtering, and operator acknowledgment.
// =============================================================================

const express = require('express');
const { z } = require('zod');
const { getDb } = require('../db');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

const updateAlertSchema = z.object({
  status: z.enum(['OPEN', 'ACKNOWLEDGED', 'RESOLVED'])
});

// GET /api/alerts - List all alerts with optional filtering
router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const { status, severity, limit } = req.query;

    const alerts = await db.getAlerts({
      status: status || null,
      severity: severity || null,
      limit: limit ? Number(limit) : 50
    });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/alerts/:id - Acknowledge or resolve an alert
router.patch('/:id', validateBody(updateAlertSchema), async (req, res, next) => {
  try {
    const db = getDb();
    const id = Number(req.params.id);
    const { status } = req.validatedBody;

    const updated = await db.updateAlertStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'NotFound', message: `Alert #${id} not found.` });
    }

    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
