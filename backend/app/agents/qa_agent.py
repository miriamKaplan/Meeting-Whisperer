"""
Q&A Agent - Answers questions about meetings, tasks, and discussions using Claude (Anthropic)
"""
import anthropic
import os
from typing import List, Optional
import json
from app.models import TranscriptLine, ActionItem


class QAAgent:
    """
    Agent responsible for answering questions about meetings
    Features:
    - Answer questions about meeting content
    - Query action items and tasks
    - Provide context from discussions
    - Search through transcripts
    - Summarize specific topics
    """

    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")

        # Create Claude client
        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.model = os.getenv("CLAUDE_MODEL", "claude-3-haiku-20240307")

        print(f"✅ Q&A Agent initialized with Claude model: {self.model}")

    async def answer_question(
        self,
        question: str,
        transcript: List[TranscriptLine],
        action_items: Optional[List[ActionItem]] = None,
        summary: Optional[dict] = None
    ) -> dict:
        """
        Answer a question based on meeting context

        Args:
            question: User's question
            transcript: Full meeting transcript
            action_items: List of action items (optional)
            summary: Meeting summary (optional)

        Returns:
            Dictionary with answer, confidence, and relevant sources
        """
        try:
            # Build context from transcript
            transcript_text = "\n".join([
                f"{line.speaker}: {line.text}"
                for line in transcript
            ])

            # Build action items context
            action_text = ""
            if action_items:
                action_text = "\n\nACTION ITEMS:\n" + "\n".join([
                    f"- {item.text} (Assignee: {item.assignee or 'Unassigned'}, Priority: {item.priority})"
                    for item in action_items
                ])

            # Build summary context
            summary_text = ""
            if summary:
                summary_text = f"\n\nMEETING SUMMARY:\n"
                summary_text += f"Title: {summary.get('title', 'N/A')}\n"
                summary_text += f"Summary: {summary.get('summary', 'N/A')}\n"
                if summary.get('key_points'):
                    summary_text += "Key Points:\n" + "\n".join([f"- {point}" for point in summary['key_points']])
                if summary.get('decisions'):
                    summary_text += "\nDecisions:\n" + "\n".join([f"- {decision}" for decision in summary['decisions']])

            # Create prompt
            prompt = f"""You are an intelligent meeting assistant. Answer the user's question based on the meeting context provided.

MEETING TRANSCRIPT:
{transcript_text}
{action_text}
{summary_text}

USER QUESTION: {question}

Provide a clear, concise answer based on the meeting content. If the answer isn't in the meeting context, say so politely.

Return your response as JSON with:
- answer: Your detailed answer to the question
- confidence: Score from 0.0 to 1.0 indicating how confident you are
- sources: Array of relevant quotes from the meeting that support your answer
- relevant_speakers: List of speakers who discussed this topic

Example format:
{{
  "answer": "The team decided to launch the feature next week...",
  "confidence": 0.9,
  "sources": ["John: We should launch next week", "Sarah: I agree with the timeline"],
  "relevant_speakers": ["John", "Sarah"]
}}"""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                temperature=0.3,
                system="You are a helpful meeting assistant that answers questions accurately based on meeting transcripts. Always be honest if you don't have enough information. Always respond with valid JSON.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            result = response.content[0].text
            parsed = json.loads(result)

            print(f"✅ Q&A Agent answered question with confidence: {parsed.get('confidence', 0):.2f}")

            return parsed

        except Exception as e:
            print(f"❌ Q&A Agent error: {str(e)}")
            return {
                "answer": "I'm sorry, I encountered an error processing your question. Please try rephrasing it.",
                "confidence": 0.0,
                "sources": [],
                "relevant_speakers": []
            }

    async def search_topic(
        self,
        topic: str,
        transcript: List[TranscriptLine]
    ) -> dict:
        """
        Search for a specific topic in the meeting

        Args:
            topic: Topic to search for
            transcript: Full meeting transcript

        Returns:
            Dictionary with relevant segments and summary
        """
        try:
            transcript_text = "\n".join([
                f"[{i}] {line.speaker}: {line.text}"
                for i, line in enumerate(transcript)
            ])

            prompt = f"""Search through this meeting transcript for discussions about: "{topic}"

MEETING TRANSCRIPT:
{transcript_text}

Find all relevant segments where this topic was discussed. Return JSON with:
- found: Boolean indicating if topic was found
- summary: Brief summary of what was said about this topic
- segments: Array of transcript line numbers where this topic was discussed
- key_quotes: Array of relevant quotes about this topic

Example format:
{{
  "found": true,
  "summary": "The team discussed launching the new feature...",
  "segments": [5, 12, 23],
  "key_quotes": ["We need to launch by next week", "The feature is almost ready"]
}}"""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                temperature=0.2,
                system="You are an expert at searching and analyzing meeting transcripts. Always respond with valid JSON.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            result = json.loads(response.content[0].text)

            if result.get("found"):
                print(f"✅ Q&A Agent found {len(result.get('segments', []))} segments about: {topic}")
            else:
                print(f"ℹ️ Q&A Agent: Topic '{topic}' not found in meeting")

            return result

        except Exception as e:
            print(f"❌ Topic search error: {str(e)}")
            return {
                "found": False,
                "summary": "Error searching for topic",
                "segments": [],
                "key_quotes": []
            }

    async def compare_tasks(
        self,
        action_items: List[ActionItem]
    ) -> dict:
        """
        Analyze and compare action items to find dependencies, conflicts, or priorities

        Args:
            action_items: List of action items

        Returns:
            Analysis of task relationships and recommendations
        """
        try:
            tasks_text = "\n".join([
                f"{i+1}. {item.text} (Assignee: {item.assignee or 'Unassigned'}, Priority: {item.priority})"
                for i, item in enumerate(action_items)
            ])

            prompt = f"""Analyze these action items for dependencies, conflicts, and priorities:

ACTION ITEMS:
{tasks_text}

Provide analysis with:
- dependencies: Which tasks depend on others
- conflicts: Tasks that might conflict (same person, competing priorities)
- recommendations: Suggested order or groupings
- timeline_estimate: Rough estimate of how long tasks might take

Return as JSON."""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                temperature=0.3,
                system="You are a project management expert analyzing task relationships. Always respond with valid JSON.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            result = json.loads(response.content[0].text)
            print(f"✅ Q&A Agent analyzed {len(action_items)} tasks")

            return result

        except Exception as e:
            print(f"❌ Task comparison error: {str(e)}")
            return {
                "dependencies": [],
                "conflicts": [],
                "recommendations": [],
                "timeline_estimate": "Unable to estimate"
            }
