@echo off
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