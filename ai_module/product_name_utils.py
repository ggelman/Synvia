#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Utilitrios para normalizao de nomes de produtos.
Evita problemas de encoding em todo o sistema.
"""

import re
import unicodedata

def normalize_product_name(name):
    """
    Normaliza nomes de produtos para evitar problemas de encoding.
    
    Args:
        name (str): Nome do produto original
        
    Returns:
        str: Nome normalizado sem acentos e caracteres especiais
    """
    if not name or not isinstance(name, str):
        return ""
    
    # Remove acentos usando unicodedata
    normalized = unicodedata.normalize('NFD', name)
    ascii_name = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    
    # Substitui espaos por underscore e remove caracteres especiais
    clean_name = re.sub(r'[^a-zA-Z0-9_]', '_', ascii_name)
    
    # Remove underscores duplicados
    clean_name = re.sub(r'_+', '_', clean_name)
    
    # Remove underscores no incio e fim
    clean_name = clean_name.strip('_')
    
    return clean_name

def get_normalized_filename(product_name, file_type='model'):
    """
    Gera nome de arquivo normalizado para um produto.
    
    Args:
        product_name (str): Nome do produto
        file_type (str): Tipo do arquivo ('model' ou 'params')
        
    Returns:
        str: Nome do arquivo normalizado
    """
    normalized_name = normalize_product_name(product_name)
    
    if file_type == 'model':
        return f"prophet_model_{normalized_name}.pkl"
    elif file_type == 'params':
        return f"prophet_params_{normalized_name}.json"
    else:
        return f"{normalized_name}.{file_type}"

def reverse_normalize_for_display(normalized_name):
    """
    Converte nome normalizado de volta para exibio amigvel.
    
    Args:
        normalized_name (str): Nome normalizado
        
    Returns:
        str: Nome para exibio
    """
    # Mapeamento reverso para nomes conhecidos
    display_mapping = {
        'Pao_de_Acucar': 'Po de Acar',
        'Pao_Frances': 'Po Francs', 
        'Pao_Integral': 'Po Integral',
        'Cafe_Expresso': 'Caf Expresso',
        'Bolo_de_Chocolate': 'Bolo de Chocolate',
        'Brigadeiro_Gourmet': 'Brigadeiro Gourmet',
        'Suco_Natural': 'Suco Natural',
        'Torta_de_Morango': 'Torta de Morango'
    }
    
    if normalized_name in display_mapping:
        return display_mapping[normalized_name]
    
    # Fallback: substitui underscores por espaos
    return normalized_name.replace('_', ' ')

# Mapeamento de produtos conhecidos
KNOWN_PRODUCTS = {
    'Po de Acar': 'Pao_de_Acucar',
    'Po Francs': 'Pao_Frances',
    'Po Integral': 'Pao_Integral', 
    'Caf Expresso': 'Cafe_Expresso',
    'Bolo de Chocolate': 'Bolo_de_Chocolate',
    'Brigadeiro Gourmet': 'Brigadeiro_Gourmet',
    'Cappuccino': 'Cappuccino',
    'Croissant': 'Croissant',
    'Suco Natural': 'Suco_Natural',
    'Torta de Morango': 'Torta_de_Morango'
}

def get_all_normalized_product_names():
    """Retorna lista de todos os nomes de produtos normalizados."""
    return list(KNOWN_PRODUCTS.values())

def get_all_display_product_names():
    """Retorna lista de todos os nomes de produtos para exibio."""
    return list(KNOWN_PRODUCTS.keys())
