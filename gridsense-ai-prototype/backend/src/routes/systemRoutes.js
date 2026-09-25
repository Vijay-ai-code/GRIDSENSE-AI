// =============================================================================
// GridSense AI - System Diagnostics & Health Routes
// Provides status checks for all services and prototype controls.
// =============================================================================

const express = require('express');
const { getDb, getDbStatus } = require('../db');

const router = express.Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://127.0.0.1:8001';

router.get('/health', async (req, res) => {
  const dbStatus = getDbStatus();
  
  // Ping Python ML service
  let mlHealthy = false;
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 1000);
    const mlRes = await fetch(`${ML_SERVICE_URL}/health`, { signal: ctrl.signal });
    clearTimeout(tid);
    mlHealthy = mlRes.ok;
  } catch (err) {
    mlHealthy = false;
  }

  // Ping RAG service
  let ragHealthy = false;
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 1000);
    const ragRes = await fetch(`${RAG_SERVICE_URL}/health`, { signal: ctrl.signal });
    clearTimeout(tid);
    ragHealthy = ragRes.ok;
  } catch (err) {
    ragHealthy = false;
  }

  res.json({
    status: 'ONLINE',
    mode: 'PROTOTYPE',
    timestamp: new Date().toISOString(),
    services: {
      express_api: { status: 'ONLINE', port: process.env.PORT || 4000 },
      storage: {
        status: 'ONLINE',
        mode: dbStatus.type,
        isPostgres: dbStatus.isPostgres,
        fallbackActive: dbStatus.fallbackActive,
        error: dbStatus.connectionError
      },
      python_ml_service: {
        status: mlHealthy ? 'CONNECTED' : 'STANDBY_OR_OFFLINE',
        endpoint: ML_SERVICE_URL,
        fallbackActive: !mlHealthy,
        note: mlHealthy ? 'Inference via Python FastAPI' : 'Using internal physics-guided fallback engine'
      },
      rag_assistant_service: {
        status: ragHealthy ? 'CONNECTED' : 'LOCAL_GROUNDED_RETRIEVER',
        endpoint: RAG_SERVICE_URL,
        note: 'Indexed power-systems corpus active'
      }
    }
  });
});

// POST /api/system/seed - Reset demo state to default seed data
router.post('/seed', async (req, res, next) => {
  try {
    const db = getDb();
    if (typeof db.reset === 'function') {
      db.reset();
      return res.json({ success: true, message: 'In-memory database successfully reset to default demo scenario seed.' });
    }
    res.json({ success: true, message: 'Database reset requested on live database.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
