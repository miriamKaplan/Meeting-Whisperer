# Meeting Whisperer - Quick Setup Script
# Run this in PowerShell to set up the project

Write-Host "🎙️ Meeting Whisperer - Setup Script" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Setting up backend..." -ForegroundColor Yellow

# Backend setup
Set-Location -Path "backend"

# Create virtual environment
if (!(Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Cyan
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& ".\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt

# Create .env if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please edit backend/.env and add your OpenAI API key!" -ForegroundColor Yellow
}

Set-Location -Path ".."

Write-Host "`n📦 Setting up frontend..." -ForegroundColor Yellow

# Frontend setup
Set-Location -Path "frontend"

# Install dependencies
Write-Host "Installing Node dependencies (this may take a while)..." -ForegroundColor Cyan
npm install

# Create .env if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
}

Set-Location -Path ".."

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env and add your OpenAI API key" -ForegroundColor White
Write-Host "2. Start backend:  cd backend; .\venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --reload" -ForegroundColor White
Write-Host "3. Start frontend: cd frontend; npm run dev" -ForegroundColor White
Write-Host "4. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "`nHappy coding! 🚀" -ForegroundColor Cyan
