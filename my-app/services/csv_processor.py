"""
Snapcore Charge Analytics - CSV Processor (refined)
Robust parser/normalizer for Tesla charging exports (app, web, TeslaFi, generic).
"""

from __future__ import annotations

import io
import gzip
import logging
import re
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd

log = logging.getLogger(__name__)
log.addHandler(logging.NullHandler())


# ---------- Public types ----------

class DataQuality(Enum):
    EXCELLENT = "excellent" # >95% complete
    GOOD = "good" # >85% complete
    FAIR = "fair" # >70% complete
    POOR = "poor" # <70% complete


@dataclass(frozen=True)
class ProcessingResult:
    success: bool
    data: Optional[pd.DataFrame]
    quality: DataQuality
    issues: List[str]
    metadata: Dict[str, Union[str, int, float, List[str]]]


# ---------- Processor ----------

class TeslaCSVProcessor:
    """
    Process Tesla charging CSVs from multiple sources.

    Notes:
      • Accepts path-like or file-like objects.
      • Auto-detects delimiter/encoding; supports .csv and .csv.gz.
      • Produces a normalized schema used by the rest of the pipeline.
    """

    # Standard column mappings
    COLUMN_MAPPINGS: Dict[str, Dict[str, str]] = {
        "tesla_mobile": {
            "Date": "session_date",
            "Location": "location_name",
            "Charger Type": "charger_type",
            "Energy Added (kWh)": "energy_added_kwh",
            "Charging Time": "charging_duration",
            "Cost": "total_cost",
            "Starting SOC": "start_soc_percent",
            "Ending SOC": "end_soc_percent",
        },
        "tesla_web": {
            "Date": "session_date",
            "Time": "session_time",
            "Location Name": "location_name",
            "Address": "location_address",
            "Charger Type": "charger_type",
            "Connector Type": "connector_type",
            "Energy Delivered (kWh)": "energy_added_kwh",
            "Charging Time (HH:MM)": "charging_duration",
            "Charge Cost": "total_cost",
            "Vehicle": "vehicle_name",
        },
        "teslafi": {
            "Date": "session_date",
            "Start Time": "start_time",
            "End Time": "end_time",
            "Location": "location_name",
            "Charger": "charger_type",
            "kWh": "energy_added_kwh",
            "Cost": "total_cost",
            "Start %": "start_soc_percent",
            "End %": "end_soc_percent",
            "Max Power": "max_power_kw",
            "Avg Power": "avg_power_kw",
        },
    }

    REQUIRED_COLUMNS = ["session_date", "energy_added_kwh", "total_cost"]
    OPTIONAL_COLUMNS = [
        "start_soc_percent",
        "end_soc_percent",
        "charging_duration",
        "location_name",
        "charger_type",
        "max_power_kw",
        "avg_power_kw",
        "session_time",
        "start_time",
        "end_time",
        "location_address",
        "connector_type",
        "vehicle_name",
        "charging_duration_minutes",
    ]

    # --------- Public API ---------

    def process_csv(self, source: Union[str, Path, io.BytesIO, io.StringIO]) -> ProcessingResult:
        """
        Parse, normalize, validate, and summarize a CSV.

        Parameters
        ----------
        source : str | Path | file-like
            Path to a CSV/.gz file or a file-like object.

        Returns
        -------
        ProcessingResult
        """
        try:
            df_raw = self._read_csv_safely(source)
            if df_raw.empty:
                return self._fail(["File contains no rows"], {"rows_processed": 0})

            fmt = self._detect_format(df_raw)
            log.info("Detected CSV format: %s", fmt)

            df = self._normalize_columns(df_raw, fmt)
            # Early structure report (useful if we bail out)
            structure_meta = {"format": fmt, "original_columns": list(df_raw.columns)}

            ok, issues = self._validate_structure(df)
            if not ok:
                return self._fail(issues, {**structure_meta, "rows_processed": 0})

            df = self._clean_data(df)

            quality = self._assess_data_quality(df)
            metadata = {
                **structure_meta,
                "original_rows": int(len(df_raw)),
                "processed_rows": int(len(df)),
                "columns_available": list(df.columns),
                "date_range_start": self._safe_iso(df.get("session_date"), "min"),
                "date_range_end": self._safe_iso(df.get("session_date"), "max"),
                "total_energy_kwh": float(df["energy_added_kwh"].sum())
                if "energy_added_kwh" in df.columns and not df["energy_added_kwh"].empty
                else 0.0,
                "total_cost": float(df["total_cost"].sum())
                if "total_cost" in df.columns and not df["total_cost"].empty
                else 0.0,
            }

            return ProcessingResult(True, df, quality, issues, metadata)

        except Exception as e:
            log.exception("CSV processing failed")
            return ProcessingResult(
                success=False,
                data=None,
                quality=DataQuality.POOR,
                issues=[f"Processing error: {e}"],
                metadata={"error": str(e)},
            )

    # --------- IO helpers ---------

    def _read_csv_safely(self, source: Union[str, Path, io.BytesIO, io.StringIO]) -> pd.DataFrame:
        """Read CSV with delimiter/encoding heuristics and gzip support."""
        # Open path-like
        if isinstance(source, (str, Path)):
            p = Path(source)
            if not p.exists():
                raise FileNotFoundError(f"No such file: {p}")
            if p.suffix == ".gz":
                with gzip.open(p, "rt", encoding="utf-8", errors="ignore") as f:
                    return pd.read_csv(f, sep=None, engine="python")
            return pd.read_csv(p, sep=None, engine="python", encoding="utf-8", errors="ignore")

        # File-like (bytes or text)
        if isinstance(source, io.BytesIO):
            try:
                # try gzip
                return pd.read_csv(gzip.open(source, "rt"), sep=None, engine="python")
            except OSError:
                source.seek(0)
                return pd.read_csv(io.TextIOWrapper(source, encoding="utf-8", errors="ignore"),
                                   sep=None, engine="python")

        if isinstance(source, io.StringIO):
            return pd.read_csv(source, sep=None, engine="python")

        raise TypeError("Unsupported source type")

    # --------- Detection/normalization ---------

    def _detect_format(self, df: pd.DataFrame) -> str:
        cols = set(df.columns)

        if {"Energy Added (kWh)", "Starting SOC"} <= cols:
            return "tesla_mobile"
        if {"Energy Delivered (kWh)", "Charge Cost"} <= cols:
            return "tesla_web"
        if {"kWh", "Start %", "End %"} <= cols:
            return "teslafi"

        # Generic sniff (energy + cost)
        energy = any(any(k in c.lower() for k in ("kwh", "energy", "delivered", "added")) for c in cols)
        cost = any(any(k in c.lower() for k in ("cost", "price", "fee", "charge")) for c in cols)
        if energy and cost:
            return "generic"

        raise ValueError("Unrecognized CSV format; headers do not match expected patterns")

    def _normalize_columns(self, df: pd.DataFrame, fmt: str) -> pd.DataFrame:
        if fmt in self.COLUMN_MAPPINGS:
            return df.rename(columns=self.COLUMN_MAPPINGS[fmt]).copy()
        return self._fuzzy_map(df)

    def _fuzzy_map(self, df: pd.DataFrame) -> pd.DataFrame:
        mapping: Dict[str, str] = {}
        cols = list(df.columns)

        def first_match(patterns: List[str]) -> Optional[str]:
            for pat in patterns:
                for c in cols:
                    if re.search(pat, c, re.IGNORECASE) and c not in mapping:
                        return c
            return None

        # energy
        c = first_match([r"kwh", r"energy", r"delivered", r"added"])
        if c: mapping[c] = "energy_added_kwh"
        # cost
        c = first_match([r"cost", r"price", r"fee", r"charge\s*cost"])
        if c: mapping[c] = "total_cost"
        # date/time
        c = first_match([r"\bdate\b", r"session\s*date", r"\btime\b"])
        if c: mapping[c] = "session_date"
        # SOC
        c = first_match([r"start\s*%|starting\s*soc"])
        if c: mapping[c] = "start_soc_percent"
        c = first_match([r"end\s*%|ending\s*soc"])
        if c: mapping[c] = "end_soc_percent"
        # duration
        c = first_match([r"duration|charging\s*time"])
        if c: mapping[c] = "charging_duration"
        # location
        c = first_match([r"location\s*name|location"])
        if c: mapping[c] = "location_name"

        return df.rename(columns=mapping).copy()

    # --------- Validation/Cleaning ---------

    def _validate_structure(self, df: pd.DataFrame) -> Tuple[bool, List[str]]:
        issues: List[str] = []

        missing = [c for c in self.REQUIRED_COLUMNS if c not in df.columns]
        if missing:
            issues.append(f"Missing required columns: {missing}")
            return False, issues

        if len(df) == 0:
            return False, ["No data rows found"]

        return True, issues

    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        d = df.copy()

        # Dates
        if "session_date" in d:
            d["session_date"] = pd.to_datetime(d["session_date"], errors="coerce", utc=False)
        for tcol in ("session_time", "start_time", "end_time"):
            if tcol in d:
                d[tcol] = pd.to_datetime(d[tcol], errors="coerce").dt.time

        # Numerics: energy + cost + power
        if "energy_added_kwh" in d:
            d["energy_added_kwh"] = self._to_number(d["energy_added_kwh"])
            d = d[d["energy_added_kwh"] > 0]

        if "total_cost" in d:
            d["total_cost"] = self._to_currency(d["total_cost"])
            d = d[d["total_cost"] >= 0]

        for pcol in ("max_power_kw", "avg_power_kw"):
            if pcol in d:
                d[pcol] = self._to_number(d[pcol])

        # SOC
        for soc in ("start_soc_percent", "end_soc_percent"):
            if soc in d:
                d[soc] = self._to_percent(d[soc]).clip(0, 100)

        # Duration -> minutes
        if "charging_duration" in d:
            d["charging_duration_minutes"] = self._duration_to_minutes(d["charging_duration"])

        # Location tidy
        if "location_name" in d:
            d["location_name"] = (
                d["location_name"].astype(str).str.strip().replace({"": pd.NA, "nan": pd.NA, "NaN": pd.NA})
            )

        # De-dup (same date+energy+cost)
        subset = [c for c in ("session_date", "energy_added_kwh", "total_cost") if c in d]
        if len(subset) == 3:
            d = d.drop_duplicates(subset=subset, keep="first", ignore_index=True)

        return d

    # --------- Quality ---------

    def _assess_data_quality(self, df: pd.DataFrame) -> DataQuality:
        if df.empty:
            return DataQuality.POOR

        # completeness per column in required/optional sets
        def completeness(cols: List[str]) -> float:
            present = [c for c in cols if c in df.columns]
            if not present:
                return 0.0
            return float(np.mean([df[c].notna().mean() for c in present]))

        req = completeness(self.REQUIRED_COLUMNS)
        opt = completeness(self.OPTIONAL_COLUMNS)
        overall = 0.7 * req + 0.3 * opt

        if overall >= 0.95:
            return DataQuality.EXCELLENT
        if overall >= 0.85:
            return DataQuality.GOOD
        if overall >= 0.70:
            return DataQuality.FAIR
        return DataQuality.POOR

    # --------- Scalar parsers ---------

    @staticmethod
    def _to_number(series: pd.Series) -> pd.Series:
        # Remove thousands separators and non-numeric tails/heads
        s = series.astype(str).str.replace(r"[^\d\.\-eE,]", "", regex=True)
        # If commas look like thousands sep (1,234.56), strip commas; if they look decimal (e.g. 12,5), replace with dot
        # Heuristic: if a value has both comma and dot => commas are thousands
        has_both = s.str.contains(",", na=False) & s.str.contains(r"\.", na=False)
        s = s.where(~has_both, s.str.replace(",", "", regex=False))
        # Otherwise treat comma as decimal separator
        s = s.where(has_both, s.str.replace(",", ".", regex=False))
        return pd.to_numeric(s, errors="coerce")

    @staticmethod
    def _to_currency(series: pd.Series) -> pd.Series:
        s = series.astype(str)
        # Remove currency symbols and spaces
        s = s.str.replace(r"[^\d,.\-]", "", regex=True)
        return TeslaCSVProcessor._to_number(s)

    @staticmethod
    def _to_percent(series: pd.Series) -> pd.Series:
        s = series.astype(str).str.replace(r"[%\s]", "", regex=True)
        vals = pd.to_numeric(s, errors="coerce")
        # If obviously 0-1 scale, scale up
        needs_scale = (vals.notna()) & (vals <= 1.0)
        vals = vals.where(~needs_scale, vals * 100.0)
        return vals

    @staticmethod
    def _duration_to_minutes(series: pd.Series) -> pd.Series:
        def parse_one(x: object) -> Optional[float]:
            if pd.isna(x):
                return None
            s = str(x).strip().lower()

            # HH:MM or H:MM
            if ":" in s:
                try:
                    h, m = s.split(":")[:2]
                    return int(h) * 60 + int(re.sub(r"[^\d]", "", m) or 0)
                except Exception:
                    pass

            # e.g. "1h 30m", "2h", "90m", "90 min", "1.5h"
            m = re.search(r"(?:(\d+(?:\.\d+)?)\s*h)", s)
            if m:
                hours = float(m.group(1))
                mm = re.search(r"(\d+(?:\.\d+)?)\s*m", s)
                minutes = float(mm.group(1)) if mm else 0.0
                return hours * 60.0 + minutes

            mm = re.search(r"(\d+(?:\.\d+)?)\s*m(in)?\b", s)
            if mm:
                return float(mm.group(1))

            # numeric value => assume minutes
            try:
                return float(s)
            except Exception:
                return None

        return series.apply(parse_one)

    # --------- Misc ---------

    @staticmethod
    def _safe_iso(series: Optional[pd.Series], which: str) -> Optional[str]:
        if series is None or series.empty:
            return None
        try:
            if which == "min":
                val = series.min()
            else:
                val = series.max()
            if pd.isna(val):
                return None
            # Ensure datetime
            if not np.issubdtype(series.dtype, np.datetime64):
                val = pd.to_datetime(val, errors="coerce")
            return None if pd.isna(val) else val.isoformat()
        except Exception:
            return None

    @staticmethod
    def _fail(issues: List[str], meta: Dict[str, Union[str, int, float, List[str]]]) -> ProcessingResult:
        return ProcessingResult(False, None, DataQuality.POOR, issues, meta)
