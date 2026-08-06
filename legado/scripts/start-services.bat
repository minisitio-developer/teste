@echo off
REM =====================================================================
REM start-services.bat
REM Descricao: Iniciador rapido e silencioso do Minisitio (sem Docker)
REM            Inicia o Backend (Node.js porta 3032) e o Frontend
REM            (http-server porta 3000) em background, salvando logs
REM            em back.log e front.log. Minimalista — sem verificacoes
REM            de pré-requisitos ou liberacao de portas.
REM Uso:       Execute no prompt ou D duplo-clique nesta pasta
REM =====================================================================
cd /d "%~dp0back"
start /b node index.js > back.log 2>&1
echo Backend started on port 3032
timeout /t 3 /nobreak > nul
cd /d "%~dp0front"
start /b npx http-server build -p 3000 > front.log 2>&1
echo Frontend started on port 3000
echo.
echo Services started:
echo - Backend: http://localhost:3032
echo - Frontend: http://localhost:3000
pause