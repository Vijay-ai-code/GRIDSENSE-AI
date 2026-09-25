// =============================================================================
// GridSense AI - Alert Engine Service
// Evaluates grid operational rules against scenarios and predictions to trigger alarms.
// =============================================================================

function evaluateAlerts(scenario, prediction) {
  const alerts = [];
  const freq = Number(scenario.frequency_hz);
  const volt = Number(scenario.voltage_pu);
  const ramp = Number(scenario.renewable_ramp_pct || 0);
  const solar = Number(scenario.solar_mw);
  const wind = Number(scenario.wind_mw);
  const load = Number(scenario.load_mw);
  const totalRen = solar + wind;
  const penetration = load > 0 ? (totalRen / load) * 100 : 0;
  const riskScore = Number(prediction.risk_score);

  // 1. Frequency threshold checks
  if (freq < 49.85 || freq > 50.15) {
    alerts.push({
      severity: 'CRITICAL',
      message: `Critical frequency excursion: ${freq.toFixed(3)} Hz breaches statutory stability limits. Under-Frequency Load Shedding (UFLS) hazard.`,
      related_parameter: 'Frequency'
    });
  } else if (freq < 49.92 || freq > 50.08) {
    alerts.push({
      severity: 'WARNING',
      message: `Frequency deviation detected: ${freq.toFixed(3)} Hz requires primary frequency response governor action.`,
      related_parameter: 'Frequency'
    });
  }

  // 2. Voltage threshold checks (statutory nominal is typically 0.95 - 1.05 pu)
  if (volt < 0.94 || volt > 1.06) {
    alerts.push({
      severity: 'CRITICAL',
      message: `Dangerous bus voltage violation: ${volt.toFixed(3)} pu risks equipment protection trip or localized voltage collapse.`,
      related_parameter: 'Voltage'
    });
  } else if (volt < 0.96 || volt > 1.04) {
    alerts.push({
      severity: 'WARNING',
      message: `Voltage profile (${volt.toFixed(3)} pu) is near statutory margin. Dispatch reactive power support (STATCOM / capacitor banks).`,
      related_parameter: 'Voltage'
    });
  }

  // 3. Ramp rate checks
  if (ramp > 12.0) {
    alerts.push({
      severity: 'WARNING',
      message: `Severe renewable ramping rate (${ramp.toFixed(1)}%/min) exceeds conventional spinning reserve tracking capabilities.`,
      related_parameter: 'Ramp Rate'
    });
  }

  // 4. Renewable overgeneration / penetration checks
  if (penetration > 95.0) {
    alerts.push({
      severity: 'INFO',
      message: `Renewable penetration (${penetration.toFixed(1)}%) dominates grid generation. System rotational inertia is significantly reduced.`,
      related_parameter: 'Penetration'
    });
  }

  // 5. Composite Risk Score Alert
  if (riskScore >= 0.80) {
    alerts.push({
      severity: 'CRITICAL',
      message: `Predicted Composite Stability Risk (${(riskScore * 100).toFixed(1)}%) exceeds emergency intervention threshold.`,
      related_parameter: 'Risk Score'
    });
  } else if (riskScore >= 0.65) {
    alerts.push({
      severity: 'WARNING',
      message: `Predicted Stability Risk is HIGH (${(riskScore * 100).toFixed(1)}%). Elevated monitoring recommended.`,
      related_parameter: 'Risk Score'
    });
  }

  return alerts;
}

module.exports = {
  evaluateAlerts
};
