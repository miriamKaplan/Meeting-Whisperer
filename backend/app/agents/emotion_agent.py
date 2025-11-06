"""
Emotion Analysis Agent - Detects sentiment and emotions using Claude (Anthropic)
"""
import anthropic
import os
import random
from typing import List, Dict
from app.models import TranscriptLine
from datetime import datetime


class EmotionAnalysisAgent:
    """
    Agent responsible for analyzing emotions and sentiment in meeting conversations
    Features:
    - Detect happiness, sadness, frustration, excitement
    - Track mood changes over time
    - Identify speaker emotional states
    - Generate emotion summaries
    """
    
    def __init__(self):
        self.demo_mode = os.getenv("DEMO_MODE", "false").lower() == "true"
        
        if not self.demo_mode:
            self.api_key = os.getenv("ANTHROPIC_API_KEY")
            if not self.api_key:
                raise ValueError("ANTHROPIC_API_KEY not found in environment")
            
            # Create Claude client
            self.client = anthropic.Anthropic(api_key=self.api_key)
            self.model = os.getenv("CLAUDE_MODEL", "claude-3-haiku-20240307")
            print(f"✅ Emotion Analysis Agent initialized with Claude model: {self.model}")
        else:
            self.client = None
            print("✅ Emotion Analysis Agent initialized in DEMO MODE")
    
    async def analyze_emotions(self, transcript: List[TranscriptLine]) -> Dict:
        """
        Analyze emotions and sentiment from meeting transcript
        
        Args:
            transcript: List of transcript lines with speaker and text
            
        Returns:
            Dict containing emotion analysis results
        """
        if self.demo_mode:
            # Return demo emotion data
            speakers = list(set([line.speaker for line in transcript])) if transcript else ["Speaker 1", "Speaker 2"]
            
            return {
                "overall_sentiment": "positive",
                "happiness_level": "happy",
                "energy_level": "high",
                "speakers": {speaker: "engaged and positive" for speaker in speakers},
                "emotional_moments": [
                    "Speakers showed enthusiasm when discussing the project",
                    "Positive energy throughout the conversation"
                ],
                "stress_indicators": [],
                "confidence_score": 0.85
            }
        
        try:
            if not transcript:
                return {"error": "No transcript provided"}
            
            # Prepare transcript text
            transcript_text = "\n".join([
                f"{line.speaker}: {line.text}" 
                for line in transcript
            ])
            
            prompt = f"""Analyze the emotions and sentiment in this meeting transcript. Provide realistic, nuanced analysis - not all meetings are happy or positive.

Meeting Transcript:
{transcript_text}

Guidelines for realistic analysis:
- Most work meetings have mixed emotions (some positive, some neutral, some concerns)
- Professional discussions are often neutral in tone
- Only identify "happy" or "very happy" when there's genuine enthusiasm or celebration
- Detect concerns, uncertainties, and problems as they appear
- Be honest about stress indicators and challenges discussed

Analyze and provide:
1. Overall meeting sentiment: positive (celebratory/successful), neutral (normal work discussion), negative (problems/conflicts), or mixed (combination)
2. Happiness level: very happy (celebration), happy (good news), neutral (professional/factual), concerned (issues raised), frustrated (problems/blockers)
3. Individual speaker emotions: Be specific and realistic for each speaker
4. Key emotional moments: Identify REAL emotional shifts, not generic statements
5. Energy level: high (enthusiastic discussion), medium (normal meeting), low (flat/tired)
6. Stress indicators: Actually identify if deadlines, blockers, or problems are discussed

Format your response as JSON with these keys:
- overall_sentiment: "positive" | "neutral" | "negative" | "mixed"
- happiness_level: "very happy" | "happy" | "neutral" | "concerned" | "frustrated"
- energy_level: "high" | "medium" | "low"
- speakers: object with speaker names as keys and their ACCURATE emotions as values
- emotional_moments: array of SPECIFIC emotional moments (not generic)
- stress_indicators: array of ACTUAL stress signs if detected (e.g., "tight deadline mentioned", "blocker identified")
- confidence_score: number between 0-1

Example response:
{{
    "overall_sentiment": "mixed",
    "happiness_level": "neutral",
    "energy_level": "medium",
    "speakers": {{
        "Speaker 1": "focused but concerned about timeline",
        "Speaker 2": "neutral, providing status updates"
    }},
    "emotional_moments": [
        "Concern expressed when discussing Q4 deadline",
        "Brief optimism when solution was proposed"
    ],
    "stress_indicators": ["Tight deadline mentioned", "Dependency on external team noted"],
    "confidence_score": 0.85
}}"""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                temperature=0.2,  # Lower for more consistent analysis
                system="You are an expert workplace emotion and sentiment analyst. Provide realistic, nuanced analysis of meeting emotions. Avoid being overly positive - most workplace communication is neutral or professional. Accurately identify genuine emotions, concerns, and stress indicators. Be honest about problems and challenges discussed. Always respond with valid JSON.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            result = response.content[0].text
            
            print(f"✅ Emotion analysis completed for meeting with {len(transcript)} lines")
            
            import json
            return json.loads(result)
            
        except Exception as e:
            print(f"❌ Emotion analysis error: {str(e)}")
            return {
                "error": f"Emotion analysis failed: {str(e)}",
                "overall_sentiment": "neutral",
                "happiness_level": "neutral",
                "energy_level": "medium",
                "speakers": {},
                "emotional_moments": [],
                "stress_indicators": [],
                "confidence_score": 0.0
            }
    
    async def analyze_single_message(self, speaker: str, text: str) -> Dict:
        """
        Analyze emotion of a single message in real-time
        
        Args:
            speaker: Speaker name
            text: Message text
            
        Returns:
            Dict containing emotion analysis for this message
        """
        if self.demo_mode:
            # Return demo emotion data
            emotions = ["happy", "excited", "calm", "neutral", "enthusiastic", "confident"]
            happiness_emojis = ["😊", "🙂", "😐", "😀", "🤗"]
            energy_levels = ["high", "medium", "low"]
            stress_levels = ["none", "low", "medium"]
            
            # Generate realistic emotion based on text content
            emotion = "happy" if any(word in text.lower() for word in ["great", "awesome", "excellent", "good", "yes", "love"]) else random.choice(emotions)
            happiness_level = random.randint(60, 95) if emotion in ["happy", "excited", "enthusiastic"] else random.randint(40, 80)
            
            return {
                "sentiment": "positive" if happiness_level > 60 else "neutral" if happiness_level > 40 else "negative",
                "confidence": round(random.uniform(0.7, 0.95), 2),
                "happiness_level": happiness_level,
                "key_emotions": [emotion, random.choice(["engaged", "focused", "attentive"])],
                "overall_mood": f"{emotion} and engaged"
            }
        
        try:
            prompt = f"""Analyze the emotion and sentiment of this single message in a meeting context. Be realistic and nuanced - not everything is happy or positive.

Speaker: {speaker}
Message: "{text}"

Consider:
- Tone indicators (enthusiasm, hesitation, certainty, doubt)
- Word choice (positive words, negative words, neutral language)
- Context clues (questions suggest uncertainty, statements suggest confidence)
- Realistic emotion distribution (most workplace communication is neutral or mildly positive)

Determine:
1. Primary emotion: Choose the MOST accurate from: excited, happy, content, neutral, uncertain, concerned, frustrated, disappointed, calm, focused
2. Happiness indicator: Be realistic - use 😐 (neutral) for most professional messages unless clearly positive/negative
3. Energy level: high (enthusiastic, excited), medium (normal conversation), low (tired, flat)
4. Stress level: none (relaxed), low (normal work pressure), medium (concerned), high (urgent/frustrated)

Guidelines:
- Short factual statements → neutral emotion
- Questions → often neutral or uncertain
- Greetings without enthusiasm → neutral
- Only use happy/excited for genuinely positive language
- Use concerned/frustrated for problem discussions

Respond with JSON:
{{
    "primary_emotion": "emotion_name",
    "happiness_emoji": "emoji",
    "energy_level": "level",
    "stress_level": "level",
    "confidence": 0.8
}}"""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=256,
                temperature=0.1,  # Lower temperature for more consistent analysis
                system="You are an expert workplace emotion analyst. Provide realistic, nuanced emotion detection. Most workplace communication is neutral or professional. Only identify strong emotions when clearly present in the text. Be conservative with positive emotions - don't label everything as happy. Always respond with valid JSON.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            result = response.content[0].text
            
            import json
            return json.loads(result)
            
        except Exception as e:
            print(f"❌ Single message emotion analysis error: {str(e)}")
            return {
                "primary_emotion": "neutral",
                "happiness_emoji": "😐",
                "energy_level": "medium",
                "stress_level": "none",
                "confidence": 0.0
            }
    
    async def get_happiness_summary(self, transcript: List[TranscriptLine]) -> str:
        """
        Generate a summary focused specifically on happiness and mood
        
        Args:
            transcript: List of transcript lines
            
        Returns:
            String summary of happiness and mood in the meeting
        """
        try:
            emotion_analysis = await self.analyze_emotions(transcript)
            
            happiness_level = emotion_analysis.get("happiness_level", "neutral")
            overall_sentiment = emotion_analysis.get("overall_sentiment", "neutral")
            energy_level = emotion_analysis.get("energy_level", "medium")
            
            # Generate emoji based on happiness level
            happiness_emojis = {
                "very happy": "😄",
                "happy": "🙂", 
                "neutral": "😐",
                "sad": "🙁",
                "very sad": "😢"
            }
            
            emoji = happiness_emojis.get(happiness_level, "😐")
            
            summary = f"{emoji} Meeting Mood: {happiness_level.title()}\n"
            summary += f"Overall Sentiment: {overall_sentiment.title()}\n"
            summary += f"Energy Level: {energy_level.title()}\n"
            
            if emotion_analysis.get("emotional_moments"):
                summary += f"\nKey Emotional Moments:\n"
                for moment in emotion_analysis["emotional_moments"][:3]:  # Top 3
                    summary += f"• {moment}\n"
            
            return summary
            
        except Exception as e:
            print(f"❌ Happiness summary error: {str(e)}")
            return "😐 Unable to analyze meeting happiness levels"