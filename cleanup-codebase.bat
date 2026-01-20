@echo off
REM Codebase Cleanup Script
REM Deletes redundant documentation, scripts, and old files
REM Date: January 11, 2026

echo ========================================
echo  CODEBASE CLEANUP SCRIPT
echo ========================================
echo.
echo This will delete 200+ redundant files
echo Press Ctrl+C to cancel, or
pause

cd /d "%~dp0"

echo.
echo [1/6] Deleting documentation files...
del /F /Q ADMIN_*.md 2>nul
del /F /Q AUTH_*.md 2>nul
del /F /Q AUDIT_*.md 2>nul
del /F /Q PHASE_*.md 2>nul
del /F /Q ESLINT_*.md 2>nul
del /F /Q ROUTING_*.md 2>nul
del /F /Q DEPLOYMENT_*.md 2>nul
del /F /Q IMPLEMENTATION_*.md 2>nul
del /F /Q QUICK_*.md 2>nul
del /F /Q *_SUMMARY.md 2>nul
del /F /Q *_COMPLETE.md 2>nul
del /F /Q *_AUDIT.md 2>nul
del /F /Q *_GUIDE.md 2>nul
del /F /Q *_REPORT.md 2>nul
del /F /Q *_INDEX.md 2>nul
del /F /Q *_CHECKLIST.md 2>nul
del /F /Q *_ANALYSIS.md 2>nul
del /F /Q *_VERIFICATION.md 2>nul
del /F /Q *_FIX.md 2>nul
del /F /Q *_FIXED.md 2>nul
echo Done!

echo.
echo [2/6] Deleting old scripts...
del /F /Q check-*.mjs 2>nul
del /F /Q check-*.js 2>nul
del /F /Q fix-*.bat 2>nul
del /F /Q fix-*.sh 2>nul
del /F /Q fix-*.ps1 2>nul
del /F /Q setup-*.ps1 2>nul
del /F /Q setup-*.sh 2>nul
del /F /Q quick-*.bat 2>nul
del /F /Q quick-*.sh 2>nul
del /F /Q targeted-*.bat 2>nul
del /F /Q targeted-*.sh 2>nul
del /F /Q production-*.ps1 2>nul
del /F /Q production-*.sh 2>nul
del /F /Q update-*.mjs 2>nul
del /F /Q verify-*.js 2>nul
echo Done!

echo.
echo [3/6] Deleting old config files...
del /F /Q auth.ts 2>nul
del /F /Q .eslintrc.production.json 2>nul
del /F /Q tsconfig.strict.json 2>nul
del /F /Q tsconfig.scripts.json 2>nul
del /F /Q tsconfig.tsbuildinfo 2>nul
del /F /Q .modified 2>nul
del /F /Q "✅_ADMIN_LOGIN_CLEANUP_READY.txt" 2>nul
echo Done!

echo.
echo [4/6] Deleting SQL files...
del /F /Q *.sql 2>nul
echo Done!

echo.
echo [5/6] Deleting test and build artifacts...
del /F /Q test-*.ts 2>nul
del /F /Q server.log 2>nul
del /F /Q build*.txt 2>nul
del /F /Q lint-output.txt 2>nul
del /F /Q eslint-report.json 2>nul
del /F /Q *.txt 2>nul
del /F /Q deno.lock 2>nul
echo Done!

echo.
echo [6/6] Deleting redundant source files...
del /F /Q "src\app\login\login-selection-content.tsx" 2>nul
del /F /Q "src\app\login\login-selection-new.tsx" 2>nul
del /F /Q "src\app\auth\customer\login\index.ts" 2>nul
del /F /Q "scripts\seed-admin.js" 2>nul
del /F /Q "scripts\seed-admin.mjs" 2>nul
del /F /Q "scripts\setup-admin.mjs" 2>nul
del /F /Q "scripts\setup-admin.ts" 2>nul
del /F /Q "scripts\setup-admin-via-api.mjs" 2>nul
del /F /Q "scripts\manage-admins.js" 2>nul
del /F /Q "scripts\manage-admins.sql" 2>nul
del /F /Q "scripts\test-data-fetch.js" 2>nul
del /F /Q "scripts\verify-admin.js" 2>nul
echo Done!

echo.
echo ========================================
echo  CLEANUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npm run build
echo 2. Test admin login
echo 3. Test customer login
echo 4. Commit changes to git
echo.
pause
