"""
Task Generator Agent - Extracts and structures action items using Claude (Anthropic)
"""
import anthropic
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
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")
        
        # Create Claude client
        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.model = os.getenv("CLAUDE_MODEL", "claude-3-haiku-20240307")
        self.confidence_threshold = float(os.getenv("ACTION_ITEM_CONFIDENCE_THRESHOLD", "0.7"))
        
        print(f"✅ Task Generator Agent initialized with Claude model: {self.model}")
    
    async def extract_action_items_with_context(
        self, 
        transcript_segment: List[TranscriptLine],
        existing_action_items: List[ActionItem] = None
    ) -> List[ActionItem]:
        """
        Extract action items from transcript, considering existing ones to avoid duplicates
        and update existing tasks with new details
        
        Args:
            transcript_segment: Recent transcript lines to analyze
            existing_action_items: Already identified action items to check against
            
        Returns:
            Updated list of all action items (existing + new + updated)
        """
        try:
            # Build context from transcript
            context = "\n".join([
                f"{line.speaker}: {line.text}" 
                for line in transcript_segment
            ])
            
            # Build existing tasks context
            existing_context = ""
            if existing_action_items:
                existing_context = "\n\nEXISTING ACTION ITEMS:\n" + "\n".join([
                    f"- {item.text} (assignee: {item.assignee or 'unassigned'}, priority: {item.priority})"
                    for item in existing_action_items
                ])

            prompt = f"""Analyze this meeting conversation and manage action items intelligently.

CONVERSATION:
{context}{existing_context}

INSTRUCTIONS:
1. Look for NEW action items that aren't already covered
2. For EXISTING items, check if new conversation adds details, changes priority, or reassigns
3. AVOID creating duplicate tasks
4. UPDATE existing tasks if new information is relevant

For each action item, decide:
- "new": Create new action item
- "update": Modify existing item with new details  
- "keep": Existing item stays the same

Return JSON with "action_items" array. Each item needs:
- text: Clear, actionable description
- assignee: Person's name if mentioned, or null
- priority: "high", "medium", or "low"
- confidence: 0.0 to 1.0 score
- status: "new" or "updated" (for existing items that got updated)

If no changes needed, return existing items as-is.

Example format:
{{
  "action_items": [
    {{
      "text": "Update the documentation for the API endpoints by Friday",
      "assignee": "John", 
      "priority": "high",
      "confidence": 0.9,
      "status": "updated"
    }}
  ]
}}"""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                temperature=0.2,
                system="You are an expert at managing action items. Avoid duplicates, merge related tasks, and update existing ones with new details. Always respond with valid JSON.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            result = response.content[0].text
            parsed = json.loads(result)
            
            # Handle both array and object with items key
            items_data = parsed.get("action_items", []) if isinstance(parsed, dict) else parsed
            
            # Filter by confidence threshold and create ActionItem objects
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
                print(f"✅ Task Generator processed {len(action_items)} action items (with context)")
            
            return action_items
            
        except Exception as e:
            print(f"❌ Task Generator Agent context error: {str(e)}")
            # Fallback to original method
            return await self.extract_action_items(transcript_segment)

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

            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                temperature=0.2,
                system="You are an expert at identifying action items and tasks from meeting conversations. Only extract clear, actionable items. Always respond with valid JSON.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            result = response.content[0].text
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

            response = self.client.messages.create(
                model=self.model,
                max_tokens=512,
                temperature=0.3,
                system="You are a product manager creating clear, actionable Jira tickets. Always respond with valid JSON.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            result = json.loads(response.content[0].text)
            return result
            
        except Exception as e:
            print(f"❌ Jira description generation error: {str(e)}")
            return {
                "summary": action_item.text,
                "description": f"Action item from meeting.\n\nAssignee: {action_item.assignee or 'TBD'}"
            }
