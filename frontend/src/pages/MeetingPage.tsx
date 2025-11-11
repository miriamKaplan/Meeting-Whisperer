import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f8fa 0%, #ebf0f2 100%);
  padding: 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ControlCard = styled(Card)`
  max-width: 1200px;
  margin: 0 auto 2rem auto;
  background: linear-gradient(135deg, #ffffff 0%, #f5f8fa 100%);
  border: 1px solid #d5d9dd;
  box-shadow: 0 4px 12px rgba(31, 0, 64, 0.1);
  
  h2 {
    margin-bottom: 1.5rem;
    color: #1f0040;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const RecordButton = styled(Button)<{ $isRecording?: boolean }>`
  width: 100%;
  margin-bottom: 1rem;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: ${props => props.$isRecording 
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
    : 'linear-gradient(135deg, #03A0EF 0%, #0289D3 100%)'
  };
  border: none;
  box-shadow: 0 4px 12px ${props => props.$isRecording 
    ? 'rgba(239, 68, 68, 0.3)' 
    : 'rgba(3, 160, 239, 0.3)'
  };
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$isRecording 
      ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' 
      : 'linear-gradient(135deg, #0289D3 0%, #0F436E 100%)'
    };
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${props => props.$isRecording 
      ? 'rgba(239, 68, 68, 0.4)' 
      : 'rgba(3, 160, 239, 0.4)'
    };
  }
