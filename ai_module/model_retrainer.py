import pandas as pd
from prophet import Prophet
from prophet.make_holidays import make_holidays_df
import os
import pickle
import json

def retrain_prophet_models(original_data_path, models_dir, new_data_path=None):
    """Retreina modelos Prophet com dados atualizados e parmetros otimizados."""
    # Carrega os dados histricos originais
    df_original = pd.read_csv(original_data_path)
    df_original["ds"] = pd.to_datetime(df_original["ds"])

    # Se houver novos dados, carrega e concatena
    if new_data_path and os.path.exists(new_data_path):
        df_new = pd.read_csv(new_data_path)
        df_new["ds"] = pd.to_datetime(df_new["ds"])
        df = pd.concat([df_original, df_new]).drop_duplicates(subset=["ds", "item_name"]).reset_index(drop=True)
    else:
        df = df_original

    if df.empty:
        print("DataFrame vazio aps concatenao. No  possvel retreinar modelos.")
        return

    unique_products = df["item_name"].unique()

    if not os.path.exists(models_dir):
        os.makedirs(models_dir)

    # Gerar feriados para o Brasil para os anos dos dados
    years = range(df["ds"].min().year, df["ds"].max().year + 2)
    brazil_holidays = make_holidays_df(year_list=years, country=\'BR\')

    for product_name in unique_products:
        print(f"Retreinando modelo para: {product_name}...")
        product_df = df[df["item_name"] == product_name][["ds", "y"]]

        if product_df.empty:
            print(f"Nenhum dado para o produto {product_name}. Pulando retreinamento.")
            continue

        # Adicionar variveis externas (regressores) - Exemplo
        product_df["temperatura_media"] = 25 + 5 * (product_df.index % 7) 
        product_df["promocao"] = (product_df.index % 10 == 0).astype(int)

        # Carregar parmetros otimizados salvos, se existirem
        params_filename = os.path.join(models_dir, f"prophet_params_{product_name.replace(\' \', \'_\')}.json")
        optimized_params = {}
        if os.path.exists(params_filename):
            with open(params_filename, \'r\') as f:
                optimized_params = json.load(f)
        else:
            # Usar parmetros padro se no houver otimizados
            optimized_params = {
                \'changepoint_prior_scale\': 0.1,
                \'seasonality_prior_scale\': 1.0,
                \'holidays_prior_scale\': 1.0
            }

        # Inicializa e treina o modelo Prophet com parmetros otimizados
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=True,
            holidays=brazil_holidays,
            **optimized_params
        )
        
        # Adicionar regressores extras (variveis externas)
        if "temperatura_media" in product_df.columns:
            model.add_regressor("temperatura_media")
        if "promocao" in product_df.columns:
            model.add_regressor("promocao")

        model.fit(product_df)

        # Salva o modelo retreinado
        model_filename = os.path.join(models_dir, f"prophet_model_{product_name.replace(\' \', \'_\')}.pkl")
        with open(model_filename, \'wb\') as f:
            pickle.dump(model, f)
        print(f"Modelo para {product_name} retreinado e salvo em {model_filename}")

if __name__ == \'__main__\':
    import sys
    # Argumentos: original_data_path, models_dir, new_data_path (opcional)
    if len(sys.argv) < 3:
        print("Uso: python model_retrainer.py <original_data_path> <models_dir> [new_data_path]")
        sys.exit(1)

    original_data_file = sys.argv[1]
    models_directory = sys.argv[2]
    new_data_file = sys.argv[3] if len(sys.argv) > 3 else None

    retrain_prophet_models(original_data_file, models_directory, new_data_file)


