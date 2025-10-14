@echo off
echo ========================================
echo   Block Racers Online - Quick Deploy
echo ========================================
echo.

echo Step 1: Copying files to public directory...
if not exist public mkdir public
copy /Y index.html public\ >nul 2>&1
copy /Y game.html public\ >nul 2>&1
copy /Y creator.html public\ >nul 2>&1
copy /Y console.html public\ >nul 2>&1
copy /Y times.html public\ >nul 2>&1
echo [DONE] Files copied to public directory
echo.

echo Step 2: Deploying to Firebase...
echo.
echo Choose deployment option:
echo   1. Deploy everything (rules + functions + hosting)
echo   2. Deploy hosting only (website files)
echo   3. Deploy security (rules + functions)
echo   4. Cancel
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Deploying everything...
    firebase deploy
) else if "%choice%"=="2" (
    echo.
    echo Deploying hosting only...
    firebase deploy --only hosting
) else if "%choice%"=="3" (
    echo.
    echo Deploying security...
    firebase deploy --only database:rules,functions
) else if "%choice%"=="4" (
    echo.
    echo Deployment cancelled.
    goto :end
) else (
    echo.
    echo Invalid choice. Please run again and choose 1-4.
    goto :end
)

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your game should now be live at:
echo https://your-project-id.web.app
echo.
echo Check Firebase Console for your actual URL.
echo.

:end
pause
