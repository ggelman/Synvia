#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de validao das correes de encoding.
Testa se todas as funcionalidades esto funcionando corretamente.
"""

import os
import sys
import json
from pathlib import Path

# Adiciona o diretrio atual ao Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from product_name_utils import (
    normalize_product_name, 
    get_normalized_filename, 
    reverse_normalize_for_display,
    KNOWN_PRODUCTS,
    get_all_normalized_product_names,
    get_all_display_product_names
)

# Constantes para testes
TEST_PAO_ACUCAR = "Po de Acar"
TEST_CAFE_EXPRESSO = "Caf Expresso"
TEST_BOLO_CHOCOLATE = "Bolo de Chocolate"
ERROR_TRAINED_MODELS_NOT_FOUND = " Diretrio trained_models no encontrado!"


def test_product_name_normalization():
    """Testa a normalizao de nomes de produtos."""
    print(" Testando normalizao de nomes de produtos...")
    
    test_cases = [
        (TEST_PAO_ACUCAR, "Pao_de_Acucar"),
        (TEST_CAFE_EXPRESSO, "Cafe_Expresso"), 
        ("Po Francs", "Pao_Frances"),
        ("Po Integral", "Pao_Integral"),
        (TEST_BOLO_CHOCOLATE, "Bolo_de_Chocolate"),
        ("Brigadeiro Gourmet", "Brigadeiro_Gourmet"),
        ("Test Product!", "Test_Product"),  # teste com caracteres especiais
        ("", ""),  # teste com string vazia
    ]
    
    passed = 0
    failed = 0
    
    for original, expected in test_cases:
        result = normalize_product_name(original)
        if result == expected:
            print(f"   '{original}' -> '{result}'")
            passed += 1
        else:
            print(f"   '{original}' -> '{result}' (esperado: '{expected}')")
            failed += 1
    
    print(f" Normalizao: {passed} passou, {failed} falharam\n")
    return failed == 0

def test_filename_generation():
    """Testa a gerao de nomes de arquivos."""
    print(" Testando gerao de nomes de arquivos...")
    
    test_cases = [
        ("Po de Acar", "model", "prophet_model_Pao_de_Acucar.pkl"),
        ("Caf Expresso", "params", "prophet_params_Cafe_Expresso.json"),
        ("Bolo de Chocolate", "model", "prophet_model_Bolo_de_Chocolate.pkl"),
    ]
    
    passed = 0
    failed = 0
    
    for product, file_type, expected in test_cases:
        result = get_normalized_filename(product, file_type)
        if result == expected:
            print(f"   '{product}' ({file_type}) -> '{result}'")
            passed += 1
        else:
            print(f"   '{product}' ({file_type}) -> '{result}' (esperado: '{expected}')")
            failed += 1
    
    print(f" Gerao de nomes: {passed} passou, {failed} falharam\n")
    return failed == 0

def test_reverse_normalization():
    """Testa a converso reversa para exibio."""
    print(" Testando converso reversa para exibio...")
    
    test_cases = [
        ("Pao_de_Acucar", "Po de Acar"),
        ("Cafe_Expresso", "Caf Expresso"),
        ("Pao_Frances", "Po Francs"),
        ("Bolo_de_Chocolate", "Bolo de Chocolate"),
        ("Unknown_Product", "Unknown Product"),  # fallback test
    ]
    
    passed = 0
    failed = 0
    
    for normalized, expected in test_cases:
        result = reverse_normalize_for_display(normalized)
        if result == expected:
            print(f"   '{normalized}' -> '{result}'")
            passed += 1
        else:
            print(f"   '{normalized}' -> '{result}' (esperado: '{expected}')")
            failed += 1
    
    print(f" Converso reversa: {passed} passou, {failed} falharam\n")
    return failed == 0

def test_model_files_exist():
    """Verifica se todos os arquivos de modelo existem com nomes corretos."""
    print(" Verificando existncia de arquivos de modelo...")
    
    models_dir = Path('trained_models')
    if not models_dir.exists():
        print(" Diretrio trained_models no encontrado!")
        return False
    
    expected_files = []
    for product in get_all_display_product_names():
        model_file = get_normalized_filename(product, 'model')
        params_file = get_normalized_filename(product, 'params')
        expected_files.extend([model_file, params_file])
    
    passed = 0
    failed = 0
    
    for filename in expected_files:
        file_path = models_dir / filename
        if file_path.exists():
            print(f"   {filename}")
            passed += 1
        else:
            print(f"   {filename} (no encontrado)")
            failed += 1
    
    print(f" Arquivos: {passed} encontrados, {failed} faltando\n")
    return failed == 0

def test_no_problematic_files():
    """Verifica se no h mais arquivos com encoding problemtico."""
    print(" Verificando ausncia de arquivos problemticos...")
    
    models_dir = Path('trained_models')
    if not models_dir.exists():
        print(" Diretrio trained_models no encontrado!")
        return False
    
    # Padres que indicam problemas de encoding
    problematic_patterns = ['', '', '', '', '', '']
    
    problematic_files = []
    for file_path in models_dir.iterdir():
        filename = file_path.name
        for pattern in problematic_patterns:
            if pattern in filename:
                problematic_files.append(filename)
                break
    
    if not problematic_files:
        print("   Nenhum arquivo problemtico encontrado")
        return True
    else:
        print("   Arquivos problemticos ainda existem:")
        for filename in problematic_files:
            print(f"    - {filename}")
        return False

def test_json_params_encoding():
    """Testa se os arquivos JSON de parmetros tm encoding correto."""
    print(" Testando encoding dos arquivos de parmetros...")
    
    models_dir = Path('trained_models')
    if not models_dir.exists():
        print(" Diretrio trained_models no encontrado!")
        return False
    
    passed = 0
    failed = 0
    
    for json_file in models_dir.glob('prophet_params_*.json'):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Verifica se tem as chaves bsicas esperadas
            required_keys = ['changepoint_prior_scale', 'seasonality_prior_scale', 'holidays_prior_scale']
            if all(key in data for key in required_keys):
                print(f"   {json_file.name}")
                passed += 1
            else:
                print(f"    {json_file.name} (estrutura incompleta)")
                failed += 1
                
        except Exception as e:
            print(f"   {json_file.name} (erro: {e})")
            failed += 1
    
    print(f" Arquivos JSON: {passed} vlidos, {failed} com problemas\n")
    return failed == 0

def test_import_capabilities():
    """Testa se os mdulos podem ser importados corretamente."""
    print(" Testando importao de mdulos...")
    
    modules_to_test = [
        'product_name_utils',
        'ai_service',
        'model_trainer',
        'model_predictor',
    ]
    
    passed = 0
    failed = 0
    
    for module_name in modules_to_test:
        try:
            __import__(module_name)
            print(f"   {module_name}")
            passed += 1
        except Exception as e:
            print(f"   {module_name} (erro: {e})")
            failed += 1
    
    print(f" Importaes: {passed} sucessos, {failed} falhas\n")
    return failed == 0

def main():
    """Executa todos os testes de validao."""
    print(" Iniciando validao das correes de encoding...")
    print("=" * 60)
    
    tests = [
        ("Normalizao de Nomes", test_product_name_normalization),
        ("Gerao de Nomes de Arquivo", test_filename_generation),
        ("Converso Reversa", test_reverse_normalization),
        ("Existncia de Arquivos", test_model_files_exist),
        ("Ausncia de Problemas", test_no_problematic_files),
        ("Encoding JSON", test_json_params_encoding),
        ("Importao de Mdulos", test_import_capabilities),
    ]
    
    passed_tests = 0
    total_tests = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n {test_name}")
        print("-" * 40)
        try:
            result = test_func()
            if result:
                passed_tests += 1
                print(f" {test_name}: PASSOU")
            else:
                print(f" {test_name}: FALHOU")
        except Exception as e:
            print(f" {test_name}: ERRO - {e}")
    
    print("\n" + "=" * 60)
    print(" RESUMO FINAL")
    print(f" Testes que passaram: {passed_tests}/{total_tests}")
    print(f" Testes que falharam: {total_tests - passed_tests}/{total_tests}")
    
    if passed_tests == total_tests:
        print("\n TODOS OS TESTES PASSARAM!")
        print("As correes de encoding foram aplicadas com sucesso.")
        return True
    else:
        print(f"\n  {total_tests - passed_tests} TESTE(S) FALHARAM")
        print("Algumas correes podem precisar de ajustes.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)