# 🔑 Getting Claude AI Working - Setup Guide

## Option 1: Direct Anthropic API (Recommended)

1. **Go to**: https://console.anthropic.com/
2. **Sign up** with your email
3. **Go to API Keys** section
4. **Create new key** - copy it (starts with `sk-ant-`)
5. **Add to .env file**:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-real-key-here
   ```

## Option 2: Try OpenAI for Emotions (If you have credits)

If you want to use OpenAI for both transcription AND emotion analysis:

1. **Check your OpenAI quota**: https://platform.openai.com/usage
2. **Add credits** if needed
3. **Set demo mode off** in `.env`:
   ```
   DEMO_MODE=false
   ```

## Option 3: Test Mode (No AI, just UI testing)

For now, let's get the app running so you can see the interface:

1. **Demo mode** shows fake data but real UI
2. **You can test** the recording interface
3. **Upload audio files** to see transcription workflow

## Current Status:
- ✅ Backend: Emotion analysis agent ready
- ✅ Frontend: Emotion UI components ready  
- ⏳ Need: Real Claude API key for emotions
- ⏳ Need: OpenAI credits for transcription

## Quick Test:
Run the app in demo mode first to see the interface, then add real API keys!