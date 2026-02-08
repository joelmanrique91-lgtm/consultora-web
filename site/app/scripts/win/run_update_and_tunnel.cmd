@echo off
setlocal

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%..\.."

node -v >nul 2>&1
if errorlevel 1 (
  echo [run_update_and_tunnel] ERROR: Node.js no esta instalado o no esta en PATH.
  pause
  exit /b 1
)

npm -v >nul 2>&1
if errorlevel 1 (
  echo [run_update_and_tunnel] ERROR: npm no esta disponible en PATH.
  pause
  exit /b 1
)

npm run update-and-run
if errorlevel 1 (
  echo [run_update_and_tunnel] ERROR: fallo npm run update-and-run.
  pause
  exit /b 1
)

endlocal
