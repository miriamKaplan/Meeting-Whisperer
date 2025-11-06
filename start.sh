#!/bin/bash

# Meeting Whisperer - Start Script for macOS/Linux
# Run this to start both backend and frontend

echo "🎙️ Meeting Whisperer - Starting Services"
echo "========================================"
echo

# Function to cleanup background processes
cleanup() {
    echo
    echo "Stopping services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "✓ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend..."
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

echo "✓ Backend starting on http://localhost:8000"

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✓ Frontend starting on http://localhost:3000"
echo
echo "Services are starting..."
echo "Press Ctrl+C to stop all services"
echo
echo "Open http://localhost:3000 in your browser"
echo

# Wait for user to press Ctrl+C
wait