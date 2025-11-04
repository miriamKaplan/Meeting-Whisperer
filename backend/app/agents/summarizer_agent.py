"""
Summarizer Agent - Generates meeting summaries using GPT-4
"""
import openai
import os
from typing import List
from app.models import TranscriptLine, ActionItem


class SummarizerAgent:
    """
    Agent responsible for generating meeting summaries
    Features:
    - Extract key points and decisions
    - Identify participants
    - Generate executive summary
    - Detect meeting type (standup, planning, retro)
    """
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")
        
        openai.api_key = self.api_key
        self.model = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
        
        print(f"✅ Summarizer Agent initialized with model: {self.model}")
    
    async def generate_summary(
        self, 
        transcript: List[TranscriptLine],
        action_items: List[ActionItem]
    ) -> dict:
        """
        Generate comprehensive meeting summary
        
        Args:
            transcript: List of transcript lines
            action_items: List of detected action items
            
        Returns:
            Dictionary containing summary, key points, decisions
        """
        try:
            # Build transcript text
            transcript_text = "\n".join([
                f"{line.speaker}: {line.text}" 
                for line in transcript
            ])
            
            # Build action items text
            action_text = "\n".join([
                f"- {item.text} (Assignee: {item.assignee or 'Unassigned'})"
                for item in action_items
            ])
            
            # Create prompt
            prompt = f"""You are an expert meeting summarizer. Analyze this meeting transcript and provide a structured summary.

TRANSCRIPT:
{transcript_text}

ACTION ITEMS DETECTED:
{action_text}

Please provide:
1. A brief meeting title (5-10 words)
2. Executive summary (2-3 sentences)
3. Key discussion points (bullet points)
4. Decisions made (bullet points)
5. List of participants mentioned

Format your response as JSON with keys: title, summary, key_points, decisions, participants"""

            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert meeting analyst. Provide concise, actionable summaries."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = response.choices[0].message.content
            
            print(f"✅ Summary generated for meeting with {len(transcript)} lines")
            
            import json
            return json.loads(result)
            
        except Exception as e:
            print(f"❌ Summarizer Agent error: {str(e)}")
            return {
                "title": "Meeting Summary",
                "summary": "Error generating summary",
                "key_points": [],
                "decisions": [],
                "participants": []
            }
    
    async def generate_pr_description(
        self,
        action_item: ActionItem,
        context: List[TranscriptLine]
    ) -> str:
        """
        Generate a PR description from an action item and context
        """
        try:
            context_text = "\n".join([
                f"{line.speaker}: {line.text}" 
                for line in context[-10:]  # Last 10 lines of context
            ])
            
            prompt = f"""Generate a pull request description for this action item from a meeting:

ACTION ITEM: {action_item.text}
ASSIGNEE: {action_item.assignee or 'Not specified'}

MEETING CONTEXT:
{context_text}

Create a clear PR description with:
- What: Brief description of the change
- Why: Business justification from meeting discussion
- How: High-level approach
- Testing: What should be tested

Keep it concise and professional."""

            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a software engineer creating PR descriptions."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.5,
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"❌ PR description generation error: {str(e)}")
            return f"Implement: {action_item.text}"
