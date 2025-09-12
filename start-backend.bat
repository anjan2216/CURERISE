@echo off
echo Starting CureRise Backend Server...
echo.

cd backend

echo Checking if Python is available...
py --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python and try again.
    pause
    exit /b 1
)

echo Installing dependencies...
py -m pip install -r requirements.txt

echo.
echo Starting Flask server...
echo Server will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

py app.py

pause