`;

const ClearButton = styled(Button)`
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(107, 114, 128, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 12px rgba(107, 114, 128, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  ${RecordButton} {
    margin-bottom: 0;
    flex: 2;
  }
  
  ${ClearButton} {
    margin-bottom: 0;
    flex: 1;
  }
`;

const Timer = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  color: #03A0EF;
  margin-bottom: 1.5rem;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  background: linear-gradient(135deg, #03A0EF 0%, #0289D3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(3, 160, 239, 0.2);
`;

const TranscriptCard = styled(Card)`
  background: linear-gradient(135deg, #ffffff 0%, #f5f8fa 100%);
  border: 1px solid #d5d9dd;
  box-shadow: 0 4px 12px rgba(31, 0, 64, 0.1);
  display: flex;
  flex-direction: column;
  
  h2 {
    color: #1f0040;
    margin: 0 0 1.5rem 0;
    padding: 0;
    font-weight: 600;
    line-height: 1.2;
  }
`;

const TranscriptTitle = styled.h3`
  color: #1f0040;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.2rem;
`;

const TranscriptContent = styled.div`
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #d5d9dd;
  border-radius: 12px;
  padding: 1.5rem;
  background: #ffffff;
  box-shadow: inset 0 1px 3px rgba(31, 0, 64, 0.1);
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f5f8fa;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d5d9dd;
    border-radius: 4px;
    
    &:hover {
      background: #bfc1c8;
    }
  }
`;

const TranscriptLine = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-bottom: 1px solid #ebf0f2;
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f5f8fa 100%);
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #f5f8fa 0%, #ebf0f2 100%);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(31, 0, 64, 0.1);
  }
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const LiveTranscriptLine = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 2px solid #03A0EF;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(3, 160, 239, 0.05) 0%, rgba(2, 137, 211, 0.1) 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(3, 160, 239, 0.2), transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  
  @keyframes live-pulse {
    0%, 100% { border-color: #03A0EF; }
    50% { border-color: #0289D3; }
  }
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
  
  animation: live-pulse 2s ease-in-out infinite;
`;

const Speaker = styled.span`
  font-weight: 700;
  color: #03A0EF;
  margin-right: 0.75rem;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EmotionIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.75rem 0;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #f5f8fa 0%, #ebf0f2 100%);
  border-radius: 8px;
  font-size: 0.9rem;
  color: #464853;
  border: 1px solid #d5d9dd;
  font-weight: 500;
`;

const HappinessBar = styled.div<{ level: number }>`
  width: 60px;
  height: 10px;
  background: #ebf0f2;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
  border: 1px solid #d5d9dd;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.level}%;
    background: linear-gradient(to right, 
      #ef4444 0%, 
      #f59e0b 25%, 
      #eab308 50%, 
      #84cc16 75%, 
      #22c55e 100%
    );
    border-radius: 4px;
    transition: width 0.3s ease;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #898a92;
  padding: 3rem;
  background: linear-gradient(135deg, #f5f8fa 0%, #ebf0f2 100%);
  border-radius: 12px;
  border: 2px dashed #d5d9dd;
  
  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.7;
  }
  
  p {
    font-size: 1.1rem;
    font-weight: 500;
    line-height: 1.5;
  }
`;

const ActionItemsCard = styled(Card)`
  background: linear-gradient(135deg, #ffffff 0%, #f5f8fa 100%);
  border: 1px solid #d5d9dd;
  box-shadow: 0 4px 12px rgba(31, 0, 64, 0.1);
  display: flex;
  flex-direction: column;
  
  h2 {
    color: #1f0040;
    margin: 0 0 1.5rem 0;
    padding: 0;
    font-weight: 600;
    line-height: 1.2;
  }
`;

const ActionItemsList = styled.div`
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #d5d9dd;
  border-radius: 12px;
  padding: 1.5rem;
  background: #ffffff;
  box-shadow: inset 0 1px 3px rgba(31, 0, 64, 0.1);
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f5f8fa;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d5d9dd;
    border-radius: 4px;
    
    &:hover {
      background: #bfc1c8;
    }
  }
`;

const ActionItem = styled.div`
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, #ffffff 0%, #f5f8fa 100%);
  border: 1px solid #d5d9dd;
  border-radius: 8px;
  color: #1f0040;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(31, 0, 64, 0.1);
  }
`;

const ActionItemText = styled.div`
  flex: 1;
  margin-right: 1rem;
`;

const JiraButton = styled.button`
  background: linear-gradient(135deg, #0052CC 0%, #003d99 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 82, 204, 0.3);
    background: linear-gradient(135deg, #003d99 0%, #0052CC 100%);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FileUpload = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.75rem;
    color: #1f0040;
    font-weight: 600;
    font-size: 0.95rem;
  }
  
  input[type="file"] {
    display: none;
  }
  
  > div {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 1.25rem;
    border: 2px dashed #03A0EF;
    border-radius: 12px;
    background: linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%);
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    color: #03A0EF;
    transition: all 0.3s ease;
    gap: 0.75rem;
    
    &:hover {
      border-color: #0289D3;
      background: linear-gradient(135deg, #e6f0ff 0%, #d6e9ff 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(3, 160, 239, 0.2);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(3, 160, 239, 0.15);
    }
  }
  
  input[type="file"]:disabled + div {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const VideoPreviewContainer = styled.div`
  margin-top: 1.5rem;
  border: 2px solid #03A0EF;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 4px 12px rgba(3, 160, 239, 0.3);
  position: relative;
  
  video {
    width: 100%;
    height: auto;
    display: block;
    max-height: 300px;
    object-fit: contain;
  }
  
  .preview-label {
    padding: 0.75rem;
    background: linear-gradient(135deg, #03A0EF 0%, #0289D3 100%);
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    
    .label-text {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
  
  .close-button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
`;

const ProcessingIndicator = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 2px solid #03A0EF;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(3, 160, 239, 0.1) 0%, rgba(2, 137, 211, 0.15) 100%);
  text-align: center;
  font-weight: 600;
  color: #03A0EF;
  animation: pulse 2s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
`;

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #51cf66, #40c057);
  color: white;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(81, 207, 102, 0.3);
`;const StatusMessage = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  color: #0369a1;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '💡';
    font-size: 1.2rem;
  }
`;

const RealtimeInsightsPanel = styled(Card)`
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border: 2px solid #03A0EF;
  box-shadow: 0 4px 16px rgba(3, 160, 239, 0.2);
  animation: subtle-glow 2s ease-in-out infinite;

  @keyframes subtle-glow {
    0%, 100% { box-shadow: 0 4px 16px rgba(3, 160, 239, 0.2); }
    50% { box-shadow: 0 4px 20px rgba(3, 160, 239, 0.35); }
  }

  h2 {
    color: #03A0EF;
    margin: 0 0 1.5rem 0;
    padding: 0;
    font-weight: 700;
    line-height: 1.2;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
      content: '🤖';
      font-size: 1.5rem;
    }
  }
`;

const InsightItem = styled.div`
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: white;
  border-left: 4px solid #03A0EF;
  border-radius: 8px;
  color: #1f0040;
  font-weight: 500;
  font-size: 0.95rem;
  line-height: 1.5;
  box-shadow: 0 2px 8px rgba(3, 160, 239, 0.1);
  animation: slide-in 0.3s ease-out;

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(3, 160, 239, 0.2);
    transition: all 0.2s ease;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const InsightsContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f0f9ff;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #03A0EF;
    border-radius: 4px;

    &:hover {
      background: #0289D3;
    }
  }
