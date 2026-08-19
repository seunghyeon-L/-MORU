@echo off
REM ─────────────────────────────────────────────
REM  MORU 개발 DB 터널
REM
REM  이 창을 켜두면 내 PC의 localhost:5432 가
REM  서버(1.201.117.54)의 PostgreSQL 로 연결됩니다.
REM
REM  사용법: 더블클릭하고 창을 그대로 두세요.
REM         끄려면 창을 닫거나 Ctrl+C.
REM ─────────────────────────────────────────────

set KEY=%USERPROFILE%\.ssh\moru_team
set SERVER=root@1.201.117.54

if not exist "%KEY%" (
    echo.
    echo  [!] SSH 키를 찾을 수 없습니다:  %KEY%
    echo.
    echo      팀에서 받은 moru_team 파일을 아래 위치에 넣어주세요.
    echo      %USERPROFILE%\.ssh\
    echo.
    pause
    exit /b 1
)

echo.
echo  ┌──────────────────────────────────────┐
echo  │  MORU DB 터널 연결 중...             │
echo  └──────────────────────────────────────┘
echo.
echo   localhost:5432  ->  서버 PostgreSQL
echo.
echo   이 창을 닫지 마세요. 닫으면 DB 연결이 끊깁니다.
echo.

ssh -i "%KEY%" -o StrictHostKeyChecking=no -L 5432:127.0.0.1:5432 %SERVER% -N

echo.
echo  터널이 종료되었습니다.
pause
