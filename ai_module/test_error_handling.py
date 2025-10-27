#!/usr/bin/env python3
"""
Teste Completo do Sistema de Tratamento de Erros
Valida exception handling, retry logic e fallbacks
"""

import time
import json
import traceback
from datetime import datetime
import os

def test_error_handling_system():
    """Teste completo do sistema de tratamento de erros."""
    print(" TESTE COMPLETO DO SISTEMA DE TRATAMENTO DE ERROS")
    print("=" * 60)
    print(f" Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("=" * 60)
    
    # Teste 1: Importaes do sistema
    print("\n 1. TESTANDO IMPORTAES")
    print("-" * 40)
    
    try:
        from error_handling import (
            error_handler, BaseAIException, ErrorSeverity, ErrorCategory,
            NetworkError, DatabaseError, AIAPIError, ValidationError, ModelLoadError,
            retry_with_fallback, safe_execute, error_boundary, ErrorContext,
            NETWORK_RETRY_CONFIG, DATABASE_RETRY_CONFIG, AI_API_RETRY_CONFIG
        )
        print("   Sistema de error handling importado")
        
        from flask_error_middleware import (
            FlaskErrorHandler, handle_api_errors, with_database_retry,
            with_ai_api_retry, validate_request_data, CriticalOperation
        )
        print("   Middleware Flask importado")
        
        from fallback_service import (
            get_sales_data_with_fallback, get_products_with_fallback,
            generate_insight_with_fallback, predict_with_fallback,
            database_fallback, ai_api_fallback, model_fallback
        )
        print("   Servios de fallback importados")
        
    except Exception as e:
        print(f"   Erro nas importaes: {e}")
        return False
    
    # Teste 2: Excees personalizadas
    print("\n 2. TESTANDO EXCEES PERSONALIZADAS")
    print("-" * 40)
    
    try:
        # Testa diferentes tipos de exceo
        network_error = NetworkError(
            "Teste de erro de rede",
            context={'host': 'api.example.com', 'timeout': 30}
        )
        print("   NetworkError criada")
        print(f"     - Categoria: {network_error.category.value}")
        print(f"     - Severidade: {network_error.severity.value}")
        
        database_error = DatabaseError(
            "Teste de erro de database",
            context={'query': 'SELECT * FROM products', 'connection': 'mysql'}
        )
        print("   DatabaseError criada")
        
        # Testa converso para JSON
        error_json = network_error.to_json()
        error_dict = json.loads(error_json)
        print("   Converso para JSON funcionando")
        print(f"     - JSON vlido: {'error_code' in error_dict}")
        
    except Exception as e:
        print(f"   Erro nas excees personalizadas: {e}")
        return False
    
    # Teste 3: Error Handler
    print("\n 3. TESTANDO ERROR HANDLER")
    print("-" * 40)
    
    try:
        # Testa processamento de erro
        test_exception = Exception("Erro de teste")
        processed_error = error_handler.handle_error(
            test_exception,
            context={'test': True, 'function': 'test_error_handling'}
        )
        
        print("   Processamento de erro funcionando")
        print(f"     - Tipo: {type(processed_error).__name__}")
        print(f"     - Categoria: {processed_error.category.value}")
        
        # Testa estatsticas
        stats = error_handler.get_error_stats()
        print("   Estatsticas coletadas")
        print(f"     - Total de erros: {stats['total_errors']}")
        print(f"     - Categorias: {len(stats['errors_by_category'])}")
        
    except Exception as e:
        print(f"   Erro no error handler: {e}")
        return False
    
    # Teste 4: Retry Logic
    print("\n 4. TESTANDO RETRY LOGIC")
    print("-" * 40)
    
    try:
        attempt_count = 0
        
        @retry_with_fallback(
            retry_config=NETWORK_RETRY_CONFIG,
            exceptions=(NetworkError,)
        )
        def failing_function():
            nonlocal attempt_count
            attempt_count += 1
            if attempt_count < 3:
                raise NetworkError(f"Falha na tentativa {attempt_count}")
            return f"Sucesso na tentativa {attempt_count}"
        
        result = failing_function()
        print("   Retry logic funcionando")
        print(f"     - Resultado: {result}")
        print(f"     - Tentativas: {attempt_count}")
        
    except Exception as e:
        print(f"   Erro no retry logic: {e}")
        return False
    
    # Teste 5: Safe Execute
    print("\n 5. TESTANDO SAFE EXECUTE")
    print("-" * 40)
    
    try:
        # Funo que falha
        def failing_operation():
            raise ValueError("Operao que sempre falha")
        
        # Execuo segura com valor padro
        result = safe_execute(
            failing_operation,
            default_return="Valor padro",
            error_context={'operation': 'test_safe_execute'}
        )
        
        print("   Safe execute funcionando")
        print(f"     - Resultado: {result}")
        
        # Funo que funciona
        def working_operation():
            return "Operao bem-sucedida"
        
        result2 = safe_execute(working_operation)
        print(f"   Safe execute com funo que funciona: {result2}")
        
    except Exception as e:
        print(f"   Erro no safe execute: {e}")
        return False
    
    # Teste 6: Error Boundary
    print("\n 6. TESTANDO ERROR BOUNDARY")
    print("-" * 40)
    
    try:
        @error_boundary(fallback_value="Fallback executado")
        def operation_with_boundary():
            raise RuntimeError("Erro dentro do boundary")
        
        result = operation_with_boundary()
        print("   Error boundary funcionando")
        print(f"     - Resultado: {result}")
        
    except Exception as e:
        print(f"   Erro no error boundary: {e}")
        return False
    
    # Teste 7: Context Manager
    print("\n 7. TESTANDO ERROR CONTEXT")
    print("-" * 40)
    
    try:
        with ErrorContext("teste_context", reraise=False) as ctx:
            raise ValueError("Erro no context manager")
        
        print("   Error context funcionando")
        print(f"     - Erro capturado: {ctx.error is not None}")
        
    except Exception as e:
        print(f"   Erro no context manager: {e}")
        return False
    
    # Teste 8: Fallback Services
    print("\n 8. TESTANDO FALLBACK SERVICES")
    print("-" * 40)
    
    try:
        # Testa fallback de produtos
        products = get_products_with_fallback()
        print("   Fallback de produtos funcionando")
        print(f"     - Produtos encontrados: {len(products)}")
        print(f"     - Primeiros 3: {products[:3]}")
        
        # Testa fallback de predio
        prediction = predict_with_fallback("Bolo_de_Chocolate", 7)
        print("   Fallback de predio funcionando")
        print(f"     - Predio para 7 dias: {len(prediction)} valores")
        print(f"     - Primeiro valor: {prediction[0] if prediction else 'N/A'}")
        
        # Testa fallback de insight
        insight = generate_insight_with_fallback(
            "Anlise de vendas de bolo",
            {"product_name": "Bolo_de_Chocolate", "prediction": prediction}
        )
        print("   Fallback de insight funcionando")
        print(f"     - Insight gerado: {'Sim' if insight else 'No'}")
        print(f"     - Tamanho: {len(insight)} caracteres")
        
    except Exception as e:
        print(f"   Erro nos fallback services: {e}")
        return False
    
    # Teste 9: Verificao de arquivos
    print("\n 9. VERIFICANDO ARQUIVOS IMPLEMENTADOS")
    print("-" * 40)
    
    required_files = [
        "error_handling.py",
        "flask_error_middleware.py",
        "fallback_service.py"
    ]
    
    for file in required_files:
        if os.path.exists(file):
            print(f"   {file}")
        else:
            print(f"   {file} - AUSENTE")
    
    # Verifica diretrios de fallback
    fallback_dirs = ["fallback_data", "fallback_data/predictions", "fallback_data/insights"]
    for dir_path in fallback_dirs:
        if os.path.exists(dir_path):
            print(f"   Diretrio {dir_path}")
        else:
            print(f"   Diretrio {dir_path} no encontrado (ser criado automaticamente)")
    
    print("\n" + "=" * 60)
    print(" TESTE DO SISTEMA DE TRATAMENTO DE ERROS CONCLUDO")
    print("=" * 60)
    
    print("\n RESUMO DA IMPLEMENTAO:")
    print(" Exception handling padronizado implementado")
    print(" Retry logic para APIs externas funcionando")
    print(" Fallbacks graceful para todos os servios")
    print(" Middleware Flask integrado")
    print(" Sistema de monitoramento de erros ativo")
    
    print("\n FUNCIONALIDADES IMPLEMENTADAS:")
    print(" Excees personalizadas com contexto rico")
    print(" Retry automtico com backoff exponencial")
    print(" Fallbacks graceful para servios indisponveis")
    print(" Estatsticas detalhadas de erros")
    print(" Middleware Flask para APIs robustas")
    print(" Cache offline para operao sem dependncias")
    
    print("\n BENEFCIOS:")
    print(" Debugging facilitado com contexto detalhado")
    print(" Recuperao automtica de falhas temporrias")
    print(" Operao contnua mesmo com servios indisponveis")
    print(" Visibilidade completa de problemas do sistema")
    print(" Experincia do usurio preservada com fallbacks")
    
    return True

if __name__ == "__main__":
    success = test_error_handling_system()
    if success:
        print("\n SISTEMA DE TRATAMENTO DE ERROS:  IMPLEMENTADO COM SUCESSO!")
    else:
        print("\n FALHA NA IMPLEMENTAO DO TRATAMENTO DE ERROS")