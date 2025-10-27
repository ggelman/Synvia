import pandas as pd
from prophet import Prophet
from seasonality_analysis import recommend_seasonalities, generate_holidays_for_df
import os
import pickle
import json
from dotenv import load_dotenv
from hyperparameter_optimization import optimize_hyperparameters
from model_evaluation import evaluate_model
from product_name_utils import normalize_product_name, get_normalized_filename

def train_prophet_models(data_path, models_dir):
    """Treina um modelo Prophet para cada produto com otimizao de hiperparmetros."""
    # Carrega variveis de ambiente
    load_dotenv()
    
    df = pd.read_csv(data_path)

    if df.empty:
        print("DataFrame vazio. No  possvel treinar modelos.")
        return

    df["ds"] = pd.to_datetime(df["ds"])
    unique_products = df["item_name"].unique()

    if not os.path.exists(models_dir):
        os.makedirs(models_dir)

    # Detectar sazonalidades recomendadas e gerar feriados
    seasonalities = recommend_seasonalities(df, date_col='ds')
    brazil_holidays = generate_holidays_for_df(df, country='BR', date_col='ds')

    # Grade de hiperparmetros para otimizao
    param_grid = {
        'changepoint_prior_scale': [0.001, 0.01, 0.1, 0.5],
        'seasonality_prior_scale': [0.1, 1.0, 10.0],
        'holidays_prior_scale': [0.1, 1.0, 10.0],
        'changepoint_range': [0.8, 0.9, 0.95]
    }

    for product_name in unique_products:
        print(f"Treinando modelo para: {product_name}...")
        product_df = df[df["item_name"] == product_name][["ds", "y"]]

        if product_df.empty:
            print(f"Nenhum dado para o produto {product_name}. Pulando.")
            continue

        # Otimiza hiperparmetros
        print("Otimizando hiperparmetros...")
        best_params = optimize_hyperparameters(product_df, param_grid)
        
        if not best_params:
            print(f"Falha na otimizao para {product_name}. Usando parmetros padro.")
            best_params = {
                'changepoint_prior_scale': 0.1,
                'seasonality_prior_scale': 1.0,
                'holidays_prior_scale': 1.0,
                'changepoint_range': 0.9
            }

        # Inicializa e treina o modelo Prophet com parmetros otimizados
        model = Prophet(
            yearly_seasonality=seasonalities.get('yearly', True),
            weekly_seasonality=seasonalities.get('weekly', True),
            daily_seasonality=seasonalities.get('daily', False),
            holidays=brazil_holidays,
            **best_params
        )

        model.fit(product_df)
        
        # Avalia o modelo
        print("Avaliando modelo...")
        metrics = evaluate_model(model, product_df)
        
        if metrics:
            print(f"Mtricas de avaliao para {product_name}:")
            print(f"MAE: {metrics['mae']:.2f}")
            print(f"RMSE: {metrics['rmse']:.2f}")
            print(f"MAPE: {metrics['mape']:.2f}%")
            print(f"Coverage: {metrics['coverage']:.2f}%")

        # Salva o modelo treinado
        normalized_name = normalize_product_name(product_name)
        model_filename = os.path.join(models_dir, get_normalized_filename(product_name, 'model'))
        with open(model_filename, 'wb') as f:
            pickle.dump(model, f)
        print(f"Modelo para {product_name} salvo em {model_filename}")
            
        # Salva os parmetros e mtricas
        results = {
            'product_name': product_name,
            'normalized_name': normalized_name,
            'parameters': best_params,
            'metrics': metrics if metrics else {}
        }
        
        results_filename = os.path.join(models_dir, get_normalized_filename(product_name, 'params'))
        with open(results_filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=4, ensure_ascii=False)
        print(f"Resultados para {product_name} salvos em {results_filename}")

if __name__ == '__main__':
    data_file = 'processed_sales_data.csv'
    models_directory = 'trained_models'
    train_prophet_models(data_file, models_directory)