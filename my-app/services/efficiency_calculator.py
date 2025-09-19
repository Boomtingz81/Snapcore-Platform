"""
Snapcore Charge Analytics - Efficiency Calculator
Analyzes charging-session efficiency and patterns for optimization insights.
"""

from __future__ import annotations

import logging
import math
import re
from dataclasses import dataclass
from datetime import timedelta
from enum import Enum
from typing import Dict, List, NamedTuple, Optional

import numpy as np
import pandas as pd

__all__ = [
    "ChargerType",
    "EfficiencyMetric",
    "ChargingPattern",
    "EfficiencyAnalysis",
    "ChargingEfficiencyCalculator",
]

logger = logging.getLogger(__name__)


# ---------- Models ----------

class ChargerType(Enum):
    """Standard charger type categories."""
    HOME_AC = "home_ac" # Level 1/2 home charging
    PUBLIC_AC = "public_ac" # Level 2 public charging
    DC_FAST = "dc_fast" # DC fast charging (50–150kW)
    SUPERCHARGER = "supercharger" # Tesla Supercharger network
    UNKNOWN = "unknown"


class EfficiencyMetric(NamedTuple):
    """Container for efficiency calculation results."""
    kwh_per_dollar: float
    cost_per_kwh: float
    charging_speed_kw: Optional[float]
    efficiency_rating: str # one of: excellent, good, fair, poor


@dataclass(frozen=True)
class ChargingPattern:
    """Analysis of charging behavior patterns."""
    avg_session_energy: float
    preferred_charger_types: List[str]
    peak_usage_hours: List[int]
    weekend_vs_weekday_ratio: float
    avg_soc_start: Optional[float]
    avg_soc_end: Optional[float]


@dataclass(frozen=True)
class EfficiencyAnalysis:
    """Complete efficiency analysis results."""
    overall_efficiency: EfficiencyMetric
    by_charger_type: Dict[str, EfficiencyMetric]
    by_location: Dict[str, EfficiencyMetric]
    temporal_trends: Dict[str, float]
    charging_patterns: ChargingPattern
    recommendations: List[str]
    cost_savings_potential: float


# ---------- Calculator ----------

