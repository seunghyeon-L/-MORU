@echo off
chcp 65001 >nul
title MORU 상태감시 - 절전방지 - 닫지 마세요
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\lee60\IBS-app\상태감시.ps1"
pause
