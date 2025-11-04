"""
Task Generator Agent - Extracts and structures action items using AI
"""
import openai
import os
from typing import List
import json
from app.models import TranscriptLine, ActionItem


class TaskGeneratorAgent:
    """
    Agent responsible for detecting and structuring action items
    Features:
    - Identify action items from conversation
    - Extract assignees
    - Determine priority
    - Suggest due dates
    """
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")
        
        openai.api_key = self.api_key
        self.model = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
        self.confidence_threshold = float(os.getenv("ACTION_ITEM_CONFIDENCE_THRESHOLD", "0.7"))
        
        print(f"✅ Task Generator Agent initialized with model: {self.model}")
    
    async def extract_action_items(
        self, 
        transcript_segment: List[TranscriptLine]
    ) -> List[ActionItem]:
        """
        Extract action items from a segment of transcript
        
        Args:
            transcript_segment: Recent transcript lines to analyze
            
        Returns:
            List of detected action items
        """
        try:
            # Build context from transcript
            context = "\n".join([
                f"{line.speaker}: {line.text}" 
                for line in transcript_segment
            ])
            
            prompt = f"""Analyze this meeting conversation segment and extract any action items.

CONVERSATION:
{context}

Look for:
- Tasks to be done ("needs to", "should", "will", "let's")
- Assignments ("you should", "can you", "I'll", "assigned to")
- Deadlines ("by tomorrow", "this week", "before Friday")
- Priorities (urgent, important, critical, low priority)

Return ONLY valid action items as JSON array. Each item should have:
- text: Clear, actionable description
- assignee: Person's name if mentioned, or null
- priority: "high", "medium", or "low"
- confidence: 0.0 to 1.0 score

If no action items found, return empty array [].

Example format:
[
  {{
    "text": "Update the documentation for the API endpoints",
    "assignee": "John",
    "priority": "medium",
    "confidence": 0.9
  }}
]"""

            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at identifying action items and tasks from meeting conversations. Only extract clear, actionable items."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            
            result = response.choices[0].message.content
            parsed = json.loads(result)
            
            # Handle both array and object with items key
            items_data = parsed if isinstance(parsed, list) else parsed.get("items", [])
            
            # Filter by confidence threshold
            action_items = []
            for item_data in items_data:
                confidence = item_data.get("confidence", 0.0)
                if confidence >= self.confidence_threshold:
                    action_items.append(ActionItem(
                        text=item_data["text"],
                        assignee=item_data.get("assignee"),
                        priority=item_data.get("priority", "medium"),
                        confidence=confidence
                    ))
            
            if action_items:
                print(f"✅ Task Generator extracted {len(action_items)} action items")
            
            return action_items
            
        except Exception as e:
            print(f"❌ Task Generator Agent error: {str(e)}")
            return []
    
    async def generate_jira_description(self, action_item: ActionItem) -> dict:
        """
        Generate a well-formatted Jira task description from an action item
        """
        try:
            prompt = f"""Create a professional Jira task description for this action item:

ACTION ITEM: {action_item.text}
ASSIGNEE: {action_item.assignee or 'Unassigned'}
PRIORITY: {action_item.priority}

Generate:
1. A clear summary (one line)
2. Detailed description with:
   - Background/Context
   - Acceptance Criteria (bullet points)
   - Technical Notes (if applicable)

Format as JSON with keys: summary, description"""

            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a product manager creating clear, actionable Jira tickets."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"❌ Jira description generation error: {str(e)}")
            return {
                "summary": action_item.text,
                "description": f"Action item from meeting.\n\nAssignee: {action_item.assignee or 'TBD'}"
            }
