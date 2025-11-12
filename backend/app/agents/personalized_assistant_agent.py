"""
Personalized Assistant Agent - Provides personalized explanations based on user's background
"""
import anthropic
import os
from typing import List, Dict, Optional
import json


class PersonalizedAssistantAgent:
    """
    Agent that monitors conversations and provides personalized explanations
    based on the user's background and expertise level.

    Features:
    - Detects technical terms outside user's expertise
    - Provides real-time explanations
    - Contextual learning based on conversation
    - Adapts to user's knowledge level
    """

    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")

        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.model = os.getenv("CLAUDE_MODEL", "claude-3-haiku-20240307")

        print(f"✅ Personalized Assistant Agent initialized with Claude model: {self.model}")

    async def analyze_for_user(
        self,
        user_profile: Dict[str, any],
        recent_transcript: List[Dict[str, str]],
        latest_text: str
    ) -> Optional[str]:
        """
        Analyze the latest conversation text and provide personalized explanations

        Args:
            user_profile: User's background information
                {
                    "name": "Paul",
                    "strong_areas": ["finance", "business", "management"],
                    "weak_areas": ["technical", "engineering", "programming"],
                    "expertise_level": "finance_expert"
                }
            recent_transcript: Recent conversation context
            latest_text: The most recent text to analyze

        Returns:
            Explanation text if needed, None if no explanation required
        """
        try:
            # Build context from recent transcript
            context = "\n".join([
                f"{item.get('speaker', 'Speaker')}: {item.get('text', '')}"
                for item in recent_transcript[-10:]  # Last 10 lines for context
            ])

            # Create user profile description
            profile_desc = f"""
User Profile:
- Name: {user_profile.get('name', 'User')}
- Strong Background: {', '.join(user_profile.get('strong_areas', ['general']))}
- Areas Needing Support: {', '.join(user_profile.get('weak_areas', ['technical']))}
- Expertise Level: {user_profile.get('expertise_level', 'intermediate')}
"""

            # Create prompt for Claude
            prompt = f"""You are Cross River Rabbit, a personalized meeting assistant. Your job is to help {user_profile.get('name', 'the user')} understand the conversation by explaining terms and concepts outside their expertise.

{profile_desc}

RECENT CONVERSATION CONTEXT:
{context}

LATEST STATEMENT TO ANALYZE:
"{latest_text}"

Your task:
1. Identify any technical terms, jargon, or concepts in the latest statement that might be unfamiliar to someone with {user_profile.get('name', 'the user')}'s background
2. If you find terms outside their expertise, provide a brief, clear explanation (2-3 sentences max)
3. Be conversational and friendly - you're helping, not lecturing
4. If everything is within their expertise, return "NO_EXPLANATION_NEEDED"

Return your response as JSON:
{{
    "needs_explanation": true/false,
    "terms_identified": ["term1", "term2"],
    "explanation": "Brief, friendly explanation here"
}}

Example:
If a finance expert hears "We need to refactor the API endpoints", you might explain:
{{
    "needs_explanation": true,
    "terms_identified": ["refactor", "API endpoints"],
    "explanation": "In simple terms: 'Refactor' means restructuring existing code to make it cleaner, and 'API endpoints' are like doors that allow different software systems to talk to each other. The team is essentially reorganizing how their software connects with other systems."
}}"""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=512,
                temperature=0.3,
                system="You are Cross River Rabbit, a helpful and friendly AI assistant who provides personalized explanations. Always respond with valid JSON.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            result_text = response.content[0].text
            result = json.loads(result_text)

            if result.get("needs_explanation", False):
                explanation = result.get("explanation", "")
                terms = result.get("terms_identified", [])

                print(f"✅ Personalized Assistant: Explanation provided for terms: {', '.join(terms)}")

                # Format the explanation nicely
                formatted_explanation = f"💡 **Quick Explanation**\n\n{explanation}"

                if terms:
                    formatted_explanation += f"\n\n📌 Terms: {', '.join(terms)}"

                return formatted_explanation
            else:
                return None

        except Exception as e:
            print(f"❌ Personalized Assistant error: {str(e)}")
            return None

    async def get_contextual_help(
        self,
        user_profile: Dict[str, any],
        question: str,
        conversation_context: str
    ) -> str:
        """
        Provide contextual help based on user's question

        Args:
            user_profile: User's background
            question: User's question
            conversation_context: Recent conversation

        Returns:
            Helpful explanation
        """
        try:
            prompt = f"""You are Cross River Rabbit helping {user_profile.get('name', 'the user')}.

User Background: {', '.join(user_profile.get('strong_areas', ['general']))}

Recent Context:
{conversation_context}

User's Question: {question}

Provide a clear, concise answer tailored to their background. Be friendly and use analogies from their area of expertise when possible."""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=512,
                temperature=0.5,
                system="You are Cross River Rabbit, a helpful AI assistant providing personalized explanations.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            return response.content[0].text

        except Exception as e:
            print(f"❌ Contextual help error: {str(e)}")
            return "I'm having trouble processing your question right now. Please try again."

    async def suggest_learning_topics(
        self,
        user_profile: Dict[str, any],
        meeting_transcript: List[Dict[str, str]]
    ) -> List[str]:
        """
        Suggest topics the user might want to learn more about based on the meeting

        Args:
            user_profile: User's background
            meeting_transcript: Full meeting transcript

        Returns:
            List of suggested topics
        """
        try:
            # Analyze meeting for topics outside user's expertise
            transcript_text = "\n".join([
                f"{item.get('speaker', 'Speaker')}: {item.get('text', '')}"
                for item in meeting_transcript[-20:]  # Last 20 lines
            ])

            prompt = f"""Analyze this meeting transcript for topics that {user_profile.get('name', 'the user')} might want to learn more about.

User's Background: {', '.join(user_profile.get('strong_areas', ['general']))}
Areas Outside Expertise: {', '.join(user_profile.get('weak_areas', ['technical']))}

Meeting Transcript:
{transcript_text}

Identify 3-5 key topics or terms that came up repeatedly that are outside their expertise.
Return as JSON array of strings:
["topic1", "topic2", "topic3"]"""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=256,
                temperature=0.3,
                system="You are an AI assistant identifying learning topics. Respond with valid JSON.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            topics = json.loads(response.content[0].text)
            return topics if isinstance(topics, list) else []

        except Exception as e:
            print(f"❌ Topic suggestion error: {str(e)}")
            return []
