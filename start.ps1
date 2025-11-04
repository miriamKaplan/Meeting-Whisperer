# Meeting Whisperer - Start Script
# Run this to start both backend and frontend

Write-Host "🎙️ Meeting Whisperer - Starting Services" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Function to start backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\mkaplan\source\repos\Hakton\meeting-whisperer\backend"
    & ".\venv\Scripts\Activate.ps1"
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}

Write-Host "✓ Backend starting on http://localhost:8000" -ForegroundColor Green

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Function to start frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\mkaplan\source\repos\Hakton\meeting-whisperer\frontend"
    npm run dev
}

Write-Host "✓ Frontend starting on http://localhost:3000" -ForegroundColor Green

Write-Host "`nServices are starting..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host "`nOpen http://localhost:3000 in your browser`n" -ForegroundColor Cyan

# Wait for user to press Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host "`nStopping services..." -ForegroundColor Yellow
    Stop-Job $backendJob
    Stop-Job $frontendJob
    Remove-Job $backendJob
    Remove-Job $frontendJob
    Write-Host "✓ All services stopped" -ForegroundColor Green
}
