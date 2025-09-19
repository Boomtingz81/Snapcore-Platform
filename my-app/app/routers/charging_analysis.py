"""
Snapcore Charge Analytics - FastAPI Router
API endpoints for charging efficiency analysis.
"""

from __future__ import annotations

import logging
import os
import tempfile
from datetime import datetime
from typing import Any, Dict, List, Optional

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from ..services.csv_processor import DataQuality, ProcessingResult, TeslaCSVProcessor
from ..services.efficiency_calculator import ChargingEfficiencyCalculator
from ..models.charging_session import ChargingSessionCreate
from ..models.analysis_result import AnalysisResult
from ..utils.data_validator import validate_csv_file

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/charging", tags=["charging-analysis"])

# --- Services (singleton-ish) ---
csv_processor = TeslaCSVProcessor()
efficiency_calculator = ChargingEfficiencyCalculator()

# --- Constants ---
MAX_UPLOAD_BYTES = 10 * 1024 * 1024 # 10 MB


# ----------- Schemas -----------

class AnalysisRequest(BaseModel):
    """Optional knobs to refine analysis output."""
    include_recommendations: bool = Field(
        default=True, description="Include optimization recommendations"
    )
    rate_structure: Optional[str] = Field(
        default=None, description="Electricity rate structure (peak/off-peak)"
    )
    location_filter: Optional[List[str]] = Field(
        default=None, description="Filter analysis by specific locations (exact match)"
    )
    date_range_start: Optional[datetime] = Field(
        default=None, description="Start date for analysis (ISO 8601)"
    )
    date_range_end: Optional[datetime] = Field(
        default=None, description="End date for analysis (ISO 8601)"
    )


class ProcessingStatus(BaseModel):
    status: str
    progress: float
    message: str
    data_quality: Optional[str] = None
    sessions_processed: Optional[int] = None


# ----------- Endpoints -----------

@router.post("/upload", response_model=Dict[str, Any])
async def upload_charging_data(
    file: UploadFile = File(..., description="Tesla charging data CSV file"),
    analysis_request: AnalysisRequest = Depends(),
) -> Dict[str, Any]:
    """
    Upload and analyze a Tesla charging CSV.

    Accepts:
      - Tesla mobile app exports
      - Tesla web portal downloads
      - Third-party exports (TeslaFi, Teslascope)

    Returns:
      A full efficiency analysis report with optional recommendations.
    """
    # basic filename guard
    if not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be CSV")

    # read once into memory so we can size-check and then write to disk
    try:
        content: bytes = await file.read()
    except Exception as exc:
        logger.exception("Failed to read uploaded file")
        raise HTTPException(status_code=400, detail=f"Cannot read upload: {exc}") from exc

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large (>{MAX_UPLOAD_BYTES // (1024*1024)} MB limit)",
        )

    # save to a temp file for downstream processors
    temp_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
            tmp.write(content)
            temp_path = tmp.name

        # validate CSV structure (fast checks)
        validation_result = validate_csv_file(temp_path)
        if not getattr(validation_result, "valid", False):
            errors = getattr(validation_result, "errors", []) or ["Unknown validation error"]
            raise HTTPException(
                status_code=400,
                detail=f"Invalid CSV: {'; '.join(map(str, errors))}",
            )

        # parse + normalize
        processing_result: ProcessingResult = csv_processor.process_csv(temp_path)

        if not processing_result.success or processing_result.data is None:
            raise HTTPException(
                status_code=422,
                detail={
                    "message": "Failed to process CSV data",
                    "issues": processing_result.issues,
                    "metadata": processing_result.metadata,
                },
            )

        if processing_result.quality == DataQuality.POOR:
            raise HTTPException(
                status_code=422,
                detail={
                    "message": "Data quality too poor for reliable analysis",
                    "quality": processing_result.quality.value,
                    "issues": processing_result.issues,
                    "suggestions": [
                        "Ensure CSV contains complete session rows",
                        "Verify date, energy, and cost columns are present",
                        "Check for consistent formatting (decimal separator, currency, etc.)",
                    ],
                },
            )

        df = processing_result.data

        # apply optional filters
        df = _apply_filters(df, analysis_request)
        if df.empty:
            raise HTTPException(status_code=422, detail="No data after applying filters")

        # compute analysis
        analysis = efficiency_calculator.analyze_efficiency(df)
        report = efficiency_calculator.generate_efficiency_report(analysis)

        # response payload
        return {
            "status": "success",
            "processing": {
                "format_detected": processing_result.metadata.get("format"),
                "original_rows": processing_result.metadata.get("original_rows"),
                "processed_rows": processing_result.metadata.get("processed_rows"),
                "data_quality": processing_result.quality.value,
                "issues": processing_result.issues or [],
            },
            "analysis": report,
            "metadata": {
                "analysis_date": datetime.now().isoformat(),
                "date_range": {
                    "start": processing_result.metadata.get("date_range_start"),
                    "end": processing_result.metadata.get("date_range_end"),
                },
                "total_energy_kwh": processing_result.metadata.get("total_energy_kwh"),
                "total_cost": processing_result.metadata.get("total_cost"),
                "columns_analyzed": processing_result.metadata.get("columns_available", []),
            },
        }

    except HTTPException:
        # bubble up known client/server errors
        raise
    except Exception as exc:
        logger.exception("Unexpected error during /upload")
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}") from exc
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except OSError:
                logger.warning("Temp file cleanup failed: %s", temp_path)


