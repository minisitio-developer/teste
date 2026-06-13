@echo off
chcp 65001 > nul
title Minisitio — Inicializador Robusto v3

echo.
echo ╔══════════════════════════════════════════════════╗
echo ║       MINISITIO — INICIADOR ROBUSTO v3          ║
echo ║   Backend: 3032   Frontend: 3000   MySQL: 3307  ║
echo ╚══════════════════════════════════════════════════╝
echo.

REM ── 1. Verificar pré-requisitos ──────────────────────────────
echo [1/6] Verificando pré-requisitos...

where node > nul 2>&1
if %errorlevel% neq 0 (
    echo   [ERRO] Node.js não encontrado. Instale: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v 2^>nul') do echo   Node: %%v

where npm > nul 2>&1
if %errorlevel% neq 0 (
    echo   [ERRO] npm não encontrado.
    pause
    exit /b 1
)

echo   [OK] Node.js e npm encontrados
echo.

REM ── 2. Matar processos nas portas ───────────────────────────
echo [2/6] Liberando portas 3032, 3000 e 3307...

for /f "tokens=5" %%a in ('netstat -aon ^| find ":3032 " 2^>nul') do (
    if not "%%a"=="" (
        echo     Matando PID %%a na porta 3032...
        taskkill /F /PID %%a > nul 2>&1
    )
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000 " 2^>nul') do (
    if not "%%a"=="" (
        echo     Matando PID %%a na porta 3000...
        taskkill /F /PID %%a > nul 2>&1
    )
)

timeout /t 2 /nobreak > nul
echo   [OK] Portas liberadas
echo.

REM ── 3. Verificar .env ───────────────────────────────────────
echo [3/6] Verificando configuração...

if not exist "%~dp0back\.env" (
    echo   [AVISO] back\.env nao encontrado!
    if exist "%~dp0back\.env.example" (
        copy "%~dp0back\.env.example" "%~dp0back\.env" > nul
        echo   [FIX] .env criado a partir de .env.example
        start notepad "%~dp0back\.env"
        echo   Configure as variaveis e salve. Depois pressione qualquer tecla.
        pause
    ) else (
        echo   [ERRO] .env.example tambem nao encontrado!
        pause
        exit /b 1
    )
)

echo   [OK] .env encontrado
echo.

REM ── 4. Verificar MySQL ──────────────────────────────────────
echo [4/6] Verificando MySQL...

set MYSQL_OK=0
for /f "tokens=*" %%r in ('netstat -aon ^| find ":3307 " ^| find "LISTENING" 2^>nul') do set MYSQL_OK=1

if "%MYSQL_OK%"=="1" (
    echo   [OK] MySQL rodando na porta 3307
) else (
    echo   [AVISO] MySQL NAO detectado na porta 3307
    echo          O backend pode falhar ao conectar no banco.
    echo          Verifique se o MySQL esta rodando.
)
echo.

REM ── 5. Instalar dependências (se necessário) ────────────────
echo [5/6] Verificando dependencias...

if not exist "%~dp0back\node_modules" (
    echo   Instalando dependencias do backend...
    cd /d "%~dp0back"
    npm install
)

if not exist "%~dp0front\node_modules" (
    echo   Instalando dependencias do frontend...
    cd /d "%~dp0front"
    npm install
)

echo   [OK] Dependencias verificadas
echo.

REM ── 6. Iniciar serviços ────────────────────────────────────
echo [6/6] Iniciando servicos...

cd /d "%~dp0back"
start "Minisitio Backend" cmd /k "title MINISITIO BACKEND && echo Backend: http://localhost:3032/api && node index.js"
echo   Backend iniciado (PID aguardando...)

timeout /t 5 /nobreak > nul

cd /d "%~dp0front"
if exist "build\index.html" (
    start "Minisitio Frontend" cmd /k "title MINISITIO FRONTEND && echo Frontend: http://localhost:3000 && npx http-server build -p 3000 --cors -c-1"
    echo   Frontend iniciado (build estatico)
) else (
    echo   Build nao encontrado. Iniciando modo dev...
    start "Minisitio Frontend Dev" cmd /k "title MINISITIO FRONTEND DEV && npm start"
)

echo.

REM ── Resumo ─────────────────────────────────────────────────
echo ╔══════════════════════════════════════════════════╗
echo ║            SERVICOS INICIADOS                    ║
echo ║                                                  ║
echo ║  Backend:   http://localhost:3032                ║
echo ║  Frontend:  http://localhost:3000                ║
echo ║  API:       http://localhost:3032/api            ║
echo ║  MySQL:     localhost:3307                       ║
echo ╚══════════════════════════════════════════════════╝
echo.

timeout /t 3 /nobreak > nul
start http://localhost:3000

echo Pressione qualquer tecla para fechar esta janela...
echo (Os servicos continuam rodando nas janelas abertas)
pause > nul
