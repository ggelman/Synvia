@echo off
REM Script para instalar dependências e configurar ambiente AI
echo ==========================================================
echo 🚀 INSTALANDO DEPENDÊNCIAS DO MÓDULO AI
echo ==========================================================

echo.
echo 📋 Verificando Python...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado. Instale Python 3.9+ primeiro.
    pause
    exit /b 1
)

echo.
echo 📦 Instalando dependências...
python -m pip install --upgrade pip
if %errorlevel% neq 0 (
    echo ❌ Erro ao atualizar pip
    pause
    exit /b 1
)

python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)

echo.
echo ✅ Dependências instaladas com sucesso!

echo.
echo 🔧 Testando sistemas implementados...

echo.
echo 📊 Testando sistema de monitoramento...
python test_monitoring_system.py
if %errorlevel% neq 0 (
    echo ⚠️ Problema no sistema de monitoramento
)

echo.
echo 🔍 Testando cache Redis...
python test_final_cache.py
if %errorlevel% neq 0 (
    echo ⚠️ Problema no sistema de cache
)

echo.
echo 🛡️ Testando tratamento de erros...
python test_error_handling.py
if %errorlevel% neq 0 (
    echo ⚠️ Problema no sistema de tratamento de erros
)

echo.
echo ==========================================================
echo 🎉 CONFIGURAÇÃO CONCLUÍDA
echo ==========================================================
echo.
echo 📝 PRÓXIMOS PASSOS:
echo 1. Configure as variáveis de ambiente (.env)
echo 2. Execute: python ai_service.py
echo 3. Acesse: http://localhost:5001
echo 4. Dashboard: http://localhost:5001/monitoring
echo.
echo 🔧 COMANDOS ÚTEIS:
echo - Iniciar serviço: python ai_service.py
echo - Teste completo: python test_integration.py
echo - Monitoramento: python monitoring_system.py
echo.
pause