# Jira SSO Authentication Setup

Your Meeting Whisperer app now supports **SSO (Single Sign-On) authentication** with Jira! 🎉

## Option 1: Using Your SSO Token (Recommended for SSO users)

If your Jira uses SSO, you can use your existing session token or OAuth token:

1. **Get your SSO/OAuth token:**
   - Option A: Use a Personal Access Token (PAT) from Jira
   - Option B: Use an OAuth token from your SSO provider
   - Option C: Extract the session token from your browser (see below)

2. **Set environment variables:**
```bash
export JIRA_EMAIL="mkaplan@crossriverbank.com"
export JIRA_API_TOKEN="<your-sso-or-oauth-token>"
export JIRA_AUTH_TYPE="bearer"  # Important: Use "bearer" for SSO/OAuth tokens
export JIRA_URL="https://crossriverbank.atlassian.net"
export JIRA_PROJECT_KEY="BEKAMON"
export ANTHROPIC_API_KEY="<your-claude-api-key>"
```

3. **Start the backend:**
```bash
cd /Users/mkaplan/Desktop/Meeting-Whisperer/backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Option 2: Generate a Jira PAT (Personal Access Token)

If you want to use a token specifically for this app:

1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Name it "Meeting Whisperer"
4. Copy the token

Then use:
```bash
export JIRA_AUTH_TYPE="basic"  # Use "basic" for API tokens
export JIRA_API_TOKEN="<your-new-token>"
```

## Option 3: Use Browser Session (Most Seamless)

If you're already logged into Jira in your browser:

1. Open Chrome DevTools (F12)
2. Go to Application > Cookies > https://crossriverbank.atlassian.net
3. Find the `cloud.session.token` cookie
4. Use that as your token:

```bash
export JIRA_AUTH_TYPE="bearer"
export JIRA_API_TOKEN="<cloud.session.token-value>"
```

## Testing Your Setup

```bash
# Test if your credentials work
curl -s -X GET "https://crossriverbank.atlassian.net/rest/api/3/myself" \
  -H "Authorization: Bearer $(echo $JIRA_API_TOKEN)" \
  -H "Content-Type: application/json"

# Should return your user information if successful
```

## Troubleshooting

If you still get 401 errors:

1. **Token expired?** Regenerate it in Jira settings
2. **Wrong token type?** Make sure JIRA_AUTH_TYPE matches your token type
3. **Permissions issue?** Verify your account can create tasks in the BEKAMON project
4. **SSO issue?** Ask your Jira admin if SSO tokens are supported for API access

## Summary

- For **API tokens**: Use `JIRA_AUTH_TYPE=basic`
- For **SSO/OAuth tokens**: Use `JIRA_AUTH_TYPE=bearer`
- For **Jira Cloud**: Both methods work
- For **Jira Server/Data Center**: Check with your admin about SSO support

Questions? Your backend will now show exactly which auth type it's using when it starts! 🚀