class ChargingEfficiencyCalculator:
    """
    Calculates charging efficiency metrics and identifies optimization opportunities.

    Analyzes:
      • Cost efficiency (kWh per dollar, cost per kWh)
      • Charging speed optimization
      • Location-based efficiency
      • Temporal patterns and peak usage
      • SOC optimization patterns
    """

    # Typical charging power ratings used for inference
    CHARGER_POWER_ESTIMATES: Dict[ChargerType, float] = {
        ChargerType.HOME_AC: 7.2, # Level 2 home
        ChargerType.PUBLIC_AC: 11.0, # Level 2 public
        ChargerType.DC_FAST: 100.0, # DC fast (avg)
        ChargerType.SUPERCHARGER: 150.0, # Supercharger V3 avg
        ChargerType.UNKNOWN: 25.0, # Conservative default
    }

    # Efficiency rating thresholds (cost per kWh in USD)
    EFFICIENCY_THRESHOLDS: Dict[str, float] = {
        "excellent": 0.12, # ≤ $0.12/kWh
        "good": 0.20, # ≤ $0.20/kWh
        "fair": 0.35, # ≤ $0.35/kWh
        "poor": float("inf")
    }

    def __init__(self) -> None:
        self._analysis_cache: Dict[str, EfficiencyAnalysis] = {}

    # ----- Helpers -----

    @staticmethod
    def _safe_mean(series: pd.Series) -> Optional[float]:
        s = pd.to_numeric(series, errors="coerce")
        return float(s.mean()) if s.notna().any() else None

    @staticmethod
    def _to_datetime(series: pd.Series) -> pd.Series:
        """Parse to datetime without mutating caller; returns UTC-naive timestamps."""
        return pd.to_datetime(series, errors="coerce", utc=True).dt.tz_convert(None)

    @classmethod
    def _rate_efficiency(cls, cost_per_kwh: float) -> str:
        for label, threshold in cls.EFFICIENCY_THRESHOLDS.items():
            if cost_per_kwh <= threshold:
                return label
        return "poor"

    # ----- Classification -----

    def categorize_charger_type(
        self,
        charger_info: Optional[str],
        energy_kwh: float,
        duration_minutes: Optional[float]
    ) -> ChargerType:
        """Categorize charger type using text hints and (if available) implied power."""
        text = (str(charger_info or "")).lower()

        # Text patterns first (most reliable).
        if re.search(r"\b(supercharger|tesla\s*sc|v\d)\b", text):
            return ChargerType.SUPERCHARGER
        if re.search(r"\b(dc|fast|rapid|ccs|chade?mo)\b", text):
            return ChargerType.DC_FAST
        if re.search(r"\b(home|residential|garage)\b", text):
            return ChargerType.HOME_AC
        if re.search(r"\b(public|level\s*2|l2|ac)\b", text):
            return ChargerType.PUBLIC_AC

        # Fall back to inferred power from delivered energy and time.
        if duration_minutes and duration_minutes > 0 and energy_kwh > 0:
            power_kw = (energy_kwh * 60.0) / float(duration_minutes)
            if power_kw > 120:
                return ChargerType.SUPERCHARGER
            if power_kw > 80:
                return ChargerType.DC_FAST
            if power_kw > 15:
                return ChargerType.PUBLIC_AC
            return ChargerType.HOME_AC

        return ChargerType.UNKNOWN

    # ----- Metrics -----

    def calculate_efficiency_metrics(
        self,
        energy_kwh: float,
        cost: float,
        duration_minutes: Optional[float] = None,
    ) -> EfficiencyMetric:
        """Compute metrics for (possibly aggregated) sessions."""
        if energy_kwh <= 0 or cost < 0:
            raise ValueError("energy_kwh must be > 0 and cost must be ≥ 0")

        # Avoid divide-by-zero / inf
        cost_per_kwh = float(cost / energy_kwh) if energy_kwh > 0 else math.inf
        kwh_per_dollar = float(energy_kwh / cost) if cost > 0 else 0.0

        speed_kw = None
        if duration_minutes and duration_minutes > 0:
            speed_kw = float((energy_kwh * 60.0) / duration_minutes)

        return EfficiencyMetric(
            kwh_per_dollar=kwh_per_dollar,
            cost_per_kwh=cost_per_kwh,
            charging_speed_kw=speed_kw,
            efficiency_rating=self._rate_efficiency(cost_per_kwh),
        )

    # ----- Analyses -----

    def analyze_charging_patterns(self, df: pd.DataFrame) -> ChargingPattern:
        """Behavior patterns: typical energy, preferred types, peak hours, SOC usage."""
        avg_energy = float(pd.to_numeric(df["energy_added_kwh"], errors="coerce").mean())

        preferred = ["unknown"]
        if "charger_type_category" in df.columns:
            counts = df["charger_type_category"].value_counts()
            if not counts.empty:
                preferred = counts.head(3).index.astype(str).tolist()

        peak_hours: List[int] = []
        weekend_ratio = 1.0
        if "session_date" in df.columns:
            dts = self._to_datetime(df["session_date"])
            hours = dts.dt.hour
            if hours.notna().any():
                peak_hours = (
                    hours.value_counts().sort_values(ascending=False).head(3).index.tolist()
                )
            # weekend vs weekday
            weekday = dts.dt.dayofweek
            is_weekend = weekday >= 5
            wkd = int(is_weekend.sum())
            wkdy = int(is_weekend.size - wkd)
            weekend_ratio = (wkd / wkdy) if wkdy > 0 else 1.0

        avg_soc_start = (
            self._safe_mean(df["start_soc_percent"]) if "start_soc_percent" in df.columns else None
        )
        avg_soc_end = (
            self._safe_mean(df["end_soc_percent"]) if "end_soc_percent" in df.columns else None
        )

        return ChargingPattern(
            avg_session_energy=avg_energy if not math.isnan(avg_energy) else 0.0,
            preferred_charger_types=preferred,
            peak_usage_hours=peak_hours,
            weekend_vs_weekday_ratio=float(weekend_ratio),
            avg_soc_start=avg_soc_start,
            avg_soc_end=avg_soc_end,
        )

    def analyze_temporal_trends(self, df: pd.DataFrame) -> Dict[str, float]:
        """Monthly trends for cost, efficiency, energy."""
        out: Dict[str, float] = {}
        if "session_date" not in df.columns or len(df) < 6:
            return out

        tmp = df.copy()
        tmp["session_date"] = self._to_datetime(tmp["session_date"])
        tmp = tmp.sort_values("session_date")

        # cost_per_kwh if not present
        if "cost_per_kwh" not in tmp.columns:
            tmp["cost_per_kwh"] = pd.to_numeric(tmp["total_cost"], errors="coerce") / pd.to_numeric(
                tmp["energy_added_kwh"], errors="coerce"
            )

        monthly = (
            tmp.set_index("session_date")
            .resample("MS")
            .agg(
                total_cost=("total_cost", "mean"),
                energy_added_kwh=("energy_added_kwh", "mean"),
                cost_per_kwh=("cost_per_kwh", "mean"),
            )
            .dropna(how="all")
        )

        if len(monthly) >= 3:
            # simple slope approximations across the observed window
            def slope(s: pd.Series) -> float:
                s = s.dropna()
                if len(s) < 2:
                    return 0.0
                return float((s.iloc[-1] - s.iloc[0]) / max(1, (len(s) - 1)))

            out["monthly_cost_trend"] = slope(monthly["total_cost"])
            out["monthly_efficiency_trend"] = slope(monthly["cost_per_kwh"])
            out["monthly_energy_trend"] = slope(monthly["energy_added_kwh"])

        return out

    # ----- Recommendations & Savings -----

    def _recommendations(self, analysis: EfficiencyAnalysis, df: pd.DataFrame) -> List[str]:
        recs: List[str] = []

        # Cost efficiency baseline
        if analysis.overall_efficiency.cost_per_kwh > 0.25:
            recs.append(
                f"Average cost per kWh (${analysis.overall_efficiency.cost_per_kwh:.3f}) is high. "
                "Prefer home/off-peak charging or cheaper public stations."
            )

        # Charger type mix
        if analysis.by_charger_type:
            best = min(analysis.by_charger_type.values(), key=lambda m: m.cost_per_kwh)
            worst = max(analysis.by_charger_type.values(), key=lambda m: m.cost_per_kwh)
            delta = worst.cost_per_kwh - best.cost_per_kwh
            if delta > 0.10: # ≥ 10¢/kWh difference
                best_label = next(k for k, v in analysis.by_charger_type.items() if v == best)
                worst_label = next(k for k, v in analysis.by_charger_type.items() if v == worst)
                recs.append(
                    f"Large price gap across types: {best_label} (${best.cost_per_kwh:.3f}/kWh) "
                    f"vs {worst_label} (${worst.cost_per_kwh:.3f}/kWh). Prefer {best_label}."
                )

        # Locations
        if analysis.by_location and len(analysis.by_location) > 2:
            best_locations = sorted(
                analysis.by_location.items(), key=lambda kv: kv[1].cost_per_kwh
            )[:2]
            if best_locations:
                recs.append(
                    "Most cost-effective locations: "
                    + ", ".join(f"{loc} (${m.cost_per_kwh:.3f}/kWh)" for loc, m in best_locations)
                )

        # SOC habits
        cp = analysis.charging_patterns
        if cp.avg_soc_start is not None and cp.avg_soc_start < 20:
            recs.append(
                f"Charges often start at low SOC (~{cp.avg_soc_start:.0f}%). "
                "Starting earlier (≥20%) is gentler on the battery."
            )
        if cp.avg_soc_end is not None and cp.avg_soc_end > 90:
            recs.append(
                f"Charges frequently end at high SOC (~{cp.avg_soc_end:.0f}%). "
                "Limit daily targets to 80–90% to reduce degradation."
            )

        # Peak times
        if cp.peak_usage_hours and any(h in (17, 18, 19, 20) for h in cp.peak_usage_hours):
            recs.append(
                "Charging often occurs during peak hours (5–8 PM). Shift to off-peak (11 PM–6 AM) to save."
            )

        # Session sizing
        if cp.avg_session_energy and cp.avg_session_energy < 10:
            recs.append(
                f"Average session size is small (~{cp.avg_session_energy:.1f} kWh). "
                "Consolidating sessions can reduce idle/overhead costs."
            )

        return recs

    @staticmethod
    def _annual_savings_potential(analysis: EfficiencyAnalysis, total_energy_kwh: float) -> float:
        """Conservative annual savings estimate by shifting mix to the cheapest option."""
        if total_energy_kwh <= 0 or not analysis.by_charger_type:
            return 0.0

        current = analysis.overall_efficiency.cost_per_kwh
        best = min(m.cost_per_kwh for m in analysis.by_charger_type.values())
        savings_per_kwh = max(0.0, current - best)

        # Assume dataset ~90 days → extrapolate to a year; only 60% realistically optimizable.
        estimated_annual_kwh = total_energy_kwh * (365.0 / 90.0)
        return float(savings_per_kwh * estimated_annual_kwh * 0.6)

    # ----- Orchestration -----

    def analyze_efficiency(self, df: pd.DataFrame) -> EfficiencyAnalysis:
        """
        Perform comprehensive efficiency analysis on processed charging data.

        Required columns (any additional are optional but helpful):
          - energy_added_kwh (numeric > 0)
          - total_cost (numeric ≥ 0)
          - session_date (datetime-like) [recommended]
          - charging_duration_minutes (numeric) [optional]
          - charger_type (str) [optional]
          - location_name (str) [optional]
          - start_soc_percent / end_soc_percent [optional]
        """
        if df.empty:
            raise ValueError("No data available for analysis")

        work = df.copy()

        # Normalize types
        work["energy_added_kwh"] = pd.to_numeric(work["energy_added_kwh"], errors="coerce")
        work["total_cost"] = pd.to_numeric(work["total_cost"], errors="coerce")
        if "session_date" in work.columns:
            work["session_date"] = self._to_datetime(work["session_date"])

        # Drop unusable rows
        work = work[(work["energy_added_kwh"] > 0) & (work["total_cost"] >= 0)]
        if work.empty:
            raise ValueError("All rows were invalid after basic normalization.")

        # Cost per kWh per session
        work["cost_per_kwh"] = work["total_cost"] / work["energy_added_kwh"]

        # Charger categorization
        if "charger_type" in work.columns:
            work["charger_type_category"] = work.apply(
                lambda r: self.categorize_charger_type(
                    r.get("charger_type"),
                    float(r["energy_added_kwh"]),
                    float(r["charging_duration_minutes"])
                    if "charging_duration_minutes" in work.columns and pd.notna(r.get("charging_duration_minutes"))
                    else None,
                ).value,
                axis=1,
            )

        # Overall efficiency
        total_energy = float(work["energy_added_kwh"].sum())
        total_cost = float(work["total_cost"].sum())
        avg_duration = (
            float(work["charging_duration_minutes"].mean())
            if "charging_duration_minutes" in work.columns
            else None
        )
        overall = self.calculate_efficiency_metrics(total_energy, total_cost, avg_duration)

        # By charger type
        by_type: Dict[str, EfficiencyMetric] = {}
        if "charger_type_category" in work.columns:
            for ct, subset in work.groupby("charger_type_category"):
                energy = float(subset["energy_added_kwh"].sum())
                cost = float(subset["total_cost"].sum())
                duration = (
                    float(subset["charging_duration_minutes"].mean())
                    if "charging_duration_minutes" in subset.columns
                    else None
                )
                if energy > 0:
                    by_type[str(ct)] = self.calculate_efficiency_metrics(energy, cost, duration)

        # By location (only locations with ≥5% of total energy)
        by_loc: Dict[str, EfficiencyMetric] = {}
        if "location_name" in work.columns:
            grouped = (
                work.groupby("location_name", dropna=True)
                .agg(
                    energy_added_kwh=("energy_added_kwh", "sum"),
                    total_cost=("total_cost", "sum"),
                    charging_duration_minutes=(
                        "charging_duration_minutes",
                        "mean",
                    )
                    if "charging_duration_minutes" in work.columns
                    else ("energy_added_kwh", "size"), # dummy to keep shape
                )
                .reset_index()
            )
            threshold = 0.05 * total_energy
            for _, row in grouped.iterrows():
                loc = str(row["location_name"]).strip()
                energy = float(row["energy_added_kwh"])
                if loc and energy >= threshold:
                    duration = (
                        float(row["charging_duration_minutes"])
                        if "charging_duration_minutes" in work.columns
                        else None
                    )
                    by_loc[loc] = self.calculate_efficiency_metrics(
                        energy, float(row["total_cost"]), duration
                    )

        patterns = self.analyze_charging_patterns(work)
        trends = self.analyze_temporal_trends(work)

        analysis = EfficiencyAnalysis(
            overall_efficiency=overall,
            by_charger_type=by_type,
            by_location=by_loc,
            temporal_trends=trends,
            charging_patterns=patterns,
            recommendations=[], # filled next

cost_savings_potential=0.0, # filled next
        )

        analysis.recommendations = self._recommendations(analysis, work)
        analysis.cost_savings_potential = self._annual_savings_potential(analysis, total_energy)
        return analysis

    # ---------- Report for Frontend ----------

    @staticmethod
    def generate_efficiency_report(analysis: EfficiencyAnalysis) -> Dict:
        """Convert analysis to a JSON-friendly dict for the UI."""
        def metric_to_dict(m: EfficiencyMetric) -> Dict[str, float | str | None]:
            return {
                "kwh_per_dollar": round(m.kwh_per_dollar, 3),
                "cost_per_kwh": round(m.cost_per_kwh, 4),
                "charging_speed_kw": round(m.charging_speed_kw, 2) if m.charging_speed_kw else None,
                "efficiency_rating": m.efficiency_rating,
            }

        return {
            "summary": {
                "overall_cost_per_kwh": round(analysis.overall_efficiency.cost_per_kwh, 4),
                "overall_kwh_per_dollar": round(analysis.overall_efficiency.kwh_per_dollar, 3),
                "efficiency_rating": analysis.overall_efficiency.efficiency_rating,
                "potential_annual_savings": round(analysis.cost_savings_potential, 2),
            },
            "charger_analysis": {k: metric_to_dict(v) for k, v in analysis.by_charger_type.items()},
            "location_analysis": {k: metric_to_dict(v) for k, v in analysis.by_location.items()},
            "temporal_trends": analysis.temporal_trends,
            "patterns": {
                "avg_session_energy_kwh": round(analysis.charging_patterns.avg_session_energy, 2),
                "preferred_charger_types": analysis.charging_patterns.preferred_charger_types,
                "peak_usage_hours": analysis.charging_patterns.peak_usage_hours,
                "weekend_vs_weekday_ratio": round(analysis.charging_patterns.weekend_vs_weekday_ratio, 2),
                "avg_soc_start": (
                    round(analysis.charging_patterns.avg_soc_start, 1)
                    if analysis.charging_patterns.avg_soc_start is not None
                    else None
                ),
                "avg_soc_end": (
                    round(analysis.charging_patterns.avg_soc_end, 1)
                    if analysis.charging_patterns.avg_soc_end is not None
                    else None
                ),
            },
            "recommendations": analysis.recommendations,
        }
