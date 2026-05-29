@echo off
cd /d "%~dp0"
set TZ=Asia/Shanghai
start /min cmd /c "npm start >nul 2>&1 & exit"
exit