# =============================================================================
# GridSense AI - ML Feature Preprocessing Pipeline
# Transforms raw grid telemetry into physically meaningful stability indicators.
# =============================================================================

import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

class GridFeaturePreprocessor:
    """
    Extracts physical proxy features from raw electrical measurements:
    - Inverter-based renewable penetration ratio
    - Net demand (residual generation required from synchronous units)
    - Effective system rotational inertia index
    - Frequency & voltage excursions from statutory nominals
    - Dynamic ramping stress
    """

    def __init__(self, base_inertia_constant: float = 5.0):
        self.H_base = base_inertia_constant

    def transform_scenario(self, data: Dict[str, float]) -> Tuple[Dict[str, float], np.ndarray]:
        solar = float(data.get("solar", 0.0))
        wind = float(data.get("wind", 0.0))
        load = float(data.get("load", 1000.0))
        voltage = float(data.get("voltage", 1.0))
        frequency = float(data.get("frequency", 50.0))
        ramp = float(data.get("ramp", 0.0))
        reactive = float(data.get("reactive", 100.0))
        load_var = float(data.get("load_variation", 0.0))

        total_renewable = solar + wind
        penetration = total_renewable / load if load > 0 else 0.0
        net_demand = load - total_renewable
        
        # Nominal frequency detection (50 Hz or 60 Hz)
        nominal_freq = 60.0 if frequency > 55.0 else 50.0
        freq_dev = abs(frequency - nominal_freq)
        volt_dev = abs(voltage - 1.00)

        # Kinetic rotational inertia proxy: non-synchronous generation displaces mechanical inertia
        # When penetration exceeds 50%, the Rate of Change of Frequency (ROCOF) risk accelerates
        estimated_inertia = max(1.0, self.H_base * (1.0 - 0.72 * min(1.2, penetration)))
        
        # Ramp stress relative to typical 15-min spinning reserve ramping limits
        ramp_stress = ramp / 25.0

        engineered = {
            "solar_mw": solar,
            "wind_mw": wind,
            "total_renewable_mw": total_renewable,
            "load_mw": load,
            "net_demand_mw": round(net_demand, 1),
            "renewable_penetration": round(penetration, 4),
            "frequency_deviation": round(freq_dev, 4),
            "voltage_deviation": round(volt_dev, 4),
            "estimated_inertia_s": round(estimated_inertia, 2),
            "ramp_stress": round(ramp_stress, 4),
            "reactive_power_mvar": reactive,
            "load_variation_pct": load_var
        }

        # Vectorized features for scikit-learn model
        feature_vector = np.array([
            freq_dev,
            volt_dev,
            penetration,
            ramp_stress,
            max(0.0, -net_demand) / 1000.0, # Overgeneration magnitude
            reactive / 1000.0,
            load_var / 10.0
        ]).reshape(1, -1)

        return engineered, feature_vector
