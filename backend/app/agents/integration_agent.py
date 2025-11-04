"""
Integration Agent - Handles external integrations (Jira, Teams, Slack)
"""
import os
import aiohttp
from typing import List, Dict
import json
from app.models import ActionItem


class IntegrationAgent:
    """
    Agent responsible for posting to external platforms
    Features:
    - Create Jira tasks
    - Post to Microsoft Teams
    - Post to Slack
    - Format messages appropriately for each platform
    """
    
    def __init__(self):
        self.jira_url = os.getenv("JIRA_URL")
        self.jira_email = os.getenv("JIRA_EMAIL")
        self.jira_api_token = os.getenv("JIRA_API_TOKEN")
        self.jira_project_key = os.getenv("JIRA_PROJECT_KEY", "PROJ")
        
        self.teams_webhook = os.getenv("TEAMS_WEBHOOK_URL")
        self.slack_webhook = os.getenv("SLACK_WEBHOOK_URL")
        
        print(f"✅ Integration Agent initialized")
        if self.jira_url and self.jira_api_token:
            print(f"   - Jira: Configured ({self.jira_url})")
        if self.teams_webhook:
            print(f"   - Teams: Configured")
        if self.slack_webhook:
            print(f"   - Slack: Configured")
    
    async def create_jira_tasks(self, action_items: List[ActionItem]) -> List[Dict]:
        """
        Create Jira tasks from action items
        """
        if not all([self.jira_url, self.jira_email, self.jira_api_token]):
            print("❌ Jira not configured")
            return []
        
        results = []
        
        async with aiohttp.ClientSession() as session:
            for item in action_items:
                try:
                    # Create Jira issue
                    url = f"{self.jira_url}/rest/api/3/issue"
                    
                    auth = aiohttp.BasicAuth(self.jira_email, self.jira_api_token)
                    
                    payload = {
                        "fields": {
                            "project": {"key": self.jira_project_key},
                            "summary": item.text[:255],  # Jira summary limit
                            "description": {
                                "type": "doc",
                                "version": 1,
                                "content": [
                                    {
                                        "type": "paragraph",
                                        "content": [
                                            {
                                                "type": "text",
                                                "text": f"Action item from meeting.\n\nAssignee: {item.assignee or 'TBD'}\nPriority: {item.priority}"
                                            }
                                        ]
                                    }
                                ]
                            },
                            "issuetype": {"name": "Task"}
                        }
                    }
                    
                    async with session.post(url, json=payload, auth=auth) as response:
                        if response.status == 201:
                            result = await response.json()
                            results.append({
                                "key": result.get("key"),
                                "url": f"{self.jira_url}/browse/{result.get('key')}",
                                "action_item": item.text
                            })
                            print(f"✅ Created Jira task: {result.get('key')}")
                        else:
                            error_text = await response.text()
                            print(f"❌ Jira task creation failed: {response.status} - {error_text}")
                
                except Exception as e:
                    print(f"❌ Error creating Jira task: {str(e)}")
        
        return results
    
    async def post_to_teams(self, summary: dict, action_items: List[ActionItem]) -> dict:
        """
        Post meeting summary to Microsoft Teams
        """
        if not self.teams_webhook:
            print("❌ Teams webhook not configured")
            return {"error": "Teams webhook not configured"}
        
        try:
            # Format message for Teams (Adaptive Card)
            card = {
                "@type": "MessageCard",
                "@context": "https://schema.org/extensions",
                "summary": summary.get("title", "Meeting Summary"),
                "themeColor": "03A0EF",
                "title": f"🎙️ {summary.get('title', 'Meeting Summary')}",
                "sections": [
                    {
                        "activityTitle": "Summary",
                        "text": summary.get("summary", "")
                    },
                    {
                        "activityTitle": "📌 Key Points",
                        "text": "\n".join([f"- {point}" for point in summary.get("key_points", [])])
                    },
                    {
                        "activityTitle": "✅ Decisions",
                        "text": "\n".join([f"- {decision}" for decision in summary.get("decisions", [])])
                    },
                    {
                        "activityTitle": "⚡ Action Items",
                        "text": "\n".join([
                            f"- {item.text} ({item.assignee or 'Unassigned'})" 
                            for item in action_items
                        ])
                    }
                ]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.teams_webhook, json=card) as response:
                    if response.status == 200:
                        print("✅ Posted to Teams")
                        return {"status": "success", "platform": "teams"}
                    else:
                        error = await response.text()
                        print(f"❌ Teams post failed: {error}")
                        return {"error": error}
        
        except Exception as e:
            print(f"❌ Teams posting error: {str(e)}")
            return {"error": str(e)}
    
    async def post_to_slack(self, summary: dict, action_items: List[ActionItem]) -> dict:
        """
        Post meeting summary to Slack
        """
        if not self.slack_webhook:
            print("❌ Slack webhook not configured")
            return {"error": "Slack webhook not configured"}
        
        try:
            # Format message for Slack (Block Kit)
            blocks = [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"🎙️ {summary.get('title', 'Meeting Summary')}",
                        "emoji": True
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*Summary:*\n{summary.get('summary', '')}"
                    }
                },
                {"type": "divider"},
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*📌 Key Points:*\n" + "\n".join([f"• {point}" for point in summary.get("key_points", [])])
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*✅ Decisions:*\n" + "\n".join([f"• {decision}" for decision in summary.get("decisions", [])])
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*⚡ Action Items:*\n" + "\n".join([
                            f"• {item.text} (*{item.assignee or 'Unassigned'}*)" 
                            for item in action_items
                        ])
                    }
                }
            ]
            
            payload = {"blocks": blocks}
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.slack_webhook, json=payload) as response:
                    if response.status == 200:
                        print("✅ Posted to Slack")
                        return {"status": "success", "platform": "slack"}
                    else:
                        error = await response.text()
                        print(f"❌ Slack post failed: {error}")
                        return {"error": error}
        
        except Exception as e:
            print(f"❌ Slack posting error: {str(e)}")
            return {"error": str(e)}
