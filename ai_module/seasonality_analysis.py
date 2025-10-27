import pandas as pd
import numpy as np
from prophet.make_holidays import make_holidays_df

def detect_data_frequency(df, date_col='ds'):
    """Detecta a granularidade dos timestamps em `df[date_col]`.

    Retorna 'daily', 'hourly', 'weekly', 'monthly' ou 'unknown'.
    """
    if df.empty:
        return 'unknown'
    dates = pd.to_datetime(df[date_col]).sort_values()
    diffs = dates.diff().dropna().dt.total_seconds()
    if diffs.empty:
        return 'unknown'
    median = np.median(diffs)
    # segundos por unidade
    day = 86400
    hour = 3600
    week = day * 7
    month = day * 30

    if median <= hour + 1:
        return 'hourly'
    if median <= day + 1:
        return 'daily'
    if median <= week + 1:
        return 'weekly'
    if median <= month + 1:
        return 'monthly'
    return 'unknown'


def recommend_seasonalities(df, date_col='ds'):
    """Baseado na granularidade dos dados, recomenda quais sazonalidades ativar.

    Retorna dict: {'daily': bool, 'weekly': bool, 'yearly': bool}
    """
    freq = detect_data_frequency(df, date_col=date_col)
    rec = {'daily': False, 'weekly': False, 'yearly': True}

    if freq == 'hourly':
        rec['daily'] = True
        rec['weekly'] = True
    elif freq == 'daily':
        rec['daily'] = False  # geralmente Prophet daily_seasonality para dados dirios  rudo
        rec['weekly'] = True
    elif freq == 'weekly':
        rec['weekly'] = True
        rec['yearly'] = True
    elif freq == 'monthly':
        rec['weekly'] = False
        rec['yearly'] = True

    return rec


def generate_holidays_for_df(df, country='BR', date_col='ds'):
    """Gera um DataFrame de feriados cobrindo os anos presentes nos dados."""
    years = range(pd.to_datetime(df[date_col]).min().year, pd.to_datetime(df[date_col]).max().year + 2)
    holidays = make_holidays_df(year_list=years, country=country)
    return holidays
import pandas as pd
import numpy as np
from prophet import Prophet
from prophet.make_holidays import make_holidays_df
from datetime import datetime
import json

def detect_seasonality_patterns(df):
    """
    Detecta padres de sazonalidade nos dados.
    
    Args:
        df: DataFrame com as colunas 'ds' e 'y'
    
    Returns:
        Dict com informaes sobre padres de sazonalidade detectados
    """
    # Converte a coluna de data para datetime se necessrio
    df = df.copy()
    df['ds'] = pd.to_datetime(df['ds'])
    
    # Adiciona colunas de tempo
    df['hour'] = df['ds'].dt.hour
    df['day'] = df['ds'].dt.day
    df['weekday'] = df['ds'].dt.weekday
    df['month'] = df['ds'].dt.month
    
    patterns = {}
    
    # Anlise diria
    daily_pattern = df.groupby('hour')['y'].mean()
    patterns['daily'] = {
        'strength': daily_pattern.std() / daily_pattern.mean(),
        'peak_hour': daily_pattern.idxmax(),
        'low_hour': daily_pattern.idxmin()
    }
    
    # Anlise semanal
    weekly_pattern = df.groupby('weekday')['y'].mean()
    patterns['weekly'] = {
        'strength': weekly_pattern.std() / weekly_pattern.mean(),
        'peak_day': weekly_pattern.idxmax(),
        'low_day': weekly_pattern.idxmin()
    }
    
    # Anlise mensal
    monthly_pattern = df.groupby('month')['y'].mean()
    patterns['monthly'] = {
        'strength': monthly_pattern.std() / monthly_pattern.mean(),
        'peak_month': monthly_pattern.idxmax(),
        'low_month': monthly_pattern.idxmin()
    }
    
    return patterns

def get_local_holidays(start_date, end_date, country='BR'):
    """
    Obtm feriados locais para o perodo especificado.
    
    Args:
        start_date: Data inicial
        end_date: Data final
        country: Cdigo do pas (default: 'BR' para Brasil)
    
    Returns:
        DataFrame com os feriados
    """
    years = range(start_date.year, end_date.year + 1)
    holidays = make_holidays_df(year_list=years, country=country)
    return holidays

def configure_seasonality(model, patterns, threshold=0.1):
    """
    Configura a sazonalidade do modelo Prophet com base nos padres detectados.
    
    Args:
        model: Modelo Prophet
        patterns: Dict com padres de sazonalidade detectados
        threshold: Limiar para considerar um padro significativo
    
    Returns:
        Modelo Prophet configurado
    """
    # Configura sazonalidade diria
    if patterns['daily']['strength'] > threshold:
        model.add_seasonality(
            name='daily',
            period=24,
            fourier_order=5
        )
    
    # Configura sazonalidade semanal
    if patterns['weekly']['strength'] > threshold:
        model.add_seasonality(
            name='weekly',
            period=7,
            fourier_order=3
        )
    
    # Configura sazonalidade mensal
    if patterns['monthly']['strength'] > threshold:
        model.add_seasonality(
            name='monthly',
            period=30.5,
            fourier_order=5
        )
    
    return model

def analyze_and_save_patterns(df, product_name, output_dir):
    """
    Analisa padres de sazonalidade e salva os resultados.
    
    Args:
        df: DataFrame com dados do produto
        product_name: Nome do produto
        output_dir: Diretrio para salvar os resultados
    """
    patterns = detect_seasonality_patterns(df)
    
    # Formata os resultados de forma mais legvel
    readable_patterns = {
        'daily': {
            'strength': f"{patterns['daily']['strength']:.2f}",
            'peak_hour': f"{patterns['daily']['peak_hour']:02d}:00",
            'low_hour': f"{patterns['daily']['low_hour']:02d}:00"
        },
        'weekly': {
            'strength': f"{patterns['weekly']['strength']:.2f}",
            'peak_day': ['Segunda', 'Tera', 'Quarta', 'Quinta', 'Sexta', 'Sbado', 'Domingo'][patterns['weekly']['peak_day']],
            'low_day': ['Segunda', 'Tera', 'Quarta', 'Quinta', 'Sexta', 'Sbado', 'Domingo'][patterns['weekly']['low_day']]
        },
        'monthly': {
            'strength': f"{patterns['monthly']['strength']:.2f}",
            'peak_month': datetime(2000, patterns['monthly']['peak_month'], 1).strftime('%B'),
            'low_month': datetime(2000, patterns['monthly']['low_month'], 1).strftime('%B')
        }
    }
    
    # Salva os resultados
    output_file = f"{output_dir}/seasonality_{product_name.replace(' ', '_')}.json"
    with open(output_file, 'w') as f:
        json.dump(readable_patterns, f, indent=4, ensure_ascii=False)
    
    return patterns, readable_patterns