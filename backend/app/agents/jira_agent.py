"""
Jira Agent - Integrates with Jira to create tickets from action items
Supports both API Token and SSO authentication
"""
import os
import requests
import base64
from typing import Dict, Any
from app.models import ActionItem


class JiraAgent:
    """
    Agent responsible for creating Jira tickets from action items
    Supports API Token and SSO (via OAuth/PAT token) authentication
    """
    
    def __init__(self):
        # Cross River Bank Jira Configuration
        self.jira_url = os.getenv("JIRA_URL", "https://crossriverbank.atlassian.net")
        self.jira_email = os.getenv("JIRA_EMAIL")  # Your Cross River email
        self.jira_api_token = os.getenv("JIRA_API_TOKEN")  # Your Jira API token or OAuth token
        self.jira_project_key = os.getenv("JIRA_PROJECT_KEY", "BEKAMON")  # Your primary project key
        self.jira_project_key_fallback = os.getenv("JIRA_PROJECT_KEY_FALLBACK")  # Alternative project if primary fails
        self.jira_auth_type = os.getenv("JIRA_AUTH_TYPE", "basic")  # "basic" or "bearer" for SSO
        
        if not all([self.jira_email, self.jira_api_token]):
            print("⚠️ Jira Agent: Missing credentials - will use demo mode")
            print("   To enable real Jira integration, set these environment variables:")
            print("   - JIRA_EMAIL: Your Cross River Bank email")
            print("   - JIRA_API_TOKEN: Your Jira API token or SSO token")
            print("   - JIRA_AUTH_TYPE: 'basic' (default) or 'bearer' for SSO")
            print(f"   - JIRA_URL: {self.jira_url} (already configured)")
            print(f"   - JIRA_PROJECT_KEY: {self.jira_project_key} (primary project)")
            print(f"   - JIRA_PROJECT_KEY_FALLBACK: (optional - alternative project if primary fails)")
            self.demo_mode = True
        else:
            self.demo_mode = False
            
            # Support both API token (basic auth) and SSO/OAuth token (bearer auth)
            if self.jira_auth_type.lower() == "bearer":
                # SSO/OAuth Bearer Token authentication
                self.headers = {
                    "Authorization": f"Bearer {self.jira_api_token}",
                    "Content-Type": "application/json"
                }
                print(f"✅ Jira Agent initialized with SSO/Bearer token")
            else:
                # Default: Basic Auth with API Token
                credentials = f"{self.jira_email}:{self.jira_api_token}"
                encoded_credentials = base64.b64encode(credentials.encode()).decode()
                self.headers = {
                    "Authorization": f"Basic {encoded_credentials}",
                    "Content-Type": "application/json"
                }
                print(f"✅ Jira Agent initialized with Basic Auth (API Token)")
            
            print(f"   Jira URL: {self.jira_url}")
            print(f"   Project: {self.jira_project_key}")
            print(f"   Email: {self.jira_email}")
            print(f"   Auth Type: {self.jira_auth_type}")
    
    async def create_ticket(
        self, 
        action_item: ActionItem, 
        jira_description: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Create a Jira ticket from an action item
        
        Args:
            action_item: The action item to create a ticket for
            jira_description: Generated summary and description
            
        Returns:
            Dict with ticket information or error
        """
        try:
            if self.demo_mode:
                return self._create_demo_ticket(action_item, jira_description)
            
            # Prepare ticket data
            ticket_data = {
                "fields": {
                    "project": {
                        "key": self.jira_project_key
                    },
                    "summary": jira_description.get("summary", action_item.text),
                    "description": {
                        "type": "doc",
                        "version": 1,
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": jira_description.get("description", action_item.text)
                                    }
                                ]
                            }
                        ]
                    },
                    "issuetype": {
                        "name": "Task"
                    },
                    "priority": {
                        "name": self._convert_priority(action_item.priority)
                    }
                }
            }
            
            # Add assignee if specified
            if action_item.assignee:
                # Note: In real Jira, you'd need to map names to Jira user IDs
                ticket_data["fields"]["assignee"] = {
                    "displayName": action_item.assignee
                }
            
            # Create the ticket - try primary project first
            response = requests.post(
                f"{self.jira_url}/rest/api/3/issue",
                headers=self.headers,
                json=ticket_data,
                timeout=30
            )
            
            if response.status_code == 201:
                ticket_info = response.json()
                return {
                    "success": True,
                    "ticket_key": ticket_info["key"],
                    "ticket_url": f"{self.jira_url}/browse/{ticket_info['key']}",
                    "message": f"✅ Created Jira ticket: {ticket_info['key']}",
                    "project_key": self.jira_project_key
                }
            elif response.status_code == 403 and self.jira_project_key_fallback:
                # Permission denied on primary project - try fallback
                print(f"⚠️ Permission denied on {self.jira_project_key}, trying fallback project {self.jira_project_key_fallback}...")
                ticket_data["fields"]["project"]["key"] = self.jira_project_key_fallback
                
                response = requests.post(
                    f"{self.jira_url}/rest/api/3/issue",
                    headers=self.headers,
                    json=ticket_data,
                    timeout=30
                )
                
                if response.status_code == 201:
                    ticket_info = response.json()
                    return {
                        "success": True,
                        "ticket_key": ticket_info["key"],
                        "ticket_url": f"{self.jira_url}/browse/{ticket_info['key']}",
                        "message": f"✅ Created Jira ticket in {self.jira_project_key_fallback}: {ticket_info['key']}",
                        "project_key": self.jira_project_key_fallback,
                        "fallback_used": True
                    }
                else:
                    print(f"❌ Fallback project also failed ({response.status_code}): {response.text[:200]}")
                    return {
                        "success": False,
                        "error": f"Permission denied on both {self.jira_project_key} and fallback {self.jira_project_key_fallback}",
                        "debug_info": response.text[:500]
                    }
            elif response.status_code == 401:
                auth_type = "SSO/Bearer token" if self.jira_auth_type.lower() == "bearer" else "API token"
                print(f"❌ Jira Authentication Failed (401): Invalid {auth_type}")
                print(f"   Response: {response.text[:200]}")
                return {
                    "success": False,
                    "error": f"Jira authentication failed (401). Please verify your {auth_type} is correct and not expired.",
                    "debug_info": f"HTTP {response.status_code}: {response.text[:200]}"
                }
            else:
                print(f"❌ Jira API error ({response.status_code}): {response.text[:200]}")
                return {
                    "success": False,
                    "error": f"Jira API error: {response.status_code}",
                    "debug_info": response.text[:500]
                }
                
        except Exception as e:
            print(f"❌ Jira Agent error: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to create Jira ticket: {str(e)}"
            }
    
    def _create_demo_ticket(self, action_item: ActionItem, jira_description: Dict[str, str]) -> Dict[str, Any]:
        """
        Create a demo ticket response when Jira credentials are not available
        """
        import random
        ticket_key = f"MW-{random.randint(100, 999)}"
        
        return {
            "success": True,
            "ticket_key": ticket_key,
            "ticket_url": f"https://demo.atlassian.net/browse/{ticket_key}",
            "message": f"✅ Demo: Created Jira ticket {ticket_key}",
            "demo_mode": True,
            "summary": jira_description.get("summary", action_item.text),
            "description": jira_description.get("description", action_item.text)
        }
    
    def _convert_priority(self, priority: str) -> str:
        """
        Convert our priority levels to Jira priority names
        """
        priority_map = {
            "high": "High",
            "medium": "Medium", 
            "low": "Low"
        }
        return priority_map.get(priority.lower(), "Medium")
    
    async def get_project_info(self) -> Dict[str, Any]:
        """
        Get information about the Jira project
        """
        try:
            if self.demo_mode:
                return {
                    "success": True,
                    "project_key": "MW-DEMO",
                    "project_name": "Meeting Whisperer Demo",
                    "demo_mode": True
                }
            
            response = requests.get(
                f"{self.jira_url}/rest/api/3/project/{self.jira_project_key}",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                project_info = response.json()
                return {
                    "success": True,
                    "project_key": project_info["key"],
                    "project_name": project_info["name"],
                    "project_url": f"{self.jira_url}/browse/{project_info['key']}"
                }
            else:
                return {
                    "success": False,
                    "error": f"Project not found: {response.status_code}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get project info: {str(e)}"
            }