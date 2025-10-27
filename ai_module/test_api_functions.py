#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Teste rpido para verificar se a API do ai_service est funcionando corretamente
aps as correes de encoding.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai_service import load_model, get_available_products
from product_name_utils import get_all_display_product_names

def test_model_loading():
    """Testa o carregamento de modelos com nomes normalizados."""
    print(" Testando carregamento de modelos...")
    
    test_products = [
        "Po de Acar",
        "Caf Expresso", 
        "Po Francs",
        "Bolo de Chocolate"
    ]
    
    for product in test_products:
        model = load_model(product)
        if model is not None:
            print(f"   Modelo carregado para: {product}")
        else:
            print(f"   Falha ao carregar modelo para: {product}")

def test_products_endpoint():
    """Simula o endpoint de produtos para verificar se est funcionando."""
    print("\n Testando listagem de produtos...")
    
    try:
        import os
        MODELS_DIR = 'trained_models'
        
        products = []
        from product_name_utils import reverse_normalize_for_display
        
        for filename in os.listdir(MODELS_DIR):
            if filename.startswith("prophet_model_") and filename.endswith(".pkl"):
                normalized_name = filename.replace("prophet_model_", "").replace(".pkl", "")
                display_name = reverse_normalize_for_display(normalized_name)
                products.append({
                    'name': display_name,
                    'normalized_name': normalized_name,
                    'model_file': filename
                })
        
        print(f" Total de produtos encontrados: {len(products)}")
        for product in products:
            print(f"   {product['name']} -> {product['normalized_name']}")
        
        return len(products) > 0
        
    except Exception as e:
        print(f" Erro ao listar produtos: {e}")
        return False

def main():
    """Executa os testes."""
    print(" Testando funcionalidades aps correo de encoding...")
    print("=" * 50)
    
    # Teste 1: Carregamento de modelos
    test_model_loading()
    
    # Teste 2: Listagem de produtos
    success = test_products_endpoint()
    
    print("\n" + "=" * 50)
    if success:
        print(" Testes bsicos passaram! API deve estar funcionando.")
    else:
        print(" Alguns testes falharam. Verifique a implementao.")

if __name__ == "__main__":
    main()