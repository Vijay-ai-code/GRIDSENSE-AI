# =============================================================================
# GridSense AI - Python ML Prediction Service (FastAPI)
# Exposes prediction inference, engineered feature inspection, and health check.
# =============================================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

from app.preprocessing import GridFeaturePreprocessor
from app.model import GridStabilityModel

app = FastAPI(
    title="GridSense ML Prediction Service",
    version="0.1.0-prototype",
    description="Microservice providing machine-learning stability risk prediction for power systems with renewable integration."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Instantiate preprocessor and model singletons
preprocessor = GridFeaturePreprocessor()
model = GridStabilityModel()

class ScenarioPayload(BaseModel):
    solar: float = Field(default=0.0, ge=0.0, description="Solar generation in MW")
    wind: float = Field(default=0.0, ge=0.0, description="Wind generation in MW")
    load: float = Field(default=1000.0, gt=0.0, description="Load demand in MW")
    voltage: float = Field(default=1.0, ge=0.5, le=1.5, description="Bus voltage in pu")
    frequency: float = Field(default=50.0, ge=45.0, le=65.0, description="Frequency in Hz")
    ramp: float = Field(default=0.0, ge=0.0, le=100.0, description="Renewable ramp rate %/interval")
    reactive: Optional[float] = Field(default=100.0, description="Reactive power in MVAr")
    load_variation: Optional[float] = Field(default=0.0, description="Load variation percentage")

@app.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": "GridSense ML Service",
        "model_loaded": True,
        "algorithm": "RandomForestRegressor",
        "version": "0.1.0-prototype"
    }

@app.post("/predict")
def predict_stability_risk(scenario: ScenarioPayload):
    try:
        data_dict = scenario.model_dump()
        engineered_features, feature_vector = preprocessor.transform_scenario(data_dict)
        prediction = model.predict(engineered_features, feature_vector)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML inference error: {str(e)}")

@app.get("/model-info")
def get_model_info():
    return {
        "model_name": "GridSense Stability Random Forest",
        "version": "0.1.0-prototype",
        "features": model.feature_names,
        "n_estimators": model.model.n_estimators,
        "max_depth": model.model.max_depth,
        "disclaimer": "Academic research prototype. Not certified for transmission utility operations."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
