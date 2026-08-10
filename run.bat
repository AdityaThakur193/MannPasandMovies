@echo off
title MannPasandMovies Launcher

echo 🔍 Checking dependencies...
if not exist node_modules (
    echo 📦 Root node_modules not found. Installing all dependencies first...
    call npm run install-all
) else if not exist client\node_modules (
    echo 📦 Client node_modules not found. Installing all dependencies first...
    call npm run install-all
) else if not exist server\node_modules (
    echo 📦 Server node_modules not found. Installing all dependencies first...
    call npm run install-all
)

echo 🚀 Starting Frontend and Backend servers concurrently...
call npm run dev
