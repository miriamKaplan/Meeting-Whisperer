from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from dotenv import load_dotenv
import os
from typing import Dict, List
import asyncio
import tempfile
import subprocess
import json

from app.agents.listener_agent import ListenerAgent
from app.agents.summarizer_agent import SummarizerAgent
from app.agents.task_generator_agent import TaskGeneratorAgent
from app.agents.integration_agent import IntegrationAgent
from app.agents.emotion_agent import EmotionAnalysisAgent
from app.agents.jira_agent import JiraAgent
from app.models import MeetingSession, TranscriptLine, ActionItem

# Load environment variables from backend/.env
from pathlib import Path
backend_dir = Path(__file__).parent.parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

# Initialize FastAPI app
app = FastAPI(
    title="Meeting Whisperer API",
    description="AI-powered meeting assistant with multi-agent architecture",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents
listener_agent = ListenerAgent()
summarizer_agent = SummarizerAgent()
task_generator_agent = TaskGeneratorAgent()
integration_agent = IntegrationAgent()
emotion_agent = EmotionAnalysisAgent()
jira_agent = JiraAgent()

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
                
                # Analyze emotions for this message
                emotion_data = await emotion_agent.analyze_single_message(
                    transcript_line.text, 
                    transcript_line.speaker
                )
                
                # Send transcript with emotion data back to client
                await websocket.send_json({
                    "type": "transcript",
                    "data": {
                        "speaker": transcript_line.speaker,
                        "text": transcript_line.text,
                        "timestamp": transcript_line.timestamp.isoformat(),
                        "emotions": emotion_data
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
    
    # Generate emotion analysis
    emotion_summary = await emotion_agent.analyze_emotions(session.transcript)
    happiness_summary = await emotion_agent.get_happiness_summary(session.transcript)
    
    return {
        "session_id": session_id,
        "summary": summary,
        "emotion_analysis": emotion_summary,
        "happiness_summary": happiness_summary,
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


@app.post("/api/analyze-emotion")
async def analyze_emotion_text(data: dict):
    """Analyze emotion from text using Claude AI (for browser speech recognition)"""
    try:
        text = data.get("text", "")
        speaker = data.get("speaker", "Speaker")
        
        if not text:
            return {"error": "No text provided"}
            
        print(f"🧠 Analyzing emotion for: {speaker}: {text[:50]}...")
        
        # Use the emotion agent to analyze
        emotion_result = await emotion_agent.analyze_single_message(speaker, text)
        
        print(f"✅ Emotion result: {emotion_result}")
        
        # Transform to frontend-expected format
        # Map emotions to happiness percentages
        emotion_to_happiness = {
            'excited': 95,
            'very happy': 90,
            'happy': 80,
            'content': 70,
            'calm': 60,
            'focused': 60,
            'neutral': 50,
            'uncertain': 45,
            'concerned': 35,
            'frustrated': 25,
            'disappointed': 20,
            'sad': 15,
            'angry': 10
        }
        
        primary_emotion = emotion_result.get('primary_emotion', 'neutral')
        happiness_level = emotion_to_happiness.get(primary_emotion, 50)
        
        # Map emotions to sentiment
        positive_emotions = ['excited', 'very happy', 'happy', 'content', 'calm']
        negative_emotions = ['frustrated', 'disappointed', 'sad', 'angry', 'concerned']
        
        if primary_emotion in positive_emotions:
            sentiment = 'positive'
        elif primary_emotion in negative_emotions:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        return {
            'sentiment': sentiment,
            'confidence': emotion_result.get('confidence', 0.8),
            'happiness_level': happiness_level,
            'key_emotions': [primary_emotion, emotion_result.get('energy_level', 'medium')],
            'mood_summary': f"{primary_emotion} ({emotion_result.get('happiness_emoji', '😐')})"
        }
        
    except Exception as e:
        print(f"❌ Emotion analysis error: {e}")
        return {"error": str(e)}


@app.post("/api/generate-action-items")
async def generate_action_items(request: dict):
    """
    Generate action items from transcript lines, checking existing ones to avoid duplicates
    """
    try:
        transcript_data = request.get("transcript", [])
        existing_action_items = request.get("existing_action_items", [])
        
        if not transcript_data:
            return {"action_items": []}
        
        # Convert to TranscriptLine objects
        transcript_lines = []
        for item in transcript_data:
            transcript_lines.append(TranscriptLine(
                speaker=item.get("speaker", "Unknown"),
                text=item.get("text", ""),
                timestamp=item.get("timestamp", "")
            ))
        
        # Convert existing action items to ActionItem objects
        existing_items = []
        for item in existing_action_items:
            existing_items.append(ActionItem(
                text=item.get("text", ""),
                assignee=item.get("assignee"),
                priority=item.get("priority", "medium"),
                confidence=item.get("confidence", 0.8)
            ))
        
        # Use the task generator agent to extract action items with existing context
        action_items = await task_generator_agent.extract_action_items_with_context(
            transcript_lines, existing_items
        )
        
        print(f"✅ Generated {len(action_items)} action items from {len(transcript_lines)} transcript lines (considering {len(existing_items)} existing)")
        
        return {
            "action_items": [item.dict() for item in action_items]
        }
        
    except Exception as e:
        print(f"❌ Action item generation error: {e}")
        return {"error": str(e)}


@app.post("/api/generate-jira-description")
async def generate_jira_description(request: dict):
    """
    Generate a formatted Jira description for an action item
    """
    try:
        action_item_data = request.get("action_item", {})
        
        if not action_item_data:
            return {"error": "No action item data provided"}
        
        # Create ActionItem object
        action_item = ActionItem(
            text=action_item_data.get("text", ""),
            assignee=action_item_data.get("assignee"),
            priority=action_item_data.get("priority", "medium"),
            confidence=action_item_data.get("confidence", 0.8)
        )
        
        # Generate Jira description using task generator
        jira_description = await task_generator_agent.generate_jira_description(action_item)
        
        print(f"✅ Generated Jira description for: {action_item.text}")
        
        return jira_description
        
    except Exception as e:
        print(f"❌ Jira description generation error: {e}")
        return {"error": str(e)}


@app.post("/api/create-jira-ticket")
async def create_jira_ticket(request: dict):
    """
    Create a Jira ticket from an action item
    """
    try:
        action_item_data = request.get("action_item", {})
        
        if not action_item_data:
            return {"error": "No action item provided"}
        
        # Create ActionItem object
        action_item = ActionItem(
            text=action_item_data.get("text", ""),
            assignee=action_item_data.get("assignee"),
            priority=action_item_data.get("priority", "medium"),
            confidence=action_item_data.get("confidence", 0.8)
        )
        
        # Generate Jira description using task generator
        jira_description = await task_generator_agent.generate_jira_description(action_item)
        
        # Create the Jira ticket
        ticket_result = await jira_agent.create_ticket(action_item, jira_description)
        
        print(f"✅ Jira ticket creation result: {ticket_result}")
        
        return ticket_result
        
    except Exception as e:
        print(f"❌ Jira ticket creation error: {e}")
        return {"error": str(e)}


@app.post("/api/process-media-stream")
async def process_media_stream(file: UploadFile = File(...)):
    """
    Process uploaded audio or video file with streaming updates:
    Streams transcript lines as they are processed
    """
    async def generate_stream():
        tmp_path = None
        audio_path = None
        
        try:
            print(f"📹 Processing media file: {file.filename}")
            
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
                content = await file.read()
                tmp_file.write(content)
                tmp_path = tmp_file.name
            
            # Determine if it's video or audio
            is_video = file.content_type and 'video' in file.content_type or \
                      file.filename.lower().endswith(('.mp4', '.mov', '.avi', '.mkv', '.flv', '.webm'))
            
            audio_path = tmp_path
            
            # If it's a video, extract audio using ffmpeg
            if is_video:
                print("🎬 Video detected - extracting audio...")
                yield f"data: {json.dumps({'type': 'status', 'message': 'Extracting audio from video...'})}\n\n"
                
                audio_path = tmp_path.replace(os.path.splitext(tmp_path)[1], '.wav')
                cmd = ['ffmpeg', '-i', tmp_path, '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', audio_path, '-y']
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
                
                if result.returncode != 0:
                    yield f"data: {json.dumps({'type': 'error', 'message': f'ffmpeg error: {result.stderr}'})}\n\n"
                    return
            
            # Transcribe
            yield f"data: {json.dumps({'type': 'status', 'message': 'Transcribing audio...'})}\n\n"
            
            transcript_lines = await listener_agent.transcribe_file(audio_path)
            
            if not transcript_lines:
                yield f"data: {json.dumps({'type': 'error', 'message': 'No speech detected'})}\n\n"
                return
            
            # Stream each transcript line
            for i, line in enumerate(transcript_lines):
                # Analyze emotion
                emotion_result = await emotion_agent.analyze_single_message("Speaker", line.text)
                if emotion_result and emotion_result.get("emotion"):
                    line.emotion = emotion_result.get("emotion")
                    line.emotion_score = emotion_result.get("confidence", 0.5)
                
                # Send transcript line (convert timestamp to string)
                timestamp_str = line.timestamp.isoformat() if hasattr(line.timestamp, 'isoformat') else str(line.timestamp)
                yield f"data: {json.dumps({'type': 'transcript', 'line': {'speaker': line.speaker or 'Unknown', 'text': line.text, 'timestamp': timestamp_str, 'emotion': getattr(line, 'emotion', None), 'emotion_score': getattr(line, 'emotion_score', None)}})}\n\n"
                
                # Generate action items every 3 lines
                if (i + 1) % 3 == 0 or i == len(transcript_lines) - 1:
                    action_items = await task_generator_agent.extract_action_items_with_context(
                        transcript_lines[:i+1], []
                    )
                    if action_items:
                        yield f"data: {json.dumps({'type': 'action_items', 'items': [{'text': item.text, 'priority': item.priority, 'assignee': item.assignee, 'confidence': item.confidence} for item in action_items]})}\n\n"
            
            # Done
            yield f"data: {json.dumps({'type': 'complete', 'message': f'Processed {len(transcript_lines)} lines'})}\n\n"
            
        except Exception as e:
            print(f"❌ Stream processing error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        
        finally:
            # Clean up
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)
            if audio_path and audio_path != tmp_path and os.path.exists(audio_path):
                os.remove(audio_path)
    
    return StreamingResponse(generate_stream(), media_type="text/event-stream")


@app.post("/api/process-media")
async def process_media_file(file: UploadFile = File(...)):
    """
    Process uploaded audio or video file:
    1. Extract audio if it's a video
    2. Transcribe audio using speech recognition
    3. Analyze emotions in the transcript
    4. Generate action items
    """
    try:
        print(f"📹 Processing media file: {file.filename}")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            # Determine if it's video or audio
            is_video = file.content_type and 'video' in file.content_type or \
                      file.filename.lower().endswith(('.mp4', '.mov', '.avi', '.mkv', '.flv', '.webm'))
            
            audio_path = tmp_path
            
            # If it's a video, extract audio using ffmpeg
            if is_video:
                print("🎬 Video detected - extracting audio...")
                audio_path = tmp_path.replace(os.path.splitext(tmp_path)[1], '.wav')
                
                # Use ffmpeg to extract audio
                cmd = ['ffmpeg', '-i', tmp_path, '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', audio_path, '-y']
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
                
                if result.returncode != 0:
                    raise Exception(f"ffmpeg error: {result.stderr}")
            
            # Read audio file
            print("🎙️ Reading audio file...")
            with open(audio_path, 'rb') as f:
                audio_data = f.read()
            
            # Use listener agent to transcribe
            print("🔄 Transcribing audio...")
            transcript_lines = await listener_agent.transcribe_file(audio_path)
            
            if not transcript_lines:
                return {
                    "success": False,
                    "error": "No speech detected in the file",
                    "transcript": []
                }
            
            # Analyze emotions for each line
            print("😊 Analyzing emotions...")
            for line in transcript_lines:
                emotion_result = await emotion_agent.analyze_single_message("Speaker", line.text)
                if emotion_result and emotion_result.get("emotion"):
                    line.emotion = emotion_result.get("emotion")
                    line.emotion_score = emotion_result.get("confidence", 0.5)
            
            # Generate action items from the transcript
            print("📋 Generating action items...")
            action_items = await task_generator_agent.extract_action_items_with_context(
                transcript_lines, []
            )
            
            print(f"✅ Media processing complete: {len(transcript_lines)} lines, {len(action_items)} action items")
            
            return {
                "success": True,
                "filename": file.filename,
                "is_video": is_video,
                "transcript": [
                    {
                        "speaker": line.speaker or "Unknown",
                        "text": line.text,
                        "timestamp": line.timestamp,
                        "emotion": getattr(line, 'emotion', None),
                        "emotion_score": getattr(line, 'emotion_score', None)
                    }
                    for line in transcript_lines
                ],
                "action_items": [
                    {
                        "text": item.text,
                        "priority": item.priority,
                        "assignee": item.assignee,
                        "confidence": item.confidence
                    }
                    for item in action_items
                ]
            }
            
        finally:
            # Clean up temporary files
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            if is_video and os.path.exists(audio_path):
                os.remove(audio_path)
                
    except Exception as e:
        print(f"❌ Media processing error: {e}")
        return {
            "success": False,
            "error": str(e),
            "transcript": []
        }


@app.get("/api/jira-project-info")
async def get_jira_project_info():
    """
    Get information about the configured Jira project
    """
    try:
        project_info = await jira_agent.get_project_info()
        return project_info
        
    except Exception as e:
        print(f"❌ Jira project info error: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
