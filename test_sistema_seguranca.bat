@echo off
setlocal enabledelayedexpansion
goto :main

:check_port
netstat -an | findstr ":%~1" >nul
if %errorlevel%==0 (
    echo   OK: %~2 ativo (%~3)
) else (
    echo   FALHA: %~2 nao encontrado na porta %~1
)
exit /b 0

:curl_test
powershell -NoLogo -NoProfile -Command "try {  = Invoke-WebRequest -Uri '%~2' -TimeoutSec 5 -UseBasicParsing; Write-Host '   %~1 OK (HTTP' .StatusCode')' } catch { Write-Host '   %~1 inacess?vel' }" 2>nul
exit /b 0

:main
echo ==========================================
echo    TESTE RAPIDO - SYNVIA PLATFORM
echo ==========================================
echo.

echo [INFO] Verificando portas (3000 / 8080 / 5001)...
call :check_port 3000 "Frontend" "http://localhost:3000"
call :check_port 8080 "Backend" "http://localhost:8080"
call :check_port 5001 "AI Service" "http://localhost:5001"

echo.
echo ==========================================
echo         TESTES DE CONECTIVIDADE
echo ==========================================

call :curl_test "Frontend" "http://localhost:3000"
call :curl_test "Backend /actuator/health" "http://localhost:8080/actuator/health"
call :curl_test "AI Service /health" "http://localhost:5001/health"

echo.
echo ==========================================
echo             RESUMO
echo ==========================================
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8080/api
echo AI Service:http://localhost:5001/api/ai
echo Login:     admin@synvia.io / admin123
echo.
pause
exit /b 0
