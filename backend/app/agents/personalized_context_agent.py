"""
Personalized Context Agent - Provides user-specific explanations and context
"""
import anthropic
import os
from typing import List, Dict, Optional
import json


class PersonalizedContextAgent:
    """
    Agent that provides personalized explanations based on user background

    Features:
    - Analyzes user background (finance, technical, marketing, etc.)
    - Detects terms outside user's expertise
    - Provides real-time explanations
    - Adapts to conversation context
    """

    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")

        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.model = os.getenv("CLAUDE_MODEL", "claude-3-haiku-20240307")

        print(f"✅ Personalized Context Agent initialized with Claude model: {self.model}")

    async def analyze_for_user(
        self,
        user_profile: Dict[str, any],
        recent_transcript: List[Dict[str, str]],
        new_text: str
    ) -> Dict[str, any]:
        """
        Analyze new text and provide personalized context based on user background

        Args:
            user_profile: User's background info (e.g., {"name": "Paul", "background": "finance", "expertise": ["accounting", "budgeting"]})
            recent_transcript: Recent conversation context
            new_text: New text to analyze

        Returns:
            Dictionary with explanations and context
        """
        try:
            # Build conversation context
            conversation = "\n".join([
                f"{item.get('speaker', 'Speaker')}: {item.get('text', '')}"
                for item in recent_transcript[-10:]  # Last 10 messages for context
            ])

            # Build user profile description
            background = user_profile.get("background", "general")
            expertise_areas = user_profile.get("expertise", [])
            weak_areas = user_profile.get("weak_areas", [])
            user_name = user_profile.get("name", "User")

            profile_description = f"""
User Profile:
- Name: {user_name}
- Background: {background}
- Strong areas: {', '.join(expertise_areas) if expertise_areas else 'Not specified'}
- Areas needing support: {', '.join(weak_areas) if weak_areas else 'Not specified'}
"""

            prompt = f"""You are Cross River Rabbit, a personalized meeting assistant. Your job is to help users understand topics outside their expertise.

{profile_description}

RECENT CONVERSATION:
{conversation}

NEW MESSAGE:
{new_text}

Analyze the NEW MESSAGE and determine if it contains terms, concepts, or topics that are outside the user's expertise and may need explanation.

If there are terms/concepts to explain:
1. Identify the specific terms
2. Provide clear, simple explanations
3. Relate them to the user's background when possible
4. Keep it concise and friendly

Return JSON with:
{{
    "needs_explanation": true/false,
    "terms": ["term1", "term2"],
    "explanations": [
        {{
            "term": "term name",
            "definition": "simple explanation",
            "context": "why it matters in this conversation",
            "example": "example related to user's background"
        }}
    ],
    "summary": "brief friendly message to user"
}}

If no explanation is needed, return:
{{
    "needs_explanation": false,
    "terms": [],
    "explanations": [],
    "summary": ""
}}
"""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=1500,
                temperature=0.3,
                system="You are Cross River Rabbit, a helpful assistant that provides personalized context. Always respond with valid JSON.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            result = json.loads(response.content[0].text)

            if result.get("needs_explanation"):
                print(f"✅ Personalized Context: Found {len(result.get('terms', []))} terms needing explanation for {user_name}")

            return result

        except Exception as e:
            print(f"❌ Personalized Context Agent error: {str(e)}")
            return {
                "needs_explanation": False,
                "terms": [],
                "explanations": [],
                "summary": ""
            }

    async def format_explanation_for_display(self, analysis: Dict[str, any]) -> str:
        """
        Format the analysis into a friendly display message

        Args:
            analysis: Analysis result from analyze_for_user

        Returns:
            Formatted string for display in UI
        """
        if not analysis.get("needs_explanation"):
            return ""

        message = "🐰 **Cross River Rabbit here!**\n\n"

        if analysis.get("summary"):
            message += f"{analysis['summary']}\n\n"

        explanations = analysis.get("explanations", [])
        if explanations:
            message += "**Terms explained:**\n\n"
            for exp in explanations:
                term = exp.get("term", "")
                definition = exp.get("definition", "")
                context = exp.get("context", "")
                example = exp.get("example", "")

                message += f"**{term}**\n"
                message += f"📖 {definition}\n\n"

                if context:
                    message += f"💡 Why it matters: {context}\n\n"

                if example:
                    message += f"💼 Example: {example}\n\n"

                message += "---\n\n"

        return message.strip()

    async def get_user_profile(self, user_id: str) -> Dict[str, any]:
        """
        Get user profile (in production, this would come from a database)
        For now, returns a sample profile

        Args:
            user_id: User identifier

        Returns:
            User profile dictionary
        """
        # Sample profiles for demonstration
        profiles = {
            "paul": {
                "name": "Paul",
                "background": "finance",
                "expertise": ["accounting", "budgeting", "financial planning", "investment", "compliance"],
                "weak_areas": ["software development", "APIs", "cloud computing", "machine learning", "DevOps"]
            },
            "sarah": {
                "name": "Sarah",
                "background": "software engineering",
                "expertise": ["Python", "JavaScript", "databases", "APIs", "cloud platforms"],
                "weak_areas": ["financial modeling", "accounting principles", "tax regulations"]
            },
            "default": {
                "name": "User",
                "background": "general",
                "expertise": [],
                "weak_areas": ["technical jargon", "industry-specific terms"]
            }
        }

        return profiles.get(user_id.lower(), profiles["default"])
