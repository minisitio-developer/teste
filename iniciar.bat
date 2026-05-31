@echo off
echo ==== INICIANDO MINISITIO ====
echo.

echo [1/2] Iniciando Backend (porta 3032)...
cd /d "%~dp0back"
start /b cmd /c "node index.js"
timeout /t 3 /nobreak > nul

echo [2/2] Iniciando Frontend (porta 3000)...
cd /d "%~dp0front"
start /b cmd /c "npx http-server build -p 3000"
timeout /t 2 /nobreak > nul

echo.
echo ==== SERVIÇOS INICIADOS ====
echo - Backend: http://localhost:3032
echo - Frontend: http://localhost:3000
echo.
echo Pressione qualquer tecla para sair...
pause > nul