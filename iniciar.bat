@echo off
setlocal EnableExtensions
title CanaGest
color 0A
cd /d "%~dp0"

REM  ============================================================
REM   CanaGest - Iniciador
REM  ------------------------------------------------------------
REM   Duplo clique            : inicia o servidor e abre no navegador
REM   iniciar.bat app         : abre em janela de aplicativo (sem barra)
REM   iniciar.bat atalho      : cria atalho na Area de Trabalho
REM   iniciar.bat recompilar  : recompila o codigo e abre
REM  ============================================================

set "ROOT=%~dp0"
set "URL=http://localhost:3000"
set "APP_MODE="

if /i "%~1"=="atalho" goto:make_shortcut
if /i "%~1"=="app" set "APP_MODE=1"
if /i "%~1"=="recompilar" goto:recompilar

:run
echo.
echo  ==============================================
echo    CanaGest  -  Gestao de fazendas de cana
echo  ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 goto:no_node

if exist node_modules\next goto:build_check
echo  [+] Instalando dependencias...
call npm install >nul 2>nul
if errorlevel 1 goto:fail_install

:build_check
if exist .next goto:server
echo  [+] Compilando o aplicativo...
call npm run build
if errorlevel 1 goto:fail_build

:server
call:port_check
if not errorlevel 1 goto:server_ok
echo  [+] Iniciando o servidor em %URL% ...
start "CanaGest - servidor" /min cmd /k "npm start"
call:wait_ready

:server_ok
if defined APP_MODE goto:open_app_mode
echo  [+] Abrindo o CanaGest no navegador...
start "" "%URL%"
goto:done

:open_app_mode
set "BROWSER="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER goto:open_default
echo  [+] Abrindo em janela de aplicativo...
start "" "%BROWSER%" --app=%URL%
goto:done

:open_default
start "" "%URL%"
goto:done

:done
echo.
echo  Dica: no site, clique em "Instalar aplicativo" (barra lateral)
echo  para criar um icone proprio do CanaGest no seu computador.
echo.
if not defined APP_MODE pause
exit /b 0

REM  ============================================================
REM   Rotinas de erro
REM  ============================================================
:no_node
echo  [ERRO] Node.js nao encontrado.
echo         Baixe e instale em: https://nodejs.org
pause
exit /b 1

:fail_install
echo  [ERRO] Falha ao instalar as dependencias.
echo         Execute: npm install
pause
exit /b 1

:fail_build
echo  [ERRO] Falha ao compilar o aplicativo. Veja a mensagem acima.
pause
exit /b 1

:recompilar
if exist ".next" rmdir /s /q ".next"
echo  Compilacao anterior removida. Recompilando...
goto:run

REM  ============================================================
REM   Servidor
REM  ============================================================
:port_check
powershell -NoProfile -Command "try{Invoke-WebRequest -Uri '%URL%' -UseBasicParsing -TimeoutSec 1|Out-Null;exit 0}catch{exit 1}"
exit /b %errorlevel%

:wait_ready
for /l %%i in (1,1,40) do (
  call:port_check
  if not errorlevel 1 goto:ready
  timeout /t 1 /nobreak >nul
)
echo  [AVISO] Servidor ainda nao respondeu; abrindo mesmo assim...
exit /b 0

:ready
echo    Servidor pronto.
exit /b 0

REM  ============================================================
REM   Atalho na Area de Trabalho
REM  ============================================================
:make_shortcut
set "LNK_NAME=CanaGest.lnk"
set "SCR_ICON="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "SCR_ICON=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined SCR_ICON if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "SCR_ICON=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not defined SCR_ICON if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "SCR_ICON=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined SCR_ICON if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "SCR_ICON=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$sh=New-Object -ComObject WScript.Shell; $p=Join-Path ([Environment]::GetFolderPath('Desktop')) '%LNK_NAME%'; $lnk=$sh.CreateShortcut($p); $lnk.TargetPath='%COMSPEC%'; $lnk.Arguments='/c call ""%ROOT%iniciar.bat"" app'; $lnk.WorkingDirectory='%ROOT%'; $lnk.Description='CanaGest'; if('%SCR_ICON%' -ne ''){$lnk.IconLocation='%SCR_ICON%'}; $lnk.WindowStyle=7; $lnk.Save()"
echo.
echo  [+] Atalho "CanaGest" criado na Area de Trabalho.
echo      Ele inicia o servidor e abre o aplicativo em janela propria.
echo.
pause
exit /b 0