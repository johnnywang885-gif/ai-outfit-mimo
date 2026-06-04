@echo off
cd /d "%~dp0"
echo [VESTIS AI] 正在啟動本地伺服器...
echo [注意] 使用過程中請勿關閉此視窗
start http://localhost:8000/ai_outfit_prototype.html
python -m http.server 8000
pause