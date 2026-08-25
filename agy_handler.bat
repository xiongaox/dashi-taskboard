@echo off
set URL=%1
set THREAD_ID=%URL:agy://threads/=%
set THREAD_ID=%THREAD_ID:/=%
set THREAD_ID=%THREAD_ID:"=%

echo ========================================================
echo Antigravity CLI Launcher
echo ========================================================

if "%THREAD_ID%"=="new" (
  echo Launching new conversation...
  agy chat
) else (
  echo Resuming conversation %THREAD_ID%...
  agy chat --resume %THREAD_ID%
)

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERROR] Could not start 'agy' CLI.
  echo Please make sure antigravity-cli is installed and 'agy' is in your PATH.
  pause
)
