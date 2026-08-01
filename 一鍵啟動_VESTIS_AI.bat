@echo off
cd /d "%~dp0"
echo [VESTIS AI] 正在啟動本地伺服器...
echo [注意] 使用過程中請勿關閉此視窗
start "" /b py vestis_server.py
timeout /t 2 /nobreak >nul
start "" http://localhost:8000/index.html
pause