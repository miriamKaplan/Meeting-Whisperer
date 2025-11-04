from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
from typing import Dict, List
import asyncio

from app.agents.listener_agent import ListenerAgent
from app.agents.summarizer_agent import SummarizerAgent
from app.agents.task_generator_agent import TaskGeneratorAgent
from app.agents.integration_agent import IntegrationAgent
from app.models import MeetingSession, TranscriptLine, ActionItem

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Meeting Whisperer API",
    description="AI-powered meeting assistant with multi-agent architecture",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents
listener_agent = ListenerAgent()
summarizer_agent = SummarizerAgent()
task_generator_agent = TaskGeneratorAgent()
integration_agent = IntegrationAgent()

# Store active meeting sessions
active_sessions: Dict[str, MeetingSession] = {}


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": "Meeting Whisperer",
        "version": "1.0.0",
        "agents": {
            "listener": "ready",
            "summarizer": "ready",
            "task_generator": "ready",
            "integration": "ready"
        }
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "ok",
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "jira_configured": bool(os.getenv("JIRA_API_TOKEN")),
        "teams_configured": bool(os.getenv("TEAMS_WEBHOOK_URL")),
        "slack_configured": bool(os.getenv("SLACK_WEBHOOK_URL"))
    }


@app.websocket("/ws/meeting/{session_id}")
async def meeting_websocket(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time meeting transcription and processing
    """
    await websocket.accept()
    
    # Create new meeting session
    session = MeetingSession(session_id=session_id)
    active_sessions[session_id] = session
    
    try:
        while True:
            # Receive audio data from client
            data = await websocket.receive_bytes()
            
            # Process with Listener Agent (transcription)
            transcript_line = await listener_agent.process_audio(data)
            
            if transcript_line:
                session.transcript.append(transcript_line)
                
                # Send transcript back to client
                await websocket.send_json({
                    "type": "transcript",
                    "data": {
                        "speaker": transcript_line.speaker,
                        "text": transcript_line.text,
                        "timestamp": transcript_line.timestamp.isoformat()
                    }
                })
                
                # Check for action items with Task Generator Agent
                if len(session.transcript) % 5 == 0:  # Check every 5 lines
                    action_items = await task_generator_agent.extract_action_items(
                        session.transcript[-5:]
                    )
                    
                    if action_items:
                        session.action_items.extend(action_items)
                        
                        await websocket.send_json({
                            "type": "action_items",
                            "data": [item.dict() for item in action_items]
                        })
    
    except WebSocketDisconnect:
        print(f"Client disconnected from session {session_id}")
    except Exception as e:
        print(f"Error in WebSocket: {str(e)}")
        await websocket.close(code=1011, reason=str(e))
    finally:
        # Clean up session
        if session_id in active_sessions:
            del active_sessions[session_id]


@app.post("/api/meeting/{session_id}/end")
async def end_meeting(session_id: str):
    """
    End a meeting session and generate summary
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    # Generate summary with Summarizer Agent
    summary = await summarizer_agent.generate_summary(
        transcript=session.transcript,
        action_items=session.action_items
    )
    
    return {
        "session_id": session_id,
        "summary": summary,
        "transcript_lines": len(session.transcript),
        "action_items": len(session.action_items)
    }


@app.post("/api/meeting/{session_id}/create-jira-tasks")
async def create_jira_tasks(session_id: str):
    """
    Create Jira tasks from meeting action items
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    if not session.action_items:
        return {"message": "No action items to create"}
    
    # Create Jira tasks with Integration Agent
    results = await integration_agent.create_jira_tasks(session.action_items)
    
    return {
        "created": len(results),
        "tasks": results
    }


@app.post("/api/meeting/{session_id}/post-summary")
async def post_summary(session_id: str, platform: str = "teams"):
    """
    Post meeting summary to Teams or Slack
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    # Generate summary
    summary = await summarizer_agent.generate_summary(
        transcript=session.transcript,
        action_items=session.action_items
    )
    
    # Post to platform
    if platform.lower() == "teams":
        result = await integration_agent.post_to_teams(summary, session.action_items)
    elif platform.lower() == "slack":
        result = await integration_agent.post_to_slack(summary, session.action_items)
    else:
        raise HTTPException(status_code=400, detail="Invalid platform")
    
    return {
        "platform": platform,
        "status": "posted",
        "result": result
    }


@app.get("/api/sessions")
async def list_sessions():
    """List active meeting sessions"""
    return {
        "active_sessions": len(active_sessions),
        "sessions": [
            {
                "session_id": sid,
                "transcript_lines": len(session.transcript),
                "action_items": len(session.action_items),
                "started_at": session.started_at.isoformat()
            }
            for sid, session in active_sessions.items()
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
