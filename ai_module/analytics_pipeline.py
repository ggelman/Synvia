import json
import logging
from functools import lru_cache
from typing import Dict, Optional

import pandas as pd
from sklearn.linear_model import LinearRegression

logger = logging.getLogger(__name__)


class AnalyticsError(Exception):
    """Erro especfico do pipeline de analytics."""


@lru_cache(maxsize=1)
def load_sales_dataframe(data_file: str) -> pd.DataFrame:
    df = pd.read_csv(data_file)
    if df.empty:
        raise AnalyticsError("Dataset de vendas est vazio")
    df["ds"] = pd.to_datetime(df["ds"])
    return df


def build_feature_frame(df: pd.DataFrame, product: Optional[str] = None) -> pd.DataFrame:
    if product:
        df = df[df["item_name"] == product]
        if df.empty:
            raise AnalyticsError(f"Produto '{product}' no possui dados suficientes")

    features = df.copy()
    features["day_of_week"] = features["ds"].dt.dayofweek
    features["hour"] = features["ds"].dt.hour
    features["month"] = features["ds"].dt.month

    aggregated = (
        features.groupby(["item_name", "day_of_week", "hour", "month"], as_index=False)["y"].sum()
    )
    return aggregated


def calculate_correlations(df: pd.DataFrame) -> Dict[str, float]:
    correlation_matrix = df[["y", "day_of_week", "hour", "month"]].corr()
    correlations = correlation_matrix["y"].drop("y").to_dict()
    return {key: round(value, 4) for key, value in correlations.items()}


def execute_regression(df: pd.DataFrame) -> Dict[str, float]:
    model = LinearRegression()
    X = df[["day_of_week", "hour", "month"]]
    y = df["y"]
    model.fit(X, y)
    score = model.score(X, y)
    coefficients = {
        "day_of_week": round(model.coef_[0], 4),
        "hour": round(model.coef_[1], 4),
        "month": round(model.coef_[2], 4),
    }

    return {
        "r2": round(score, 4),
        "coefficients": coefficients,
        "intercept": round(float(model.intercept_), 4),
    }


def generate_analytics_snapshot(data_file: str, product: Optional[str] = None) -> Dict[str, Dict[str, float]]:
    try:
        df = load_sales_dataframe(data_file)
        feature_frame = build_feature_frame(df, product)
        correlations = calculate_correlations(feature_frame)
        regression = execute_regression(feature_frame)
        return {
            "product": product or "all",
            "correlations": correlations,
            "regression": regression,
        }
    except AnalyticsError as error:
        logger.warning("Pipeline analytics retornou erro de negcio: %s", error)
        raise
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("Falha ao executar pipeline de analytics")
        raise AnalyticsError("No foi possvel processar o pipeline estatstico") from exc


def analytics_snapshot_as_json(data_file: str, product: Optional[str] = None) -> str:
    snapshot = generate_analytics_snapshot(data_file, product)
    return json.dumps(snapshot, ensure_ascii=False, indent=2)