@router.post("/analyze-sessions", response_model=AnalysisResult)
async def analyze_charging_sessions(
    sessions: List[ChargingSessionCreate],
    analysis_request: AnalysisRequest = Depends(),
) -> AnalysisResult:
    """
    Analyze efficiency from structured session objects (no CSV).
    """
    if not sessions:
        raise HTTPException(status_code=400, detail="No charging sessions provided")

    try:
        df = pd.DataFrame([s.dict() for s in sessions])

        # rename to normalized column names expected by the calculator
        df = df.rename(
            columns={
                "date": "session_date",
                "energy_kwh": "energy_added_kwh",
                "cost": "total_cost",
                "location": "location_name",
                "duration_minutes": "charging_duration_minutes",
                "start_soc": "start_soc_percent",
                "end_soc": "end_soc_percent",
                # 'charger_type' is already named as expected if present
            }
        )

        df = _apply_filters(df, analysis_request)
        if df.empty:
            raise HTTPException(status_code=422, detail="No sessions after applying filters")

        analysis = efficiency_calculator.analyze_efficiency(df)
        report = efficiency_calculator.generate_efficiency_report(analysis)

        return AnalysisResult(
            success=True,
            data=report,
            metadata={
                "sessions_analyzed": int(len(df)),
                "analysis_date": datetime.now().isoformat(),
                "filters_applied": {
                    "date_range": bool(analysis_request.date_range_start or analysis_request.date_range_end),
                    "location_filter": bool(analysis_request.location_filter),
                },
            },
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error during /analyze-sessions")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc


@router.get("/supported-formats")
async def get_supported_formats() -> Dict[str, Any]:
    """Describe supported CSV formats and required columns."""
    return {
        "formats": {
            "tesla_mobile": {
                "description": "Tesla mobile app export",
                "required_columns": ["Date", "Energy Added (kWh)", "Cost"],
                "optional_columns": ["Location", "Charger Type", "Starting SOC", "Ending SOC", "Charging Time"],
            },
            "tesla_web": {
                "description": "Tesla web portal export",
                "required_columns": ["Date", "Energy Delivered (kWh)", "Charge Cost"],
                "optional_columns": ["Location Name", "Charger Type", "Charging Time (HH:MM)"],
            },
            "teslafi": {
                "description": "TeslaFi service export",
                "required_columns": ["Date", "kWh", "Cost"],
                "optional_columns": ["Location", "Charger", "Start %", "End %", "Max Power"],
            },
            "generic": {
                "description": "Generic CSV with date, energy (kWh) and cost",
                "required_columns": ["Any date column", "Any energy column (kWh)", "Any cost column"],
                "optional_columns": ["Location", "Charger type", "Duration", "SOC data"],
            },
        },
        "requirements": {
            "file_size_limit": f"{MAX_UPLOAD_BYTES // (1024*1024)}MB",
            "minimum_sessions": 5,
            "required_data": ["Date/time", "Energy delivered (kWh)", "Session cost"],
            "optimal_data": ["Location", "Charger type", "Start/end SOC", "Charging duration"],
        },
        "analysis_capabilities": [
            "Cost efficiency ($/kWh, kWh/$)",
            "Charger type optimization",
            "Location-based efficiency comparison",
            "Temporal usage patterns",
            "SOC optimization recommendations",
            "Cost-savings potential estimate",
        ],
    }


@router.get("/health")
async def health_check() -> Dict[str, str]:
    """Liveness probe."""
    return {"status": "healthy", "service": "charging-analysis", "timestamp": datetime.now().isoformat()}


# ----------- Helpers -----------

def _apply_filters(df: pd.DataFrame, req: AnalysisRequest) -> pd.DataFrame:
    """Apply date-range and location filters (non-mutating)."""
    out = df.copy()

    # date range (UTC-safe, no mutation of original dtype)
    if "session_date" in out.columns and (req.date_range_start or req.date_range_end):
        dts = pd.to_datetime(out["session_date"], errors="coerce", utc=True).dt.tz_convert(None)
        if req.date_range_start:
            out = out[dts >= pd.to_datetime(req.date_range_start, utc=True).tz_convert(None)]
        if req.date_range_end:
            out = out[dts <= pd.to_datetime(req.date_range_end, utc=True).tz_convert(None)]

    # location filter
    if "location_name" in out.columns and req.location_filter:
        out = out[out["location_name"].isin(req.location_filter)]

    return out
