@echo off
REM 个人网站启动脚本（Windows Server）
REM 启动后端 NestJS (3000) + 网关 (80)
REM
REM 用法：双击或计划任务调用此脚本。需要 Node.js 在 PATH 中。

cd /d "%~dp0"

echo [portfolio] 启动后端 NestJS (端口 3000)...
start "portfolio-backend" /min cmd /c "node dist\main.js > logs\backend.log 2>&1"

REM 等待后端就绪
timeout /t 3 /nobreak >nul

echo [portfolio] 启动网关 (端口 80)...
start "portfolio-gateway" /min cmd /c "node dist\gateway.js > logs\gateway.log 2>&1"

echo [portfolio] 已启动。
echo   后端: http://localhost:3000
echo   网关: http://localhost
exit /b 0
