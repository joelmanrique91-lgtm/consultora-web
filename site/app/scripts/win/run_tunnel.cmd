@echo off
setlocal

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%..\.."

node -v >nul 2>&1
if errorlevel 1 (
  echo [run_tunnel] ERROR: Node.js no esta instalado o no esta en PATH.
  pause
  exit /b 1
)

npm -v >nul 2>&1
if errorlevel 1 (
  echo [run_tunnel] ERROR: npm no esta disponible en PATH.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [run_tunnel] Instalando dependencias...
  npm install
  if errorlevel 1 (
    echo [run_tunnel] ERROR: fallo npm install.
    pause
    exit /b 1
  )
)

npm run tunnel
if errorlevel 1 (
  echo [run_tunnel] ERROR: fallo npm run tunnel.
  pause
  exit /b 1
)

endlocal
