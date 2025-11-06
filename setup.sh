#!/bin/bash

# Meeting Whisperer - Setup Script for macOS/Linux
# Run this to set up the project

echo "🎙️ Meeting Whisperer - Setup Script"
echo "===================================="
echo

# Check prerequisites
echo "Checking prerequisites..."

# Check Python
if command -v python3 &> /dev/null; then
    echo "✓ Python installed: $(python3 --version)"
else
    echo "✗ Python not found. Please install Python 3.11+"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    echo "✓ Node.js installed: $(node --version)"
else
    echo "✗ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo
echo "📦 Setting up backend..."

# Backend setup
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
    fi
    echo "⚠️  Please edit backend/.env and add your OpenAI API key!"
fi

cd ..

echo
echo "📦 Setting up frontend..."

# Frontend setup
cd frontend

# Install dependencies
echo "Installing Node dependencies (this may take a while)..."
npm install

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        echo "VITE_API_URL=http://localhost:8000" > .env
    fi
fi

cd ..

echo
echo "✅ Setup complete!"
echo
echo "Next steps:"
echo "1. Edit backend/.env and add your OpenAI API key"
echo "2. Run: ./start.sh (or use Docker: docker-compose up)"
echo "3. Open http://localhost:3000 in your browser"
echo
echo "Happy coding! 🚀"