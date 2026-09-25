// =============================================================================
// GridSense AI - Model Information & Transparency Routes
// Provides architectural documentation, pipeline metadata, and feature specifications.
// =============================================================================

const express = require('express');

const router = express.Router();

router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      modelName: 'GridSense Stability Ensemble',
      version: 'v0.1.0-prototype',
      task: 'Grid Stability Risk Prediction for Inverter-Based Renewable Integration',
      status: 'PROTOTYPE',
      architecture: 'Physics-Guided Random Forest Regressor + Dynamic Heuristic Rule Engine',
      frameworks: ['Scikit-learn', 'Pandas', 'NumPy', 'FastAPI'],
      inputFeatures: [
        { name: 'solar_mw', label: 'Solar Generation', unit: 'MW', range: '0 - 2000 MW', description: 'Real active power output from solar PV farms' },
        { name: 'wind_mw', label: 'Wind Generation', unit: 'MW', range: '0 - 2000 MW', description: 'Real active power output from wind turbine installations' },
        { name: 'load_mw', label: 'Load Demand', unit: 'MW', range: '100 - 5000 MW', description: 'Total instantaneous power demand across interconnected balancing area' },
        { name: 'voltage_pu', label: 'Bus Voltage', unit: 'pu', range: '0.80 - 1.20 pu', description: 'Per-unit transmission bus voltage (1.00 pu = nominal 400kV/230kV)' },
        { name: 'frequency_hz', label: 'Grid Frequency', unit: 'Hz', range: '48.0 - 52.0 Hz', description: 'Synchronous grid frequency (50.0 Hz nominal in Europe/India, 60.0 Hz in US)' },
        { name: 'reactive_power_mvar', label: 'Reactive Power', unit: 'MVAr', range: '-500 to +1000 MVAr', description: 'Net reactive power flow needed to sustain transmission voltage profiles' },
        { name: 'renewable_ramp_pct', label: 'Renewable Ramp Rate', unit: '%/interval', range: '0 - 30 %/min', description: 'Rate of change in aggregate renewable generation over 15-minute interval' }
      ],
      engineeredFeatures: [
        { name: 'renewable_penetration', formula: '(Solar + Wind) / Load Demand', interpretation: 'Measures displacement of synchronous generators by non-synchronous inverters' },
        { name: 'net_demand_mw', formula: 'Load Demand - (Solar + Wind)', interpretation: 'Residual demand that must be served by conventional dispatchable generation' },
        { name: 'inertia_index', formula: 'H_base * (1.0 - 0.70 * Penetration)', interpretation: 'Approximates system kinetic rotational energy and ROCOF vulnerability' },
        { name: 'frequency_deviation', formula: '|Frequency - Nominal Frequency|', interpretation: 'Direct indicator of instantaneous generation-load active power mismatch' },
        { name: 'voltage_deviation', formula: '|Voltage - 1.00 pu|', interpretation: 'Direct indicator of reactive power imbalance or transmission line stress' }
      ],
      decisionThresholds: [
        { level: 'LOW', range: '0.00 - 0.34', status: 'Stable', action: 'Standard economic dispatch and spinning reserve monitoring' },
        { level: 'MODERATE', range: '0.35 - 0.64', status: 'Elevated Monitoring', action: 'Prepare fast-ramping units; monitor tie-line thermal limits' },
        { level: 'HIGH', range: '0.65 - 0.79', status: 'High Risk Alert', action: 'Dispatch active spinning reserves; activate BESS frequency regulation' },
        { level: 'CRITICAL', range: '0.80 - 1.00', status: 'Severe Contingency Risk', action: 'Issue emergency generation re-dispatch; prepare renewable curtailment' }
      ],
      trainingDataset: {
        name: 'IEEE 39-Bus New England System (Augmented Synthetic Cases)',
        status: 'Placeholder / Synthetic baseline',
        description: 'Derived from benchmark IEEE transmission topologies with synthetic PV and DFIG wind profiles.'
      },
      disclaimer: 'ACADEMIC PROTOTYPE NOTICE: Risk scores and thresholds are modeled for prototype demonstration and educational evaluation. They do not constitute certified transmission system operator telemetry.'
    }
  });
});

module.exports = router;
