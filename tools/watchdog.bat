@echo off
REM Watchdog: check backend (port 3000) and gateway (port 80) INDEPENDENTLY.
REM Previous version checked port 80 only when the backend was down, so a dead
REM gateway with a healthy backend was never restarted. Fixed 2026-08-21.

cd /d C:\portfolio

REM --- backend check ---
netstat -ano | findstr ":3000" | findstr LISTENING >nul 2>&1
if %errorlevel% neq 0 (
    echo [%date% %time%] Backend DOWN, restarting... >> logs\watchdog.log
    start "portfolio-backend" /min cmd /c "node dist\main.js > logs\backend.log 2>&1"
    timeout /t 5 /nobreak >nul
)

REM --- gateway check (runs regardless of backend state) ---
netstat -ano | findstr ":80 " | findstr LISTENING >nul 2>&1
if %errorlevel% neq 0 (
    echo [%date% %time%] Gateway DOWN, restarting... >> logs\watchdog.log
    start "portfolio-gateway" /min cmd /c "node dist\gateway.js > logs\gateway.log 2>&1"
    timeout /t 3 /nobreak >nul
)

exit /b 0
