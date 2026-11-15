@echo off
rem Modo demo sin internet: compila el frontend apuntando a http://localhost:8000 y lo sirve en
rem http://localhost:5173. Antes, levantar la API con demo.bat del backend.
rem Uso: demo.bat                      (la API ya está corriendo)
rem      demo.bat D:\ruta\al\backend   (además abre la API en otra ventana)
rem Node: usa el Node 22 portátil de %LOCALAPPDATA%\Programs\node22 (u otra carpeta en NODE22_DIR) antes que el
rem del sistema; Vite 8 exige Node ^20.19 o >= 22.12.
setlocal
cd /d "%~dp0"

if not defined NODE22_DIR set "NODE22_DIR=%LOCALAPPDATA%\Programs\node22"
if exist "%NODE22_DIR%\node.exe" set "PATH=%NODE22_DIR%;%PATH%"

where node >nul 2>nul || (
  echo No se encontro Node.js. Instala Node 22 o copia el portatil en "%NODE22_DIR%".
  exit /b 1
)
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=12)||(a===20&&b>=19)?0:1)" || (
  for /f %%v in ('node -v') do echo Node %%v es muy antiguo para Vite 8: se necesita 20.19+ o 22.12+.
  echo Copia el Node 22 portatil en "%NODE22_DIR%" o define NODE22_DIR con su carpeta.
  exit /b 1
)
for /f %%v in ('node -v') do echo Usando Node %%v

if not exist node_modules\.bin\vite.cmd (
  echo Faltan las dependencias: corre "npm ci" una vez con internet.
  exit /b 1
)

if not "%~1"=="" (
  if not exist "%~1\demo.bat" (
    echo No se encontro demo.bat en "%~1".
    exit /b 1
  )
  start "API Ruta del Agua (demo)" cmd /k ""%~1\demo.bat""
)
call npm run demo
