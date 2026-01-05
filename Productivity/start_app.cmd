@echo off
echo Starting SiegingGo Productivity App...
echo.
echo [1/2] Checking for Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo Press any key to exit...
    pause >nul
    exit
)

echo [2/2] Launching Local Server...
echo server is running at http://localhost:3000
echo.
echo DO NOT CLOSE THIS WINDOW while using the app.
echo.
start http://localhost:3000
node server.js
