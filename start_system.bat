@echo off
setlocal enabledelayedexpansion
goto :main

:sleep
powershell -NoLogo -NoProfile -Command "Start-Sleep -Seconds %~1" >nul
exit /b 0

:main
echo.
echo ==========================================
echo    SYNVIA PLATFORM
echo    ORQUESTRACAO ULTRA RAPIDA
echo ==========================================
echo.

if not exist "ai_module" (
    echo [ERRO] Execute este script na pasta raiz do projeto.
    echo Caminho esperado: C:\projects\FIAP\Fase7\Santa-Marcelina
    pause
    exit /b 1
)

echo [INFO] Parando processos existentes em 3000, 8080 e 5001...
for %%p in (3000 8080 5001) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%p"') do (
        taskkill /f /pid %%a >nul 2^>^&1
    )
)

echo [INFO] Aguardando liberacao das portas...
call :sleep 2

echo.
echo ==========================================
echo           INICIANDO SERVICOS
echo ==========================================

echo [1/3] AI Service (Python) - Porta 5001 (HTTP)...
start "AI Service" cmd /k "cd /d %~dp0ai_module && set USE_HTTPS=false && echo [AI] Iniciando em HTTP (5001)... && python ai_service.py"
call :sleep 5

echo [2/3] Backend (Spring) - Porta 8080 (HTTP)...
start "Backend API" cmd /k "cd /d %~dp0synvia-core && echo [API] Iniciando em HTTP (8080)... && mvn spring-boot:run"
call :sleep 10

echo [3/3] Frontend (React) - Porta 3000 (HTTP)...
start "Frontend Web" cmd /k "cd /d %~dp0FrontGoDgital && echo [WEB] Iniciando em HTTP (3000)... && npm start"

echo.
echo ==========================================
echo        AGUARDANDO INICIALIZACAO
echo ==========================================

set /a countdown=15
:wait_loop
if !countdown! gtr 0 (
    echo Aguardando: !countdown!s restantes...
    call :sleep 1
    set /a countdown-=1
    goto :wait_loop
)

echo.
echo ==========================================
echo         VERIFICACAO DE STATUS
echo ==========================================

set /a services_ok=0
for %%p in (3000:Frontend 8080:Backend 5001:AI-Service) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%p") do (
        netstat -an | findstr ":%%a" >nul
        if !errorlevel!==0 (
            echo   %%b ativo na porta %%a
            set /a services_ok+=1
        ) else (
            echo   %%b NAO encontrado na porta %%a
        )
    )
)

echo.
if !services_ok!==3 (
    echo ==========================================
    echo            SISTEMA PRONTO!
    echo ==========================================
    echo ACESSO PRINCIPAL: http://localhost:3000
    echo LOGIN: admin@synvia.io / admin123
    echo Backend API: http://localhost:8080/api
    echo AI Service:  http://localhost:5001/api/ai
    echo Swagger:     http://localhost:8080/swagger-ui.html
    echo.
    echo Abrindo sistema no navegador...
    call :sleep 2
    start http://localhost:3000
) else (
    echo ==========================================
    echo            PROBLEMA DETECTADO
    echo ==========================================
    echo Apenas !services_ok!/3 servicos iniciaram corretamente.
    echo.
    echo SOLUCOES:
    echo 1. Aguarde mais alguns segundos e revise os terminais abertos
    echo 2. Execute system_status.bat para diagnostico
    echo 3. Execute stop_system.bat e tente novamente
)

echo.
echo ==========================================
pause
exit /b 0
