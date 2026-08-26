@echo off
chcp 65001 >nul
title Antigravity Taskboard
cd /d "%~dp0"

echo ========================================================
echo   Antigravity Taskboard - One-Click Launcher
echo ========================================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js to run Antigravity Taskboard.
    pause
    exit /b 1
)

echo [*] Checking Antigravity status...
tasklist /fi "imagename eq Antigravity.exe" 2>nul | find /i "Antigravity.exe" >nul
if %errorlevel% equ 0 (
    echo [*] Antigravity is running.
) else (
    echo [*] Starting Antigravity...
    if exist "%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" (
        start "" "%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe"
    ) else (
        echo [!] Antigravity executable not found in default location.
    )
)

echo.
echo [*] Starting Taskboard Server (Backend + Web)...
echo [*] Web URL: http://localhost:3000
echo [*] Press Ctrl+C in this window to stop Taskboard.
echo.

call npm run dev
pause