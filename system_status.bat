@echo off
setlocal enabledelayedexpansion
goto :main

:curl_test
powershell -NoLogo -NoProfile -Command "try {  = Invoke-WebRequest -Uri '%~2' -TimeoutSec 5 -UseBasicParsing; Write-Host '   %~1 OK (HTTP' .StatusCode')' } catch { Write-Host '   %~1 inacess?vel' }" 2>nul
exit /b 0

:main
echo.
echo ==========================================
echo    SYNVIA PLATFORM - STATUS EM TEMPO REAL
echo ==========================================
echo.

if not exist "ai_module" (
    echo [ERRO] Execute este script na raiz do projeto.
    exit /b 1
)

echo [INFO] Data/Hora: %date% %time%
echo.
echo ==========================================
echo           STATUS DAS PORTAS (HTTP)
echo ==========================================

set /a total_services=0
set /a active_services=0

for %%s in (3000:Frontend:http://localhost:3000 8080:Backend:http://localhost:8080 5001:AI-Service:http://localhost:5001) do (
    set /a total_services+=1
    for /f "tokens=1,2,3 delims=:" %%a in ("%%s") do (
        netstat -an | findstr ":%%a" >nul
        if !errorlevel!==0 (
            echo   %%b ATIVO na porta %%a - %%c
            set /a active_services+=1
        ) else (
            echo   %%b INATIVO na porta %%a
        )
    )
)

echo.
echo ==========================================
echo         TESTES DE CONECTIVIDADE
echo ==========================================

call :curl_test "Frontend" "http://localhost:3000"
call :curl_test "Backend /actuator/health" "http://localhost:8080/actuator/health"
call :curl_test "AI Service /health" "http://localhost:5001/health"

echo.
echo ==========================================
echo            RESUMO DO SISTEMA
echo ==========================================

set /a percentage=!active_services!*100/!total_services!

if !active_services!==!total_services! (
    echo STATUS: ONLINE (^!percentage!%%^)
    echo ACESSO: http://localhost:3000 (admin@synvia.io / admin123)
) else if !active_services! gtr 0 (
    echo STATUS: PARCIAL (^!percentage!%%^)
    echo ACAO: Verifique os servi?os listados como INATIVOS.
) else (
    echo STATUS: OFFLINE (^!percentage!%%^)
    echo ACAO: Execute start_system.bat.
)

echo.
echo ==========================================
echo             COMANDOS ?TEIS
echo ==========================================
echo start_system.bat           - Inicia os servi?os (HTTP)
echo stop_system.bat            - Encerra os servi?os
echo test_sistema_seguranca.bat - Smoke tests
echo docs/README.md             - ?ndice de documenta??o

echo.
pause
exit /b 0
