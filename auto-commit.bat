@echo off
REM Auto-commit to GitHub every 15 minutes
REM This script continuously monitors for changes and commits them automatically

setlocal enabledelayedexpansion

echo.
echo 🚀 Starting auto-commit service...
echo Repository: %CD%
echo Commit interval: 15 minutes
echo.

REM Check if git is initialized
if not exist ".git" (
  echo ❌ Git repository not found. Please initialize git first.
  exit /b 1
)

REM Get the current branch
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
echo 📍 Current branch: %BRANCH%
echo.

:loop
REM Show current time
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set mydate=%%c-%%a-%%b
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do set mytime=%%a:%%b

echo ⏰ %mydate% %mytime% - Checking for changes...

REM Check for changes using git status
git diff-index --quiet HEAD --
if errorlevel 1 (
  echo 📝 Changes detected, committing...
  
  REM Stage all changes
  git add -A
  
  REM Create commit message with timestamp
  set "COMMIT_MSG=Auto-commit: %mydate% %mytime%"
  
  REM Commit
  git commit -m "%COMMIT_MSG%"
  if not errorlevel 1 (
    echo ✓ Committed: %COMMIT_MSG%
    
    REM Push to GitHub
    git push origin %BRANCH%
    if not errorlevel 1 (
      echo ✓ Pushed to GitHub successfully
    ) else (
      echo ⚠️  Push failed. Check your connection and GitHub credentials.
    )
  ) else (
    echo ⚠️  Commit failed
  )
) else (
  echo ✅ No changes detected
)

echo.
echo 💤 Waiting 15 minutes until next check...
echo ---
echo.

REM Wait for 15 minutes (900 seconds)
timeout /t 900 /nobreak

goto loop
