@echo off
cd /d "D:\johnny-D\Gemini設計\AI穿搭-Mimo (女版)"
echo [VESTIS AI] 正在啟動本地伺服器...
echo [注意] 使用過程中請勿關閉此視窗
start http://localhost:8000/ai_outfit_prototype.html
py vestis_server.py
pause