"""
Listener Agent - Handles audio transcription using AssemblyAI, Local Whisper, Deepgram, or OpenAI API
"""
from openai import OpenAI
import httpx
import os
from datetime import datetime
from typing import Optional
import io
import random
from app.models import TranscriptLine
import asyncio
import json

# Try to import local whisper
try:
    import whisper as local_whisper
    LOCAL_WHISPER_AVAILABLE = True
except ImportError:
    LOCAL_WHISPER_AVAILABLE = False

# Try to import AssemblyAI
try:
    import assemblyai as aai
    ASSEMBLYAI_AVAILABLE = True
except ImportError:
    ASSEMBLYAI_AVAILABLE = False

# Try to import Deepgram
try:
    from deepgram import DeepgramClient
    DEEPGRAM_AVAILABLE = True
except ImportError:
    DEEPGRAM_AVAILABLE = False


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
        self.use_assemblyai = os.getenv("USE_ASSEMBLYAI", "false").lower() == "true"
        self.use_deepgram = os.getenv("USE_DEEPGRAM", "true").lower() == "true"  # Default to Deepgram for streaming
        self.use_local_whisper = os.getenv("USE_LOCAL_WHISPER", "false").lower() == "true"
        self.assemblyai_key = os.getenv("ASSEMBLYAI_API_KEY")
        self.deepgram_key = os.getenv("DEEPGRAM_API_KEY")
        self.api_key = os.getenv("OPENAI_API_KEY")
        
        # Deepgram client for streaming
        self.deepgram_client = None
        self.deepgram_connection = None
        self.latest_transcript = None
        
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
            self.client = None
            self.local_model = None
        elif self.use_deepgram and DEEPGRAM_AVAILABLE:
            if not self.deepgram_key:
                print(f"⚠️ DEEPGRAM_API_KEY not found - falling back to OpenAI Whisper")
                self.use_deepgram = False
            else:
                print(f"✅ Listener Agent initialized with OPENAI WHISPER (real-time streaming)")
                # Deepgram doesn't support webm chunks well, so use OpenAI Whisper instead
                # Disable SSL verification to work with corporate proxies
                import httpx
                http_client = httpx.Client(verify=False)
                self.client = OpenAI(
                    api_key=self.api_key,
                    http_client=http_client
                )
                self.deepgram_client = None
                self.local_model = None
        elif self.use_assemblyai and ASSEMBLYAI_AVAILABLE:
            if not self.assemblyai_key:
                raise ValueError("ASSEMBLYAI_API_KEY not found in environment")
            print(f"✅ Listener Agent initialized with ASSEMBLYAI (5 hours/month free)")
            aai.settings.api_key = self.assemblyai_key
            self.client = None
            self.local_model = None
        elif self.use_local_whisper and LOCAL_WHISPER_AVAILABLE:
            print(f"✅ Listener Agent initialized with LOCAL WHISPER (free, runs on your Mac)")
            print(f"   Loading Whisper TINY model (fastest, free)...")
            self.local_model = local_whisper.load_model("tiny")  # Use 'tiny' model for maximum speed
            print(f"   ✅ Local Whisper TINY model loaded successfully!")
            self.client = None
        else:
            if not self.api_key:
                raise ValueError("OPENAI_API_KEY not found and local Whisper not available")
            
            # Create HTTP client with SSL verification disabled for corporate networks
            http_client = httpx.Client(verify=False)
            self.client = OpenAI(
                api_key=self.api_key,
                http_client=http_client
            )
            self.local_model = None
        
        self.model = os.getenv("WHISPER_MODEL", "whisper-1")
        self.enable_diarization = os.getenv("ENABLE_SPEAKER_DIARIZATION", "True").lower() == "true"
        
        if not self.demo_mode and not self.use_local_whisper and not self.use_assemblyai:
            print(f"✅ Listener Agent initialized with OpenAI API model: {self.model}")
        elif not self.demo_mode and self.use_local_whisper:
            print(f"✅ Listener Agent ready with local Whisper")
    
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
            
            # Skip empty or tiny audio chunks (less than 1KB is probably silence)
            if not audio_data or len(audio_data) < 1000:
                return None
            
            # REAL-TIME MODE: Use OpenAI Whisper for streaming chunks
            # OpenAI Whisper accepts audio chunks directly and works great for real-time
            if self.client:
                try:
                    # Save audio chunk to temporary file (Whisper API needs a file)
                    import tempfile
                    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as temp_audio:
                        temp_audio.write(audio_data)
                        temp_audio_path = temp_audio.name
                    
                    try:
                        # Use OpenAI Whisper API for transcription
                        with open(temp_audio_path, "rb") as audio_file:
                            transcript = self.client.audio.transcriptions.create(
                                model="whisper-1",
                                file=audio_file,
                                language="en"
                            )
                        
                        text = transcript.text.strip() if transcript and transcript.text else None
                        
                        if text:
                            speaker = self._detect_speaker(text)
                            
                            print(f"📝 Whisper transcript: {text}")
                            
                            return TranscriptLine(
                                speaker=speaker,
                                text=text,
                                timestamp=datetime.now(),
                                confidence=0.9
                            )
                    finally:
                        # Clean up temp file
                        import os
                        if os.path.exists(temp_audio_path):
                            os.unlink(temp_audio_path)
                    
                    return None
                    
                except Exception as e:
                    print(f"❌ Whisper error: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    # Fall through to other methods
                    pass
            
            # ASSEMBLYAI MODE: Save audio chunk to temp file and transcribe
            if self.use_assemblyai and ASSEMBLYAI_AVAILABLE:
                import tempfile
                
                # Save audio chunk to temporary file
                with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp_file:
                    tmp_file.write(audio_data)
                    tmp_path = tmp_file.name
                
                try:
                    # Use AssemblyAI transcriber
                    transcriber = aai.Transcriber()
                    transcript = transcriber.transcribe(tmp_path)
                    
                    if transcript.status == aai.TranscriptStatus.error:
                        print(f"❌ AssemblyAI error: {transcript.error}")
                        return None
                    
                    if transcript.text and transcript.text.strip():
                        text = transcript.text.strip()
                        speaker = self._detect_speaker(text)
                        
                        print(f"📝 AssemblyAI transcript: {text}")
                        
                        return TranscriptLine(
                            speaker=speaker,
                            text=text,
                            timestamp=datetime.now(),
                            confidence=transcript.confidence if transcript.confidence else 0.9
                        )
                    
                    return None
                finally:
                    # Clean up temp file
                    import os
                    try:
                        os.unlink(tmp_path)
                    except:
                        pass
            
            # LOCAL WHISPER MODE: Transcribe with local model
            if self.local_model is not None:
                import tempfile
                
                # Save audio chunk to temporary file
                with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp_file:
                    tmp_file.write(audio_data)
                    tmp_path = tmp_file.name
                
                try:
                    result = self.local_model.transcribe(tmp_path, language="en")
                    
                    if 'text' in result and result['text'].strip():
                        text = result['text'].strip()
                        speaker = self._detect_speaker(text)
                        
                        print(f"📝 Local Whisper transcript: {text}")
                        
                        return TranscriptLine(
                            speaker=speaker,
                            text=text,
                            timestamp=datetime.now(),
                            confidence=0.8
                        )
                    
                    return None
                finally:
                    # Clean up temp file
                    import os
                    try:
                        os.unlink(tmp_path)
                    except:
                        pass
            
            # OPENAI MODE: Use OpenAI Whisper API
            if self.client is not None:
                # Create audio file object
                audio_file = io.BytesIO(audio_data)
                audio_file.name = "audio.webm"
                
                # Call Whisper API
                transcript = self.client.audio.transcriptions.create(
                    model=self.model,
                    file=audio_file,
                    language="en"
                )
                
                if transcript and transcript.text:
                    text = transcript.text.strip()
                    
                    if not text:
                        return None
                    
                    # Speaker detection (simplified - in production use proper diarization)
                    speaker = self._detect_speaker(text)
                    
                    return TranscriptLine(
                        speaker=speaker,
                        text=text,
                        timestamp=datetime.now(),
                        confidence=getattr(transcript, 'confidence', 0.9)
                    )
            
            return None
            
        except Exception as e:
            print(f"❌ Listener Agent error: {str(e)}")
            import traceback
            traceback.print_exc()
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
            # Use demo mode if enabled
            if self.demo_mode:
                print(f"🎙️ DEMO MODE: Generating sample transcript from file {file_path}")
                import random
                demo_phrases = [
                    "Good morning team, let's start the meeting.",
                    "We need to update the documentation by Friday.",
                    "John, can you review the pull request?",
                    "Sarah will handle the database migration.",
                    "We decided to use React for the frontend.",
                    "The API integration should be completed this week.",
                    "Mike needs to create the deployment scripts.",
                    "Let's schedule a follow-up meeting for next week.",
                    "I think we should improve our testing coverage.",
                    "The performance is critical for our users.",
                ]
                # Return 3-5 random phrases
                num_phrases = random.randint(3, 5)
                lines = []
                for i in range(num_phrases):
                    phrase = random.choice(demo_phrases)
                    lines.append(TranscriptLine(
                        speaker="Speaker",
                        text=phrase,
                        timestamp=datetime.now().isoformat(),
                        confidence=0.95
                    ))
                print(f"✅ Generated {len(lines)} demo transcript lines")
                return lines
            
            # Use AssemblyAI if enabled
            if self.use_assemblyai and ASSEMBLYAI_AVAILABLE:
                print(f"🎙️ Transcribing with ASSEMBLYAI (fast, 5 hours/month free)...")
                
                # Create transcriber
                transcriber = aai.Transcriber()
                
                # Configure transcription with speaker diarization if enabled
                config = aai.TranscriptionConfig(
                    speaker_labels=self.enable_diarization
                )
                
                # Submit file for transcription
                transcript = transcriber.transcribe(file_path, config=config)
                
                lines = []
                
                if transcript.status == aai.TranscriptStatus.error:
                    print(f"❌ AssemblyAI transcription failed: {transcript.error}")
                    return lines
                
                # Parse words with timestamps
                if transcript.words:
                    # Group words into sentences (approximately)
                    current_sentence = []
                    current_start_time = None
                    current_speaker = None
                    
                    for word in transcript.words:
                        if current_start_time is None:
                            current_start_time = word.start
                        
                        # Get speaker label if available
                        word_speaker = getattr(word, 'speaker', None)
                        
                        # Start new sentence if speaker changes
                        if current_speaker is not None and word_speaker != current_speaker and current_sentence:
                            sentence_text = ' '.join(current_sentence)
                            lines.append(TranscriptLine(
                                speaker=current_speaker if current_speaker else "Speaker",
                                text=sentence_text,
                                timestamp=datetime.now().isoformat(),
                                confidence=transcript.confidence if transcript.confidence else 0.9
                            ))
                            current_sentence = []
                            current_start_time = word.start
                        
                        current_speaker = word_speaker
                        current_sentence.append(word.text)
                        
                        # End sentence on punctuation or after ~15 words
                        if (word.text.endswith(('.', '!', '?')) or 
                            len(current_sentence) >= 15):
                            
                            sentence_text = ' '.join(current_sentence)
                            lines.append(TranscriptLine(
                                speaker=current_speaker if current_speaker else "Speaker",
                                text=sentence_text,
                                timestamp=datetime.now().isoformat(),
                                confidence=transcript.confidence if transcript.confidence else 0.9
                            ))
                            current_sentence = []
                            current_start_time = None
                    
                    # Add remaining words as final sentence
                    if current_sentence:
                        sentence_text = ' '.join(current_sentence)
                        lines.append(TranscriptLine(
                            speaker=current_speaker if current_speaker else "Speaker",
                            text=sentence_text,
                            timestamp=datetime.now().isoformat(),
                            confidence=transcript.confidence if transcript.confidence else 0.9
                        ))
                
                elif transcript.text:
                    # Fallback: split text into sentences
                    sentences = transcript.text.split('. ')
                    for sentence in sentences:
                        if sentence.strip():
                            lines.append(TranscriptLine(
                                speaker="Speaker",
                                text=sentence.strip() + ('.' if not sentence.endswith('.') else ''),
                                timestamp=datetime.now().isoformat(),
                                confidence=transcript.confidence if transcript.confidence else 0.9
                            ))
                
                if lines:
                    print(f"✅ AssemblyAI transcribed {len(lines)} segments in {transcript.audio_duration}s")
                else:
                    print(f"⚠️ AssemblyAI found no speech")
                
                return lines
            
            # Use local Whisper if available
            if self.local_model is not None:
                print(f"🎙️ Transcribing with LOCAL WHISPER (free)...")
                result = self.local_model.transcribe(file_path, language="en")
                
                lines = []
                # Parse segments from local Whisper
                if 'segments' in result and result['segments']:
                    for segment in result['segments']:
                        text = segment.get('text', '').strip()
                        if text:
                            lines.append(TranscriptLine(
                                speaker="Speaker",
                                text=text,
                                timestamp=datetime.now().isoformat(),
                                confidence=segment.get('no_speech_prob', 0.0)
                            ))
                elif 'text' in result and result['text'].strip():
                    # If no segments, split text into sentences
                    sentences = result['text'].split('. ')
                    for sentence in sentences:
                        if sentence.strip():
                            lines.append(TranscriptLine(
                                speaker="Speaker",
                                text=sentence.strip() + ('.' if not sentence.endswith('.') else ''),
                                timestamp=datetime.now().isoformat(),
                                confidence=0.8
                            ))
                
                if lines:
                    print(f"✅ Local Whisper transcribed {len(lines)} segments")
                else:
                    print(f"⚠️ Local Whisper found no speech")
                
                return lines
            
            # Fall back to OpenAI API
            with open(file_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model=self.model,
                    file=audio_file,
                    language="en",
                    response_format="verbose_json"
                )
            
            print(f"🔍 Whisper API Response Type: {type(transcript)}")
            print(f"🔍 Whisper API Response: {transcript}")
            if hasattr(transcript, '__dict__'):
                print(f"🔍 Response attributes: {transcript.__dict__}")
            
            # Parse segments and create transcript lines
            lines = []
            
            # Handle both .segments (verbose format) and just using text (simple format)
            if hasattr(transcript, 'segments') and transcript.segments:
                for segment in transcript.segments:
                    text = segment.get('text', segment.text) if hasattr(segment, 'get') else segment.text
                    lines.append(TranscriptLine(
                        speaker="Speaker",
                        text=text.strip(),
                        timestamp=datetime.now().isoformat(),
                        confidence=getattr(segment, 'confidence', segment.get('confidence', 0.0) if hasattr(segment, 'get') else 0.0)
                    ))
            elif hasattr(transcript, 'text') and transcript.text:
                # If only text is returned, split into sentences
                sentences = transcript.text.split('. ')
                for sentence in sentences:
                    if sentence.strip():
                        lines.append(TranscriptLine(
                            speaker="Speaker",
                            text=sentence.strip() + ('.' if not sentence.endswith('.') else ''),
                            timestamp=datetime.now().isoformat(),
                            confidence=0.8
                        ))
            elif isinstance(transcript, dict):
                # Handle dict response
                if 'segments' in transcript:
                    for segment in transcript['segments']:
                        lines.append(TranscriptLine(
                            speaker="Speaker",
                            text=segment.get('text', '').strip(),
                            timestamp=datetime.now().isoformat(),
                            confidence=segment.get('confidence', 0.0)
                        ))
                elif 'text' in transcript:
                    sentences = transcript['text'].split('. ')
                    for sentence in sentences:
                        if sentence.strip():
                            lines.append(TranscriptLine(
                                speaker="Speaker",
                                text=sentence.strip() + ('.' if not sentence.endswith('.') else ''),
                                timestamp=datetime.now().isoformat(),
                                confidence=0.8
                            ))
            
            if lines:
                print(f"✅ Transcribed file with {len(lines)} segments")
            else:
                print(f"⚠️ Transcription returned but no segments found. Raw transcript: {transcript}")
            
            return lines
            
        except Exception as e:
            print(f"❌ File transcription error: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
