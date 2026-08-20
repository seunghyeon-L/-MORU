@echo off
chcp 65001 >nul
title MORU 데모 터널 - 이 창을 닫지 마세요
cd /d C:\Users\lee60\IBS-app

:loop
echo.
echo ==========================================================
echo   MORU 터널 기동 중... 잠시 후 QR 과 주소가 아래에 뜹니다
echo.
echo   보낼 주소:  exp://fyfeltw-anonymous-8082.exp.direct
echo.
echo   [!] 이 창을 닫으면 심사위원 화면도 같이 꺼집니다
echo   [!] 노트북 절전도 꺼두세요
echo ==========================================================
echo.
call npx expo start --tunnel --port 8082
echo.
echo [!] 터널이 종료됐습니다. 5초 뒤 자동으로 다시 켭니다.
echo [!] 완전히 끄려면 이 창을 닫으세요.
timeout /t 5 /nobreak >nul
goto loop
