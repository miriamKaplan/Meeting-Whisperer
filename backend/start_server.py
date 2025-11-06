#!/usr/bin/env python3
"""
Simple script to start the Meeting Whisperer backend server
"""
import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Import and run the app
if __name__ == "__main__":
    import uvicorn
    from app.main import app
    
    print("🚀 Starting Meeting Whisperer Backend Server with Emotion Analysis!")
    print("📍 Server running at: http://localhost:8000")
    print("📊 Health check: http://localhost:8000/api/health")
    print("💭 Emotion Analysis: Powered by Claude AI")
    print("\nPress Ctrl+C to stop the server")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )