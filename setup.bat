@echo off
REM QuickRide Setup Script for Windows

echo ========================================
echo QuickRide Setup Starting...
echo ========================================

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

echo + Node.js found

REM Check MongoDB (optional)
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ~ MongoDB not found. Make sure MongoDB is installed and running.
)

echo.
echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo Installing admin dashboard...
cd admin-dashboard
call npm install
cd ..

echo.
echo Installing rider app...
cd frontend\rider-app
call npm install
cd ..\..

echo.
echo Installing driver app...
cd frontend\driver-app
call npm install
cd ..\..

echo.
echo Creating backend .env file...
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo Please update backend\.env with your configuration values.
    echo.
)

REM Create logs directory
if not exist backend\logs mkdir backend\logs

REM Create SSL directory
if not exist deployment\ssl mkdir deployment\ssl

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update backend\.env with your API keys
echo    - Firebase credentials
echo    - Google Maps API key
echo    - Razorpay keys
echo    - Twilio credentials
echo.
echo 2. Start MongoDB:
echo    net start MongoDB   (Windows)
echo.
echo 3. Run the backend:
echo    cd backend ^&^& npm run dev
echo.
echo 4. Run the admin dashboard:
echo    cd admin-dashboard ^&^& npm run dev
echo.
echo 5. Run mobile apps:
echo    cd frontend\rider-app ^&^& npx react-native run-android
echo    cd frontend\driver-app ^&^& npx react-native run-android
echo.
echo Documentation:
echo   - README.md       : Project overview
echo   - docs\API.md     : API documentation
echo   - docs\DEPLOYMENT.md : Deployment guide
echo.
echo Happy coding!
pause