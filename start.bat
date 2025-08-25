@echo off
echo ========================================
echo    GymConnect - Iniciando Projeto
echo ========================================
echo.

echo Instalando dependencias...
call npm run install-all

echo.
echo Iniciando servidor e cliente...
call npm run dev

pause
