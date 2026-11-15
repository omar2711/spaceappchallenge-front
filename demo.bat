@echo off
rem Modo demo sin internet: compila el frontend apuntando a http://localhost:8000 y lo sirve en
rem http://localhost:5173. Antes, levantar la API con demo.bat del backend.
rem Uso: demo.bat                      (la API ya está corriendo)
rem      demo.bat D:\ruta\al\backend   (además abre la API en otra ventana)
cd /d "%~dp0"
if not "%~1"=="" (
  if not exist "%~1\demo.bat" (
    echo No se encontro demo.bat en "%~1".
    exit /b 1
  )
  start "API Ruta del Agua (demo)" cmd /k ""%~1\demo.bat""
)
call npm run demo
