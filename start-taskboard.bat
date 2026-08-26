@echo off
title Antigravity Taskboard
cd /d "%~dp0"

echo ========================================================
echo   Antigravity Taskboard - One-Click Launcher
echo ========================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js (v22+) to run Antigravity Taskboard.
    pause
    exit /b 1
)

tasklist /FI "IMAGENAME eq Antigravity.exe" 2>NUL | find /I /N "Antigravity.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [*] Antigravity is already running.
) else (
    echo [*] Starting Antigravity...
    if exist "%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" (
        start "" "%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe"
    ) else (
        echo [*] Antigravity executable not found in default location, please start it manually.
    )
)

echo.
echo [*] Starting Taskboard Server (Backend + Web)...
echo [*] Web URL: http://localhost:3000
echo [*] Press Ctrl+C in this window to stop Taskboard.
echo.

npm run dev
