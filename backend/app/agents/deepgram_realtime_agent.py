"""
Deepgram Real-Time Agent - Handles true real-time transcription using Deepgram streaming API
"""
import os
import json
import asyncio
from deepgram import DeepgramClient, LiveTranscriptionEvents, LiveOptions
from typing import Optional, Callable


class DeepgramRealtimeAgent:
    """
    Agent for TRUE real-time transcription using Deepgram streaming API
    Features:
    - Real-time audio streaming
    - Instant transcription as audio plays
    - Speaker diarization
    - High accuracy
    """

    def __init__(self):
        self.api_key = os.getenv("DEEPGRAM_API_KEY")
        if not self.api_key:
            raise ValueError("DEEPGRAM_API_KEY not found in environment")

        self.client = DeepgramClient(self.api_key)
        self.connection = None
        self.is_connected = False

        print(f"✅ Deepgram Real-Time Agent initialized")

    async def start_streaming(
        self,
        on_transcript: Callable,
        on_error: Optional[Callable] = None
    ):
        """
        Start real-time streaming connection to Deepgram

        Args:
            on_transcript: Callback function called when transcript arrives
            on_error: Optional callback for errors
        """
        try:
            # Configure live transcription options
            options = LiveOptions(
                model="nova-2",  # Latest and best Deepgram model
                language="en-US",
                smart_format=True,  # Automatic formatting
                interim_results=True,  # Get partial results in real-time
                punctuate=True,
                diarize=True,  # Speaker diarization
                encoding="linear16",
                sample_rate=16000,
                channels=1
            )

            # Create live transcription connection
            self.connection = self.client.listen.live.v("1")

            # Set up event handlers
            def on_open(self, open_event, **kwargs):
                print("🎙️ Deepgram connection opened")
                self.is_connected = True

            def on_message(self, result, **kwargs):
                sentence = result.channel.alternatives[0].transcript

                if len(sentence) == 0:
                    return

                is_final = result.is_final

                # Extract speaker if available
                speaker = "Speaker"
                if result.channel.alternatives[0].words:
                    first_word = result.channel.alternatives[0].words[0]
                    if hasattr(first_word, 'speaker') and first_word.speaker is not None:
                        speaker = f"Speaker {first_word.speaker + 1}"

                # Call the callback with transcript data
                if asyncio.iscoroutinefunction(on_transcript):
                    asyncio.create_task(on_transcript({
                        "text": sentence,
                        "is_final": is_final,
                        "speaker": speaker
                    }))
                else:
                    on_transcript({
                        "text": sentence,
                        "is_final": is_final,
                        "speaker": speaker
                    })

            def on_error_event(self, error, **kwargs):
                print(f"❌ Deepgram error: {error}")
                if on_error:
                    if asyncio.iscoroutinefunction(on_error):
                        asyncio.create_task(on_error(error))
                    else:
                        on_error(error)

            def on_close(self, close_event, **kwargs):
                print("🔌 Deepgram connection closed")
                self.is_connected = False

            # Register event handlers
            self.connection.on(LiveTranscriptionEvents.Open, on_open)
            self.connection.on(LiveTranscriptionEvents.Transcript, on_message)
            self.connection.on(LiveTranscriptionEvents.Error, on_error_event)
            self.connection.on(LiveTranscriptionEvents.Close, on_close)

            # Start the connection
            if self.connection.start(options) is False:
                raise Exception("Failed to start Deepgram connection")

            print("✅ Deepgram streaming started")

        except Exception as e:
            print(f"❌ Failed to start Deepgram streaming: {e}")
            raise

    def send_audio(self, audio_bytes: bytes):
        """
        Send audio chunk to Deepgram for real-time transcription

        Args:
            audio_bytes: Raw audio data (16kHz, 16-bit PCM)
        """
        if self.connection and self.is_connected:
            try:
                self.connection.send(audio_bytes)
            except Exception as e:
                print(f"❌ Error sending audio to Deepgram: {e}")

    def finish(self):
        """
        Finish the streaming session
        """
        if self.connection and self.is_connected:
            try:
                self.connection.finish()
                print("✅ Deepgram streaming finished")
            except Exception as e:
                print(f"❌ Error finishing Deepgram stream: {e}")
