@echo off
set SCRIPT_DIR=%~dp0
set HANDLER_PATH=%SCRIPT_DIR%agy_handler.bat

echo @echo off > "%HANDLER_PATH%"
echo set URL=%%1 >> "%HANDLER_PATH%"
:: Extract the THREAD_ID from agy://threads/xxx
echo set THREAD_ID=%%URL:agy://threads/=%% >> "%HANDLER_PATH%"
echo set THREAD_ID=%%THREAD_ID:/=%% >> "%HANDLER_PATH%"
echo set THREAD_ID=%%THREAD_ID:"=%% >> "%HANDLER_PATH%"
echo if "%%THREAD_ID%%"=="new" ( >> "%HANDLER_PATH%"
echo   start cmd.exe /k "echo Open new conversation for project... ^& pause" >> "%HANDLER_PATH%"
echo ) else ( >> "%HANDLER_PATH%"
echo   start cmd.exe /k "echo Resuming conversation %%THREAD_ID%%... ^& pause" >> "%HANDLER_PATH%"
echo ) >> "%HANDLER_PATH%"

:: Register the custom protocol (agy://) to HKCU so it doesn't require admin privileges!
REG ADD "HKCU\Software\Classes\agy" /ve /t REG_SZ /d "URL:Antigravity Terminal" /f
REG ADD "HKCU\Software\Classes\agy" /v "URL Protocol" /t REG_SZ /d "" /f
REG ADD "HKCU\Software\Classes\agy\shell\open\command" /ve /t REG_SZ /d "\"%HANDLER_PATH%\" \"%%1\"" /f

echo agy:// protocol has been successfully registered to HKCU!
