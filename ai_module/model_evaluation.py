from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np
from prophet.diagnostics import cross_validation, performance_metrics
import pandas as pd
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

def evaluate_model(model, df=None, horizon='30 days', parallel=None, initial=None, period=None):
    """
    Avalia o modelo usando validao cruzada do Prophet.
    
    Args:
        model: Modelo Prophet treinado
        df: DataFrame com os dados de treino
        horizon: String com o horizonte de previso para validao cruzada
        parallel: String 'processes' ou 'threads' para paralelizao
    
    Returns:
        Dict com mtricas de avaliao
    """
    try:
        # Determina valores iniciais (initial / period) se no fornecidos e se df estiver disponvel
        if df is not None and initial is None:
            try:
                df = df.copy()
                df['ds'] = pd.to_datetime(df['ds'])
                span_days = (df['ds'].max() - df['ds'].min()).days
                # use 60% of historical span as initial by default (must be > 0)
                if span_days > 0:
                    initial = f"{max(1, int(span_days * 0.6))} days"
            except Exception:
                initial = initial

        # Executa validao cruzada
        cv_results = cross_validation(
            model=model,
            horizon=horizon,
            initial=initial,
            period=period,
            parallel=parallel
        )
        
        # Calcula mtricas de performance
        metrics = performance_metrics(cv_results)
        
        # Calcula mtricas adicionais
        y_true = cv_results['y'].values
        y_pred = cv_results['yhat'].values

        mae = mean_absolute_error(y_true, y_pred)
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        # MAPE calculado de forma segura: ignorar valores y_true == 0
        eps = 1e-8
        nonzero_mask = np.abs(y_true) > eps
        if nonzero_mask.sum() > 0:
            mape = np.mean(np.abs((y_true[nonzero_mask] - y_pred[nonzero_mask]) / y_true[nonzero_mask])) * 100
        else:
            mape = float('nan')
        
        coverage = metrics['coverage'].mean() if 'coverage' in metrics else None
        return {
            'mae': mae,
            'rmse': rmse,
            'mape': mape,
            'coverage': coverage,
            'cv_metrics': metrics
        }
        
    except Exception as e:
        logging.exception(f"Erro ao avaliar modelo: {e}")
        return None