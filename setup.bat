@echo off
echo ========================================
echo   AUTO-EXPERT Setup Script
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo [!] IMPORTANT: Please edit .env file and add your Google API Key
    echo     1. Go to https://makersuite.google.com/app/apikey
    echo     2. Create an API key
    echo     3. Edit .env and replace 'your_google_api_key_here' with your actual key
    echo.
    pause
) else (
    echo .env file already exists
    echo.
)

echo Installing dependencies...
call npm install

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To run the application:
echo   1. Make sure your .env file has your Google API Key
echo   2. Run: npm run dev
echo.
echo This will start both frontend and backend servers.
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:5000
echo.
pause
