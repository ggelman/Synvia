import numpy as np
from sklearn.model_selection import ParameterGrid
from prophet import Prophet
from model_evaluation import evaluate_model

def optimize_hyperparameters(df, param_grid, horizon='30 days', parallel='processes'):
    """
    Otimiza os hiperparmetros do modelo Prophet usando grid search.
    
    Args:
        df: DataFrame com os dados de treino (deve ter colunas 'ds' e 'y')
        param_grid: Dicionrio com os parmetros a serem otimizados
        horizon: String com o horizonte de previso para validao cruzada
        parallel: String 'processes' ou 'threads' para paralelizao
    
    Returns:
        Dict com os melhores parmetros encontrados
    """
    best_rmse = float('inf')
    best_params = None
    
    # Gera todas as combinaes de parmetros
    param_combinations = ParameterGrid(param_grid)
    
    for params in param_combinations:
        try:
            print(f"Testando parmetros: {params}")
            
            # Treina o modelo com os parmetros atuais
            model = Prophet(**params)
            model.fit(df)
            
            # Avalia o modelo
            metrics = evaluate_model(model, df, horizon=horizon, parallel=parallel)
            
            if metrics and metrics['rmse'] < best_rmse:
                best_rmse = metrics['rmse']
                best_params = params
                print(f"Novo melhor RMSE: {best_rmse:.2f}")
                
        except Exception as e:
            print(f"Erro ao testar parmetros {params}: {e}")
            continue
    
    return best_params