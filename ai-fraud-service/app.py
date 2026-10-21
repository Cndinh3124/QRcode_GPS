from __future__ import annotations

import hmac
import os
import tempfile
from pathlib import Path
from typing import Annotated
from uuid import uuid4

import joblib
import numpy as np
from fastapi import Depends, FastAPI, Header, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sklearn.ensemble import IsolationForest


FEATURE_NAMES = (
    "seconds_from_event_start",
    "distance_ratio",
    "participant_checkins_24h",
    "shared_device_accounts_30m",
)
MINIMUM_TRAINING_ROWS = 30
MODEL_PATH = Path(os.getenv("MODEL_PATH", "/var/lib/ai-fraud/model.joblib"))
SERVICE_TOKEN = os.getenv("AI_SERVICE_TOKEN", "")

app = FastAPI(title="QR Check-in Anomaly Scorer", version="1.0.0")
model_state: dict | None = None


class FeatureVector(BaseModel):
    model_config = ConfigDict(extra="forbid")

    seconds_from_event_start: float = Field(ge=-31_536_000, le=31_536_000)
    distance_ratio: float = Field(ge=0, le=100_000)
    participant_checkins_24h: int = Field(ge=0, le=100_000)
    shared_device_accounts_30m: int = Field(ge=0, le=100_000)

    def as_row(self) -> list[float]:
        return [float(getattr(self, name)) for name in FEATURE_NAMES]


class TrainRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rows: list[FeatureVector] = Field(min_length=MINIMUM_TRAINING_ROWS, max_length=20_000)
    feature_version: str = Field(min_length=1, max_length=64)


class ScoreRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    features: FeatureVector
    feature_version: str = Field(min_length=1, max_length=64)


def require_internal_token(
    authorization: Annotated[str | None, Header()] = None,
) -> None:
    if not SERVICE_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service authentication is not configured",
        )
    expected = f"Bearer {SERVICE_TOKEN}"
    if not authorization or not hmac.compare_digest(authorization, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


def load_model() -> dict | None:
    if not MODEL_PATH.is_file():
        return None
    try:
        return joblib.load(MODEL_PATH)
    except (OSError, ValueError, EOFError):
        return None


model_state = load_model()


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {"status": "ok", "model_ready": model_state is not None}


@app.post("/internal/v1/train", dependencies=[Depends(require_internal_token)])
def train(request: TrainRequest) -> dict[str, str | int]:
    global model_state

    matrix = np.asarray([row.as_row() for row in request.rows], dtype=np.float64)
    if not np.isfinite(matrix).all():
        raise HTTPException(status_code=400, detail="Training data contains non-finite values")

    model = IsolationForest(
        n_estimators=200,
        contamination="auto",
        random_state=42,
        n_jobs=1,
    )
    model.fit(matrix)
    reference_scores = np.sort(model.score_samples(matrix))
    trained = {
        "model": model,
        "reference_scores": reference_scores,
        "feature_version": request.feature_version,
        "model_version": str(uuid4()),
        "training_rows": len(request.rows),
    }

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    temp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(dir=MODEL_PATH.parent, delete=False) as temp_file:
            temp_path = Path(temp_file.name)
        joblib.dump(trained, temp_path)
        os.replace(temp_path, MODEL_PATH)
    finally:
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)

    model_state = trained
    return {
        "model_version": trained["model_version"],
        "training_rows": trained["training_rows"],
        "feature_version": trained["feature_version"],
    }


@app.post("/internal/v1/score", dependencies=[Depends(require_internal_token)])
def score(request: ScoreRequest) -> dict[str, str | float | list[str]]:
    if model_state is None:
        raise HTTPException(status_code=409, detail="MODEL_NOT_READY")
    if request.feature_version != model_state["feature_version"]:
        raise HTTPException(status_code=409, detail="FEATURE_VERSION_MISMATCH")

    row = np.asarray([request.features.as_row()], dtype=np.float64)
    raw_score = float(model_state["model"].score_samples(row)[0])
    reference = model_state["reference_scores"]
    normal_percentile = float(np.searchsorted(reference, raw_score, side="right") / len(reference))
    anomaly_score = float(np.clip(1.0 - normal_percentile, 0.0, 1.0))
    risk_level = "HIGH" if anomaly_score >= 0.98 else "MEDIUM" if anomaly_score >= 0.90 else "LOW"

    reasons: list[str] = []
    if request.features.distance_ratio >= 0.9:
        reasons.append("NEAR_GEOFENCE_EDGE")
    if request.features.participant_checkins_24h >= 3:
        reasons.append("PARTICIPANT_MULTI_EVENT_ACTIVITY")
    if request.features.shared_device_accounts_30m >= 3:
        reasons.append("SHARED_DEVICE_MULTIPLE_ACCOUNTS")

    return {
        "anomaly_score": anomaly_score,
        "risk_level": risk_level,
        "raw_score": raw_score,
        "reasons": reasons,
        "model_version": model_state["model_version"],
        "feature_version": model_state["feature_version"],
        "score_semantics": "empirical anomaly percentile; not a fraud probability",
    }
