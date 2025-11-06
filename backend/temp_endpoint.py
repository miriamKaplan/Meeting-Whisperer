
# Add emotion analysis endpoint
@app.post("/api/analyze-emotion")
async def analyze_emotion_text(data: dict):
    """Analyze emotion from text using Claude AI"""
    try:
        text = data.get("text", "")
        speaker = data.get("speaker", "Speaker")
        
        if not text:
            return {"error": "No text provided"}
            
        # Use the emotion agent to analyze
        emotion_result = await emotion_agent.analyze_single_message(text, speaker)
        
        return emotion_result
        
    except Exception as e:
        print(f"❌ Emotion analysis error: {e}")
        return {"error": str(e)}

