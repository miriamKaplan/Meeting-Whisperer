"""
Listener Agent - Handles audio transcription using OpenAI Whisper or Demo Mode
"""
import openai
import os
from datetime import datetime
from typing import Optional
import io
import random
from app.models import TranscriptLine


class ListenerAgent:
    """
    Agent responsible for converting audio to text using Whisper API
    Features:
    - Real-time transcription
    - Speaker diarization (when enabled)
    - Confidence scoring
    """
    
    def __init__(self):
        self.demo_mode = os.getenv("DEMO_MODE", "False").lower() == "true"
        self.api_key = os.getenv("OPENAI_API_KEY")
        
        if self.demo_mode:
            print(f"✅ Listener Agent initialized in DEMO MODE (no API key needed)")
            self.demo_phrases = [
                "Good morning team, let's start the meeting.",
                "We need to update the documentation by Friday.",
                "John, can you review the pull request?",
                "Sarah will handle the database migration.",
                "We decided to use React for the frontend.",
                "The API integration should be completed this week.",
                "Mike needs to create the deployment scripts.",
                "Let's schedule a follow-up meeting for next week.",
            ]
            self.demo_index = 0
        else:
            if not self.api_key:
                raise ValueError("OPENAI_API_KEY not found in environment")
            openai.api_key = self.api_key
        
        self.model = os.getenv("WHISPER_MODEL", "whisper-1")
        self.enable_diarization = os.getenv("ENABLE_SPEAKER_DIARIZATION", "True").lower() == "true"
        
        if not self.demo_mode:
            print(f"✅ Listener Agent initialized with model: {self.model}")
    
    async def process_audio(self, audio_data: bytes) -> Optional[TranscriptLine]:
        """
        Process audio chunk and return transcription
        
        Args:
            audio_data: Raw audio bytes
            
        Returns:
            TranscriptLine if transcription successful, None otherwise
        """
        try:
            # DEMO MODE: Return simulated transcription
            if self.demo_mode:
                if self.demo_index >= len(self.demo_phrases):
                    return None
                
                text = self.demo_phrases[self.demo_index]
                speaker = f"Speaker {(self.demo_index % 3) + 1}"
                self.demo_index += 1
                
                print(f"📝 Demo transcript: {speaker}: {text}")
                
                return TranscriptLine(
                    speaker=speaker,
                    text=text,
                    timestamp=datetime.now(),
                    confidence=0.95
                )
            
            # REAL MODE: Use OpenAI Whisper
            # Create audio file object
            audio_file = io.BytesIO(audio_data)
            audio_file.name = "audio.wav"
            
            # Call Whisper API
            transcript = openai.Audio.transcribe(
                model=self.model,
                file=audio_file,
                language="en"
            )
            
            if transcript and transcript.get("text"):
                text = transcript["text"].strip()
                
                if not text:
                    return None
                
                # Speaker detection (simplified - in production use proper diarization)
                speaker = self._detect_speaker(text)
                
                return TranscriptLine(
                    speaker=speaker,
                    text=text,
                    timestamp=datetime.now(),
                    confidence=transcript.get("confidence", 0.9)
                )
            
            return None
            
        except Exception as e:
            print(f"❌ Listener Agent error: {str(e)}")
            return None
    
    def _detect_speaker(self, text: str) -> str:
        """
        Detect speaker from text context
        In production, use proper speaker diarization models
        """
        if self.enable_diarization:
            # Simplified speaker detection based on context
            # In production, integrate with pyannote.audio or similar
            if any(word in text.lower() for word in ["i think", "in my opinion", "i believe"]):
                return "Speaker 1"
            else:
                return "Speaker 2"
        
        return "Speaker"
    
    async def transcribe_file(self, file_path: str) -> list[TranscriptLine]:
        """
        Transcribe an entire audio file (for batch processing)
        """
        try:
            with open(file_path, "rb") as audio_file:
                transcript = openai.Audio.transcribe(
                    model=self.model,
                    file=audio_file,
                    language="en",
                    response_format="verbose_json"
                )
            
            # Parse segments and create transcript lines
            lines = []
            if transcript.get("segments"):
                for segment in transcript["segments"]:
                    lines.append(TranscriptLine(
                        speaker="Speaker",
                        text=segment["text"].strip(),
                        timestamp=datetime.now(),
                        confidence=segment.get("confidence", 0.0)
                    ))
            
            print(f"✅ Transcribed file with {len(lines)} segments")
            return lines
            
        except Exception as e:
            print(f"❌ File transcription error: {str(e)}")
            return []
