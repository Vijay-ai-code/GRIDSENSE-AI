// =============================================================================
// GridSense AI - Grid Telemetry & Monitoring Routes
// Serves real-time status snapshots and time-series telemetry trends.
// =============================================================================

const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// Generate deterministic 24-hour historical telemetry series
function generateGridTimeSeries() {
  const points = [];
  const now = new Date();
  
  // Base daily curve modeling Duck Curve phenomenon
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 3600000);
    const hour = timestamp.getHours();
    
    // Solar generation peaks at midday (11:00 - 14:00)
    let solar = 0;
    if (hour >= 6 && hour <= 18) {
      const solarCurve = Math.sin(((hour - 6) / 12) * Math.PI);
      solar = Math.round(solarCurve * 750 + Math.sin(i) * 25);
    }
    
    // Wind generation tends higher at night and evening
    const wind = Math.round(250 + Math.cos((hour / 24) * 2 * Math.PI) * 120 + ((i % 3) * 15));
    
    // Load demand has morning and evening peaks (typical dual-peak load curve)
    const baseLoad = 850;
    const morningPeak = Math.exp(-Math.pow(hour - 9, 2) / 8) * 350;
    const eveningPeak = Math.exp(-Math.pow(hour - 19, 2) / 6) * 550;
    const load = Math.round(baseLoad + morningPeak + eveningPeak + ((i % 2) * 20));
    
    const totalRenewable = solar + wind;
    const netDemand = load - totalRenewable;
    const penetration = Number(((totalRenewable / load) * 100).toFixed(1));
    
    // Frequency exhibits slight dips during high ramp transitions
    const freqDev = (solar > 500 && hour === 12) ? 0.08 : (hour === 19 ? -0.09 : (Math.sin(i) * 0.02));
    const frequency = Number((50.00 + freqDev).toFixed(3));
    
    // Voltage stays around 0.98 - 1.02 pu
    const voltage = Number((1.00 + (solar > 600 ? 0.02 : 0) - (load > 1200 ? 0.025 : 0)).toFixed(3));
    
    // Stability score calculated from stress indicators
    const stabilityScore = Math.round(Math.max(45, Math.min(95, 88 - (penetration > 70 ? (penetration - 70) * 0.5 : 0) - Math.abs(freqDev) * 100)));

    points.push({
      time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hour,
      stabilityScore,
      solarMw: solar,
      windMw: wind,
      renewableMw: totalRenewable,
      loadMw: load,
      netDemandMw: netDemand,
      penetrationPct: penetration,
      frequencyHz: frequency,
      voltagePu: voltage,
      reactivePowerMvar: Math.round(120 + (load * 0.15))
    });
  }

  return points;
}

// GET /api/grid/status - Snapshot of current grid operational state
router.get('/status', async (req, res, next) => {
  try {
    const db = getDb();
    const predictions = await db.getPredictions({ limit: 1 });
    const latestPred = predictions[0] || null;

    // Use latest scenario if available, otherwise default nominal baseline
    const solar = latestPred?.scenario ? Number(latestPred.scenario.solar_mw) : 620.0;
    const wind = latestPred?.scenario ? Number(latestPred.scenario.wind_mw) : 280.0;
    const load = latestPred?.scenario ? Number(latestPred.scenario.load_mw) : 1150.0;
    const voltage = latestPred?.scenario ? Number(latestPred.scenario.voltage_pu) : 0.995;
    const frequency = latestPred?.scenario ? Number(latestPred.scenario.frequency_hz) : 49.982;
    const reactive = latestPred?.scenario ? Number(latestPred.scenario.reactive_power_mvar) : 145.0;
    const totalRenewable = solar + wind;
    const netDemand = load - totalRenewable;
    const penetration = load > 0 ? Number(((totalRenewable / load) * 100).toFixed(1)) : 0;

    const riskScore = latestPred ? Number(latestPred.risk_score) : 0.24;
    const riskLevel = latestPred ? latestPred.risk_level : 'LOW';

    res.json({
      success: true,
      data: {
        stabilityScore: Math.round((1 - riskScore) * 100),
        riskScore,
        riskLevel,
        status: riskLevel === 'CRITICAL' ? 'EMERGENCY_DISPATCH' : (riskLevel === 'HIGH' ? 'ACTIVE_MONITORING' : 'OPTIMAL'),
        solarMw: solar,
        windMw: wind,
        totalRenewableMw: totalRenewable,
        loadDemandMw: load,
        netDemandMw: netDemand,
        renewablePenetration: penetration,
        frequencyHz: frequency,
        voltagePu: voltage,
        activePowerMw: load,
        reactivePowerMvar: reactive,
        lastUpdated: new Date().toISOString(),
        isDemo: true,
        source: 'GridSense Telemetry Engine (Demo Mode)'
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/grid/history - Time-series trend data for charts
router.get('/history', (req, res) => {
  const series = generateGridTimeSeries();
  res.json({
    success: true,
    count: series.length,
    data: series,
    isDemo: true
  });
});

module.exports = router;
