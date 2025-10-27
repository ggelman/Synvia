@echo off
setlocal enabledelayedexpansion
goto :main

:sleep
powershell -NoLogo -NoProfile -Command "Start-Sleep -Seconds %~1" >nul
exit /b 0

:main
echo.
echo ==========================================
echo    PARADA RAPIDA DOS SERVICOS SYNVIA
echo ==========================================
echo.

echo [INFO] Finalizando processos nas portas 3000, 8080 e 5001...
set /a stopped=0

for %%p in (3000:Frontend 8080:Backend 5001:AI-Service) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%p") do (
        for /f "tokens=5" %%c in ('netstat -ano 2^>nul ^| findstr ":%%a"') do (
            taskkill /PID %%c /F >nul 2^>^&1
            if !errorlevel!==0 set /a stopped+=1
        )
    )
)

echo [INFO] Aguardando liberacao completa...
call :sleep 2

echo.
echo ==========================================
echo          VERIFICACAO FINAL
echo ==========================================

set /a ports_free=0
for %%p in (3000 8080 5001) do (
    netstat -an | findstr ":%%p" >nul 2^>^&1
    if !errorlevel! neq 0 (
        echo   Porta %%p livre
        set /a ports_free+=1
    ) else (
        echo   Porta %%p ainda ocupada
    )
)

echo.
if !ports_free!==3 (
    echo Todos os servicos foram encerrados com sucesso.
) else (
    echo Ainda existem processos ativos. Feche manualmente os terminais, se necessario.
)

echo.
echo ==========================================
pause
exit /b 0
