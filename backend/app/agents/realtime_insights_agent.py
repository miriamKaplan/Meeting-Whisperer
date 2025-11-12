

"""
Real-time Insights Agent - Provides live meeting insights using Claude streaming API
"""
import anthropic
import os
from typing import List, AsyncGenerator
from app.models import TranscriptLine


class RealTimeInsightsAgent:
    """
    Agent that provides real-time insights during meetings using Claude's streaming API
    Features:
    - Instant analysis as people speak
    - Action item detection in real-time
    - Sentiment tracking
    - Key point identification
    - Decision detection
    """

    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")

        # Create Claude client
        self.client = anthropic.Anthropic(api_key=self.api_key)
        # Use faster model for real-time performance
        self.model = os.getenv("CLAUDE_REALTIME_MODEL", "claude-3-haiku-20240307")

        # Maintain conversation context
        self.conversation_history = []

        print(f"✅ Real-Time Insights Agent initialized with Claude model: {self.model}")

    async def analyze_live_transcript(
        self,
        new_line: TranscriptLine,
        recent_context: List[TranscriptLine] = None
    ) -> AsyncGenerator[dict, None]:
        """
        Analyze new transcript line in real-time and stream insights

        Args:
            new_line: The newly transcribed line
            recent_context: Recent conversation context (last 3-5 lines)

        Yields:
            Dictionary containing real-time insights as they're generated
        """
        try:
            # Build context from recent conversation
            context_text = ""
            if recent_context:
                context_text = "\n".join([
                    f"{line.speaker}: {line.text}"
                    for line in recent_context[-5:]  # Last 5 lines for context
                ])

            # Add new line
            current_text = f"{new_line.speaker}: {new_line.text}"

            prompt = f"""You are a real-time meeting assistant analyzing conversations as they happen.

RECENT CONTEXT:
{context_text}

NEW MESSAGE:
{current_text}

Provide INSTANT, CONCISE analysis (1-2 sentences max per insight):

1. If an ACTION ITEM is mentioned → Output: "🎯 ACTION: [brief description]"
2. If a KEY DECISION is made → Output: "✅ DECISION: [what was decided]"
3. If IMPORTANT INFORMATION is shared → Output: "💡 KEY POINT: [the insight]"
4. If CONCERN/BLOCKER is raised → Output: "⚠️ CONCERN: [the issue]"
5. If a QUESTION needs follow-up → Output: "❓ FOLLOW-UP: [the question]"

RULES:
- Be EXTREMELY concise (max 10 words per insight)
- Only output if something genuinely important happens
- If nothing significant → output "SKIP"
- Real-time speed is critical - be fast and accurate
- Focus on actionable insights only

Examples:
"We need to update the API docs by Friday" → "🎯 ACTION: Update API docs by Friday"
"Let's go with option B" → "✅ DECISION: Chose option B"
"The database is running slow" → "⚠️ CONCERN: Database performance issue"
"Just checking in on progress" → "SKIP"

Respond with ONE LINE only:"""

            # Add to conversation history
            self.conversation_history.append({
                "speaker": new_line.speaker,
                "text": new_line.text
            })

            # Keep only recent history to avoid token limits
            if len(self.conversation_history) > 20:
                self.conversation_history = self.conversation_history[-20:]

            # Stream the response from Claude
            with self.client.messages.stream(
                model=self.model,
                max_tokens=150,  # Short responses for speed
                temperature=0.3,  # Lower for more consistent insights
                system="You are a real-time meeting assistant. Provide instant, concise insights. Be extremely brief. Only highlight truly important moments.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            ) as stream:
                insight_text = ""
                for text in stream.text_stream:
                    insight_text += text

                    # Yield each chunk as it arrives
                    yield {
                        "type": "insight_chunk",
                        "text": text,
                        "speaker": new_line.speaker,
                        "timestamp": new_line.timestamp.isoformat() if hasattr(new_line.timestamp, 'isoformat') else str(new_line.timestamp)
                    }

                # Send final complete insight
                if insight_text.strip() != "SKIP":
                    yield {
                        "type": "insight_complete",
                        "insight": insight_text.strip(),
                        "speaker": new_line.speaker,
                        "original_text": new_line.text,
                        "timestamp": new_line.timestamp.isoformat() if hasattr(new_line.timestamp, 'isoformat') else str(new_line.timestamp)
                    }

                    print(f"🤖 Real-time insight: {insight_text.strip()}")

        except Exception as e:
            print(f"❌ Real-time insights error: {str(e)}")
            yield {
                "type": "error",
                "error": str(e)
            }

    async def get_meeting_summary_so_far(self) -> str:
        """
        Get a quick summary of the meeting so far (for periodic updates)
        """
        try:
            if not self.conversation_history:
                return "Meeting just started"

            # Build conversation text
            conversation_text = "\n".join([
                f"{item['speaker']}: {item['text']}"
                for item in self.conversation_history
            ])

            prompt = f"""Provide a VERY brief summary (2-3 sentences) of this meeting so far:

{conversation_text}

Focus on:
- Main topic being discussed
- Any decisions made
- Key action items mentioned

Be extremely concise:"""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=200,
                temperature=0.3,
                system="You are a meeting summarizer. Provide ultra-concise summaries in 2-3 sentences maximum.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            return response.content[0].text.strip()

        except Exception as e:
            print(f"❌ Summary generation error: {str(e)}")
            return "Unable to generate summary"

    def clear_history(self):
        """Clear conversation history (call when starting new meeting)"""
        self.conversation_history = []
        print("🔄 Real-time agent history cleared")