`;

interface TranscriptItem {
  speaker: string;
  text: string;
  emotions?: {
    sentiment: string;
    confidence: number;
    happiness_level: number;
    key_emotions: string[];
    mood_summary: string;
  };
  realtimeInsights?: string[];  // NEW: Real-time insights from Claude
}

const MeetingPage: React.FC = () => {
  // State variables
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [sessionNumber, setSessionNumber] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [realtimeInsights, setRealtimeInsights] = useState<string[]>([]);  // NEW: Store real-time insights

  // Refs for managing recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);
  const sessionIdRef = useRef<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioPlaybackRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);  // NEW: For real-time audio capture
  const processorRef = useRef<ScriptProcessorNode | null>(null);  // NEW: For audio processing

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Clear session function
  const clearSession = () => {
    // Don't allow clearing while recording
    if (isRecording) {
      setError('Please stop recording before clearing the session.');
      return;
    }

    // Clear all data
    setTranscript([]);
    setActionItems([]);
    setRealtimeInsights([]);  // NEW: Clear real-time insights
    setDuration(0);
    setError('');

    // Show success message
    setSuccessMessage(`Session ${sessionNumber} cleared!`);

    // Increment session number
    setSessionNumber(prev => prev + 1);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Remove video preview
  const removeVideoPreview = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
  };

  // Play audio from transcript using text-to-speech
  const playTranscriptAudio = () => {
    if (transcript.length === 0) {
      setError('No transcript to play');
      return;
    }

    // Stop any existing playback
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    setError('');

    // Combine all transcript text
    const fullText = transcript.map(item => `${item.speaker}: ${item.text}`).join('. ');
    
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onend = () => {
      setIsPlayingAudio(false);
    };
    
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setError('Audio playback failed');
    };
    
    audioPlaybackRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Generate action items from transcript
  const generateActionItems = async (currentTranscript: TranscriptItem[]) => {
    try {
      // Convert transcript to format expected by backend
      const transcriptData = currentTranscript.map(item => ({
        speaker: item.speaker,
        text: item.text,
        timestamp: new Date().toISOString()
      }));
      
      // Convert existing action items to structured format
      const existingActionItems = actionItems.map(item => {
        // Parse the formatted string back to object
        const match = item.match(/^(.+?)(?:\s*\(([^)]+)\))?\s*\[([^\]]+)\]$/);
        if (match) {
          return {
            text: match[1].trim(),
            assignee: match[2] || null,
            priority: match[3].toLowerCase(),
            confidence: 0.8
          };
        }
        return {
          text: item,
          assignee: null,
          priority: 'medium',
          confidence: 0.8
        };
      });
      
      const response = await fetch('http://localhost:8000/api/generate-action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptData,
          existing_action_items: existingActionItems
        })
      });
      
      const result = await response.json();
      
      if (result.error) {
        console.error('Backend error:', result.error);
        setError(`Action item generation failed: ${result.error}`);
        return;
      }
      
      if (result.action_items && result.action_items.length > 0) {
        // Replace all action items with the updated/merged list
        const newActionItems = result.action_items.map((item: any) => 
          `${item.text} ${item.assignee ? `(${item.assignee})` : ''} [${item.priority}]`
        );
        
        setActionItems(newActionItems);
        setSuccessMessage(`✅ Generated ${newActionItems.length} action items!`);
      } else {
        setError('No action items could be generated from the transcript.');
      }
      
    } catch (err) {
      console.error('Action item generation failed:', err);
      setError(`❌ Failed to generate action items: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Add action item to Jira
  const addToJira = async (actionItem: string, index: number) => {
    try {
      // Parse the action item string to extract details
      const match = actionItem.match(/^(.+?)(?:\s*\(([^)]+)\))?\s*\[([^\]]+)\]$/);
      const itemData = match ? {
        text: match[1].trim(),
        assignee: match[2] || null,
        priority: match[3].toLowerCase(),
        confidence: 0.9
      } : {
        text: actionItem,
        assignee: null,
        priority: 'medium',
        confidence: 0.8
      };
      
      // Create the actual Jira ticket
      const response = await fetch('http://localhost:8000/api/create-jira-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_item: itemData
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const ticketInfo = result.demo_mode ? 
          `🎯 DEMO: Jira Ticket Created!

Ticket: ${result.ticket_key}
Summary: ${result.summary}

Note: This is a demo. Configure JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN, and JIRA_PROJECT_KEY environment variables for real Jira integration.` :
          `✅ Jira Ticket Created Successfully!

Ticket: ${result.ticket_key}
URL: ${result.ticket_url}

Click OK to open the ticket in Jira.`;
        
        const shouldOpen = confirm(ticketInfo);
        
        if (shouldOpen && result.ticket_url && !result.demo_mode) {
          window.open(result.ticket_url, '_blank');
        }
        
        // Optionally mark the action item as "added to Jira"
        setActionItems(prev => 
          prev.map((item, i) => 
            i === index ? `${item} ✅` : item
          )
        );
        
      } else {
        alert(`❌ Failed to create Jira ticket: ${result.error}`);
      }
      
    } catch (err) {
      console.error('Jira integration failed:', err);
      alert('❌ Jira integration failed. Check console for details.');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      
      // Use browser speech recognition (FREE - bypasses OpenAI quota!)
      // Check if browser supports speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Browser speech recognition not supported. Please use Chrome or Safari.');
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true; // Enable interim results for live transcription
      recognition.lang = 'en-US';
      
      speechRecognitionRef.current = recognition;
      
      // Generate session ID for emotion analysis
      sessionIdRef.current = `session_${Date.now()}`;
      
      recognition.onresult = async (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Show interim results in real-time (live transcription)
        if (interimTranscript) {
          // Update the last transcript item if it exists and is interim
          setTranscript(prev => {
            const newTranscript = [...prev];
            if (newTranscript.length > 0 && newTranscript[newTranscript.length - 1].text.startsWith('[LIVE]')) {
              newTranscript[newTranscript.length - 1] = {
                speaker: 'You',
                text: `[LIVE] ${interimTranscript}...`
              };
            } else {
              newTranscript.push({
                speaker: 'You',
                text: `[LIVE] ${interimTranscript}...`
              });
            }
            return newTranscript;
          });
        }
        
        // Process final results with emotion analysis
        if (finalTranscript) {
          // Remove the interim result
          setTranscript(prev => prev.filter(item => !item.text.startsWith('[LIVE]')));
          
          // Send final transcript to backend for emotion analysis with Claude + REAL-TIME INSIGHTS
          try {
            const response = await fetch('http://localhost:8000/api/analyze-emotion', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: finalTranscript,
                speaker: 'You',
                recent_transcript: transcript.slice(-5).map(item => ({  // Send last 5 lines as context
                  speaker: item.speaker,
                  text: item.text,
                  timestamp: new Date().toISOString()
                }))
              })
            });

            const emotionData = await response.json();

            // NEW: Handle real-time insights from Claude
            if (emotionData.realtime_insights && emotionData.realtime_insights.length > 0) {
              console.log('🤖 Real-time insights received:', emotionData.realtime_insights);

              // Add insights to the insights list
              setRealtimeInsights(prev => [...prev, ...emotionData.realtime_insights]);

              // Show success message with insight preview
              const latestInsight = emotionData.realtime_insights[0];
              setSuccessMessage(`🤖 ${latestInsight.substring(0, 50)}...`);
              setTimeout(() => setSuccessMessage(''), 3000);
            }
            
            // Add final transcript with emotions
            const newTranscriptItem = {
              speaker: 'You',
              text: finalTranscript,
              timestamp: new Date().toISOString(),
              emotions: emotionData
            };
            
            setTranscript(prev => {
              const updated = [...prev, newTranscriptItem];
              
              // Check for action items every 3 lines or when manually triggered
              if (updated.length % 3 === 0) {
                generateActionItems(updated);
              }
              
              return updated;
            });
            
          } catch (err) {
            console.error('Emotion analysis failed:', err);
            // Add transcript without emotions as fallback
            const newTranscriptItem = {
              speaker: 'You',
              text: finalTranscript,
              timestamp: new Date().toISOString()
            };
            
            setTranscript(prev => {
              const updated = [...prev, newTranscriptItem];
              
              // Check for action items every 3 lines even without emotions
              if (updated.length % 3 === 0) {
                generateActionItems(updated);
              }
              
              return updated;
            });
          }
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError('Speech recognition error: ' + event.error);
      };
      
      recognition.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err: any) {
      console.error('Error starting recording:', err);
      if (err.message.includes('speech recognition not supported')) {
        setError('Speech recognition not supported in this browser. Please use Chrome or Safari.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  const stopRecording = () => {
    // Stop speech recognition if using browser speech
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    
    // Stop MediaRecorder (if using WebSocket method)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    // Close WebSocket
    if (websocketRef.current) {
      websocketRef.current.close();
    }

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsRecording(false);
  };

  const handleStartStop = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type - accept audio and video
    const audioTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/webm', 'audio/ogg'];
    const videoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/x-flv'];
    const allValidTypes = [...audioTypes, ...videoTypes];

    const isValidType = allValidTypes.includes(file.type) ||
                       file.name.match(/\.(wav|mp3|m4a|webm|ogg|mp4|mov|avi|mkv|flv)$/i);

    if (!isValidType) {
      setError('Please upload a valid audio or video file (WAV, MP3, M4A, WebM, OGG, MP4, MOV, AVI, MKV, or FLV)');
      return;
    }

    // Check file size (max 1GB for all uploads)
    const maxSize = 1024 * 1024 * 1024; // 1GB
    if (file.size > maxSize) {
      setError('File size must be less than 1GB');
      return;
    }

    setError('');
    setSuccessMessage('');

    // Create video preview URL if it's a video file
    const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|avi|mkv|flv)$/i);
    console.log('📹 File uploaded:', file.name, 'isVideo:', isVideo);

    if (isVideo) {
      const previewUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(previewUrl);

      console.log('🎬 Video detected - using TRUE REAL-TIME streaming with Deepgram');
      setSuccessMessage('✅ Video loaded! Click play to start real-time transcription');

      // Start real-time streaming when video starts playing
      const video = videoRef.current;
      if (video) {
        video.onplay = () => {
          startRealtimeVideoTranscription();
        };

        video.onpause = () => {
          stopRealtimeVideoTranscription();
        };
      }

      // Reset file input
      event.target.value = '';
    } else {
      setVideoPreviewUrl(null);
      // For audio files, use the existing batch processing
      // (you can keep the old SSE logic here if needed)
    }
  };

  // NEW: Start real-time video transcription with Deepgram
  const startRealtimeVideoTranscription = async () => {
    try {
      setIsProcessing(true);
      setSuccessMessage('🎙️ Real-time transcription starting...');

      const video = videoRef.current;
      if (!video) {
        setError('Video element not found');
        return;
      }

      // Generate session ID
      const sessionId = `realtime-video-${Date.now()}`;
      sessionIdRef.current = sessionId;

      // Connect to WebSocket for real-time streaming
      const ws = new WebSocket(`ws://localhost:8000/ws/realtime-video/${sessionId}`);
      websocketRef.current = ws;

      ws.onopen = async () => {
        console.log('✅ Real-time WebSocket connected');
        setSuccessMessage('🎙️ Real-time transcription active!');

        // Create audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        // Create media source from video element
        const source = audioContext.createMediaElementSource(video);

        // Create processor for capturing audio
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        // Connect nodes
        source.connect(processor);
        processor.connect(audioContext.destination);
        source.connect(audioContext.destination);  // Also play through speakers

        // Process audio chunks
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);

            // Convert Float32Array to Int16Array (PCM format for Deepgram)
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }

            // Send to backend
            ws.send(pcmData.buffer);
          }
        };
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'status') {
          setSuccessMessage(data.message);
        } else if (data.type === 'transcript') {
          // Real-time transcript!
          const transcriptData = data.data;

          if (transcriptData.is_final) {
            // Final transcript - add to list
            const newLine = {
              speaker: transcriptData.speaker,
              text: transcriptData.text
            };

            setTranscript(prev => [...prev, newLine]);
            console.log('✅ Real-time transcript:', transcriptData.text);
          } else {
            // Interim result - show as live preview
            setSuccessMessage(`🎙️ "${transcriptData.text}..."`);
          }
        } else if (data.type === 'action_items') {
          // Action items generated in real-time
          const items = data.data.map((item: any) =>
            `${item.text} ${item.assignee ? `(${item.assignee})` : ''} [${item.priority}]`
          );
          setActionItems(prev => [...prev, ...items]);
          console.log('🎯 Real-time action items:', items.length);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setError('Real-time connection error');
      };

      ws.onclose = () => {
        console.log('🔌 Real-time WebSocket closed');
        stopRealtimeVideoTranscription();
      };

    } catch (err) {
      console.error('❌ Real-time transcription error:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // NEW: Stop real-time video transcription
  const stopRealtimeVideoTranscription = () => {
    console.log('⏹️ Stopping real-time transcription');

    // Close WebSocket
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    // Clean up audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsProcessing(false);
    setSuccessMessage('✅ Real-time transcription stopped');
  };

  // Stream video audio to backend in real-time (just like recording)
  const streamVideoAudioToBackend = async (videoUrl: string) => {
    try {
      setSuccessMessage('🎬 Connecting to real-time transcription...');
      
      // Create hidden audio element from video
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const videoElement = videoRef.current;
      
      if (!videoElement) {
        setError('Video element not ready');
        return;
      }
      
      // Create media stream from video element
      const source = audioContext.createMediaElementSource(videoElement);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination); // Also play through speakers
      
      // Connect to WebSocket (same as recording)
      const sessionId = `video-stream-${Date.now()}`;
      sessionIdRef.current = sessionId;
      
      const ws = new WebSocket(`ws://localhost:8000/ws/meeting/${sessionId}`);
      websocketRef.current = ws;
      
      ws.onopen = () => {
        console.log('✅ Connected to real-time transcription');
        setIsRecording(true);
        setSuccessMessage('� Processing in real-time... Play the video!');
        
        // Set up MediaRecorder to stream audio chunks
        const mediaRecorder = new MediaRecorder(destination.stream, {
          mimeType: 'audio/webm;codecs=opus',
          audioBitsPerSecond: 128000,
        });
        
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            event.data.arrayBuffer().then(buffer => {
              ws.send(buffer);
            });
          }
        };
        
        mediaRecorder.start(1000); // Send chunks every second
        
        // Auto-play video
        videoElement.play().catch(err => console.error('Play error:', err));
      };
      
      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'transcript') {
          const transcriptData = data.data;
          const transcriptItem: TranscriptItem = {
            speaker: transcriptData.speaker || 'Speaker',
            text: transcriptData.text,
            emotions: transcriptData.emotions
          };
          
          setTranscript(prev => [...prev, transcriptItem]);
          
          // Generate action items every 3 lines
          const currentLength = transcript.length + 1;
          if (currentLength % 3 === 0) {
            setTimeout(() => {
              generateActionItems([...transcript, transcriptItem]);
            }, 100);
          }
        } else if (data.type === 'action_items') {
          const items = data.data.map((item: any) => 
            `${item.text} ${item.assignee ? `(${item.assignee})` : ''} [${item.priority}]`
          );
          setActionItems(prev => [...prev, ...items]);
        } else if (data.type === 'error') {
          setError(data.message);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
        setIsRecording(false);
      };
      
      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsRecording(false);
        audioContext.close();
      };
      
      // Stop when video ends
      videoElement.onended = () => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
        ws.close();
        setIsRecording(false);
        setSuccessMessage('✅ Video processing complete!');
      };
      
    } catch (err) {
      console.error('Streaming error:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsRecording(false);
    }
  };

  return (
    <PageContainer>
      <ControlCard>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <div style={{ flex: videoPreviewUrl ? '1' : '1', minWidth: '300px' }}>
            <h2>🎙️ Meeting Recorder - Session #{sessionNumber}</h2>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
            
            <StatusMessage>
              💡 Using browser speech recognition + Claude AI emotion analysis (quota-free!)
            </StatusMessage>
            
            <Timer>{formatDuration(duration)}</Timer>
            
            <ButtonGroup>
              <RecordButton 
                $isRecording={isRecording}
                onClick={handleStartStop}
              >
                {isRecording ? '⏹️ Stop' : '🎙️ Record'}
              </RecordButton>
              
              {isRecording && transcript.length > 0 && (
                <ClearButton 
                  onClick={clearSession}
                >
                  🔄 New
                </ClearButton>
              )}
            </ButtonGroup>
            
            <FileUpload>
              <label>📹 Upload Audio/Video File</label>
              <input 
                type="file" 
                id="file-upload"
                accept=".wav,.mp3,.m4a,.webm,.ogg,.mp4,.mov,.avi,.mkv,.flv"
                onChange={handleFileUpload}
                disabled={isRecording}
              />
              <div onClick={() => document.getElementById('file-upload')?.click()}>
                📤 Click to upload or drag & drop
              </div>
            </FileUpload>
            
            {isProcessing && (
              <ProcessingIndicator>
                ⏳ Processing with AssemblyAI transcription...
              </ProcessingIndicator>
            )}
          </div>
          
          {videoPreviewUrl && (
            <div style={{ flex: '1', minWidth: '400px' }}>
              <VideoPreviewContainer>
                <div className="preview-label">
                  <div className="label-text">
                    📹 Video Preview {isProcessing && '- Processing...'}
                  </div>
                  <button 
                    className="close-button"
                    onClick={removeVideoPreview}
                    title="Remove video preview"
                  >
                    ×
                  </button>
                </div>
                <video 
                  ref={videoRef}
                  src={videoPreviewUrl} 
                  controls
                  autoPlay
                />
              </VideoPreviewContainer>
            </div>
          )}
        </div>
      </ControlCard>
      
      {/* Real-time Insights Panel - Shows above the grid when there are insights */}
      {realtimeInsights.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto 2rem auto' }}>
          <RealtimeInsightsPanel>
            <h2>Claude AI Insights</h2>
            <InsightsContainer>
              {realtimeInsights.slice().reverse().map((insight, index) => (
                <InsightItem key={index}>
                  {insight}
                </InsightItem>
              ))}
            </InsightsContainer>
          </RealtimeInsightsPanel>
        </div>
      )}

      <Grid>
        <div>
          <TranscriptCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>📝 Session #{sessionNumber} Transcript</h2>
              {transcript.length > 0 && (
                <Button 
                  onClick={playTranscriptAudio}
                  variant={isPlayingAudio ? 'danger' : 'primary'}
                  size="small"
                >
                  {isPlayingAudio ? '⏸️ Stop Audio' : '🔊 Play Audio'}
                </Button>
              )}
            </div>
            
            <TranscriptContent>
              {transcript.length === 0 ? (
                <EmptyState>
                  <div className="icon">🎯</div>
                  <p>Ready to record your meeting</p>
                </EmptyState>
              ) : (
                transcript.map((line, index) => {
                  const isLiveTranscript = line.text.startsWith('[LIVE]');
                  const LineComponent = isLiveTranscript ? LiveTranscriptLine : TranscriptLine;
                  
                  return (
                    <LineComponent key={index}>
                      <div>
                        <Speaker>{line.speaker}:</Speaker>
                        {isLiveTranscript ? (
                          <span style={{ 
                            fontStyle: 'italic', 
                            color: '#03A0EF',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span style={{
                              background: 'linear-gradient(135deg, #03A0EF 0%, #0289D3 100%)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              color: 'white',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              LIVE
                            </span>
                            {line.text.replace('[LIVE] ', '')} 
                            <span style={{ 
                              animation: 'blink 1s infinite',
                              fontSize: '1.2rem'
                            }}>�️</span>
                          </span>
                        ) : (
                          <span style={{ 
                            color: '#1f0040',
                            fontWeight: '500',
                            lineHeight: '1.5'
                          }}>
                            {line.text}
                          </span>
                        )}
                      </div>
                      {line.emotions && !isLiveTranscript && (
                        <div>
                          <EmotionIndicator>
                            {line.emotions.happiness_level >= 70 ? '😊' : 
                             line.emotions.happiness_level >= 55 ? '🙂' :
                             line.emotions.happiness_level >= 40 ? '😐' : 
                             line.emotions.happiness_level >= 25 ? '🙁' : '😔'} 
                            {line.emotions.happiness_level}% • {line.emotions.sentiment}
                            <HappinessBar level={line.emotions.happiness_level} />
                          </EmotionIndicator>
                        </div>
                      )}
                    </LineComponent>
                  );
                })
              )}
            </TranscriptContent>
          </TranscriptCard>
        </div>
        
        <div>
          <ActionItemsCard>
            <h2>📋 Action Items</h2>
            <ActionItemsList>
              {actionItems.length === 0 ? (
                <EmptyState>
                  <div className="icon">📝</div>
                  <p>No action items yet</p>
                </EmptyState>
              ) : (
                actionItems.map((item, index) => (
                  <ActionItem key={index}>
                    <ActionItemText>{item}</ActionItemText>
                    <JiraButton onClick={() => addToJira(item, index)}>
                      📋 Add to Jira
                    </JiraButton>
                  </ActionItem>
                ))
              )}
            </ActionItemsList>
          </ActionItemsCard>
        </div>
      </Grid>
    </PageContainer>
  );
};

export default MeetingPage;