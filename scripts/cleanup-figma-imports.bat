@echo off
REM ================================================================
REM Alerta+ — Limpeza de arquivos de referencia do Figma Make
REM ================================================================
REM Este script remove os arquivos em src\imports\ que eram apenas
REM referencia visual do Figma e NAO sao importados pelo app.
REM
REM Arquivos MANTIDOS (usados pelo app):
REM   - svg-hkfx6ct22z.ts  (Layout.tsx)
REM   - svg-90w5vqo0ll.ts  (Onboarding.tsx)
REM   - svg-53og7kmmrf.ts  (Onboarding.tsx)
REM   - svg-h2odaglmib.ts  (Splash.tsx)
REM
REM Uso: scripts\cleanup-figma-imports.bat
REM ================================================================

setlocal enabledelayedexpansion

set IMPORTS_DIR=src\imports
set COUNT=0

echo Limpando arquivos de referencia do Figma em %IMPORTS_DIR%...
echo.

for %%F in (%IMPORTS_DIR%\*) do (
    set "filename=%%~nxF"
    set "keep=0"

    if "!filename!"=="svg-hkfx6ct22z.ts" set "keep=1"
    if "!filename!"=="svg-90w5vqo0ll.ts" set "keep=1"
    if "!filename!"=="svg-53og7kmmrf.ts" set "keep=1"
    if "!filename!"=="svg-h2odaglmib.ts" set "keep=1"

    if "!keep!"=="0" (
        echo   Removendo: !filename!
        del "%%F"
        set /a COUNT+=1
    ) else (
        echo   Mantendo:  !filename! (usado pelo app^)
    )
)

echo.
echo Concluido! %COUNT% arquivos removidos.
echo.
echo Arquivos de referencia do Figma que tambem podem ser removidos manualmente:
echo   - replace_font.py
echo   - guidelines\Guidelines.md
echo   - ATTRIBUTIONS.md
echo   - src\app\components\figma\ImageWithFallback.tsx (nao usado pelo app)

endlocal
pause
