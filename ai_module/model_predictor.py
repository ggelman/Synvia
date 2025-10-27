import pandas as pd
from prophet import Prophet
import pickle
import os
from datetime import datetime, timedelta
from product_name_utils import normalize_product_name, get_normalized_filename, reverse_normalize_for_display
from redis_cache import cached_model, ModelCache

MODELS_DIR = 'trained_models'

@cached_model(ttl=3600*6)  # Cache por 6 horas
def load_model(product_name):
    """Carrega modelo usando nome normalizado com cache."""
    normalized_name = normalize_product_name(product_name)
    model_filename = os.path.join(MODELS_DIR, f"prophet_model_{normalized_name}.pkl")
    if os.path.exists(model_filename):
        with open(model_filename, 'rb') as f:
            model = pickle.load(f)
        return model
    return None

def make_prediction(model, future_dates_df):
    forecast = model.predict(future_dates_df)
    return forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]

def predict_demand_for_all_products(days_ahead=1):
    all_predictions = {}
    
    all_products = []
    for filename in os.listdir(MODELS_DIR):
        if filename.startswith("prophet_model_") and filename.endswith(".pkl"):
            normalized_name = filename.replace("prophet_model_", "").replace(".pkl", "")
            display_name = reverse_normalize_for_display(normalized_name)
            all_products.append(display_name)
    
    today = datetime.now()
    future_dates = []
    for i in range(1, days_ahead + 1):
        future_dates.append(today + timedelta(days=i))
    
    future_df = pd.DataFrame({"ds": future_dates})

    for product in all_products:
        model = load_model(product)
        if model:
            forecast = make_prediction(model, future_df)
            predictions = []
            for _, row in forecast.iterrows():
                predictions.append({
                    "date": row["ds"].strftime("%Y-%m-%d"),
                    "predicted_demand": round(row["yhat"]),
                    "lower_bound": round(row["yhat_lower"]),
                    "upper_bound": round(row["yhat_upper"])
                })
            all_predictions[product] = predictions
    
    return all_predictions

if __name__ == '__main__':
    predictions = predict_demand_for_all_products(days_ahead=7)
    for product, preds in predictions.items():
        print(f"Previses para {product}:")
        for pred in preds:
            print(f"  Data: {pred["date"]}, Demanda Prevista: {pred["predicted_demand"]}")
