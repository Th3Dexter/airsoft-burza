@echo off
echo ================================================
echo   Testing Airsoft Burza Application
echo ================================================
echo.

echo [1/3] Running TypeScript type checking...
call npm run type-check
if errorlevel 1 (
    echo ERROR: Type checking failed!
    pause
    exit /b 1
)
echo Type checking passed!
echo.

echo [2/3] Running linter...
call npm run lint
if errorlevel 1 (
    echo ERROR: Linting failed!
    pause
    exit /b 1
)
echo Linting passed!
echo.

echo [3/3] Building application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo Build successful!
echo.

echo ================================================
echo   All automated tests passed!
echo   See TESTING_CHECKLIST.md for manual testing
echo ================================================
echo.
pause

