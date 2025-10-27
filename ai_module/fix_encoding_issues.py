#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para corrigir problemas de encoding nos arquivos de modelos.
Remove duplicatas com encoding incorreto e normaliza nomes de produtos.
"""

import os
import re
import shutil
import json
from pathlib import Path
import unicodedata

def normalize_product_name(name):
    """
    Normaliza nomes de produtos para evitar problemas de encoding.
    Remove acentos e caracteres especiais de forma consistente.
    """
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

def get_product_name_mapping():
    """
    Cria um mapeamento dos nomes de produtos problemticos para nomes corretos.
    """
    mapping = {
        # Nomes com encoding incorreto -> Nomes corretos
        'Po_de_Acar': 'Pao_de_Acucar',
        'Po_Francs': 'Pao_Frances', 
        'Po_Integral': 'Pao_Integral',
        'Caf_Expresso': 'Cafe_Expresso',
        
        # Nomes com acentos corretos -> Nomes normalizados
        'Po_de_Acar': 'Pao_de_Acucar',
        'Po_Francs': 'Pao_Frances',
        'Po_Integral': 'Pao_Integral', 
        'Caf_Expresso': 'Cafe_Expresso',
        
        # Outros produtos
        'Bolo_de_Chocolate': 'Bolo_de_Chocolate',
        'Brigadeiro_Gourmet': 'Brigadeiro_Gourmet',
        'Cappuccino': 'Cappuccino',
        'Croissant': 'Croissant',
        'Suco_Natural': 'Suco_Natural',
        'Torta_de_Morango': 'Torta_de_Morango'
    }
    
    return mapping

def clean_duplicate_models():
    """
    Remove arquivos de modelos duplicados com encoding incorreto.
    """
    models_dir = Path('trained_models')
    if not models_dir.exists():
        print("Diretrio trained_models no encontrado.")
        return
    
    # Obtm mapeamento de nomes de produtos
    get_product_name_mapping()
    
    # Arquivos problemticos a serem removidos
    problematic_files = [
        'prophet_model_Po_de_Acar.pkl',
        'prophet_model_Po_Francs.pkl', 
        'prophet_model_Po_Integral.pkl',
        'prophet_model_Caf_Expresso.pkl',
        'prophet_params_Po_de_Acar.json',
        'prophet_params_Po_Francs.json',
        'prophet_params_Po_Integral.json', 
        'prophet_params_Caf_Expresso.json'
    ]
    
    removed_files = []
    for filename in problematic_files:
        file_path = models_dir / filename
        if file_path.exists():
            try:
                file_path.unlink()  # Remove o arquivo
                removed_files.append(filename)
                print(f" Removido arquivo problemtico: {filename}")
            except Exception as e:
                print(f" Erro ao remover {filename}: {e}")
    
    print(f"\n Total de arquivos removidos: {len(removed_files)}")
    return removed_files

def rename_models_to_normalized_names():
    """
    Renomeia arquivos de modelos para usar nomes normalizados.
    """
    models_dir = Path('trained_models')
    if not models_dir.exists():
        print("Diretrio trained_models no encontrado.")
        return
    
    # Obter mapeamento de nomes
    mapping = get_product_name_mapping()
    renamed_files = []
    
    # Listar todos os arquivos .pkl e .json
    all_files = list(models_dir.glob('prophet_model_*.pkl')) + list(models_dir.glob('prophet_params_*.json'))
    
    for file_path in all_files:
        filename = file_path.name
        
        # Extrair nome do produto do arquivo
        if filename.startswith('prophet_model_'):
            product_part = filename.replace('prophet_model_', '').replace('.pkl', '')
            prefix = 'prophet_model_'
            suffix = '.pkl'
        elif filename.startswith('prophet_params_'):
            product_part = filename.replace('prophet_params_', '').replace('.json', '')
            prefix = 'prophet_params_'
            suffix = '.json'
        else:
            continue
        
        # Verificar se precisa renomear
        if product_part in mapping and mapping[product_part] != product_part:
            new_name = prefix + mapping[product_part] + suffix
            new_path = models_dir / new_name
            
            try:
                file_path.rename(new_path)
                renamed_files.append((filename, new_name))
                print(f" Renomeado: {filename} -> {new_name}")
            except Exception as e:
                print(f" Erro ao renomear {filename}: {e}")
    
    print(f"\n Total de arquivos renomeados: {len(renamed_files)}")
    return renamed_files

def create_product_name_utils():
    """
    Cria um arquivo de utilitrios para normalizao de nomes de produtos.
    """
    utils_content = '''#!/usr/bin/env python3
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
'''
    
    with open('product_name_utils.py', 'w', encoding='utf-8') as f:
        f.write(utils_content)
    
    print(" Criado arquivo product_name_utils.py")

def main():
    """Funo principal que executa todas as correes."""
    print(" Iniciando correo de problemas de encoding...")
    print("=" * 60)
    
    # 1. Limpar arquivos duplicados problemticos
    print("\n1 Removendo arquivos duplicados com encoding incorreto...")
    removed = clean_duplicate_models()
    
    # 2. Renomear arquivos para nomes normalizados
    print("\n2 Renomeando arquivos para nomes normalizados...")
    renamed = rename_models_to_normalized_names()
    
    # 3. Criar utilitrios para normalizao
    print("\n3 Criando utilitrios de normalizao...")
    create_product_name_utils()
    
    print("\n" + "=" * 60)
    print(" Correo de encoding concluda!")
    print(" Resumo:")
    print(f"   - Arquivos removidos: {len(removed) if removed else 0}")
    print(f"   - Arquivos renomeados: {len(renamed) if renamed else 0}")
    print("   - Utilitrios criados: 1")

if __name__ == "__main__":
    main()