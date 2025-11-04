import styled from 'styled-components';
import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakPoints.desktop}px) {
    grid-template-columns: 1fr;
  }
`;

const ControlCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: ${props => props.theme.spacing.lg};
`;

const RecordButton = styled(Button)<{ $isRecording?: boolean }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  font-size: ${props => props.theme.fonts.size['2xl']};
  
  ${props => props.$isRecording && `
    animation: recordPulse 2s ease-in-out infinite;
    
    @keyframes recordPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `}
`;

const Timer = styled.div`
  font-size: ${props => props.theme.fonts.size['3xl']};
  font-weight: ${props => props.theme.fonts.weight.bold};
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.family.mono};
`;

const TranscriptCard = styled(Card)`
  min-height: 400px;
  display: flex;
  flex-direction: column;
`;

const TranscriptTitle = styled.h3`
  font-size: ${props => props.theme.fonts.size.xl};
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.primary};
`;

const TranscriptContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-family: ${props => props.theme.fonts.family.primary};
  line-height: 1.6;
`;

const TranscriptLine = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm};
  border-left: 3px solid ${props => props.theme.colors.primary[300]};
  padding-left: ${props => props.theme.spacing.md};
`;

const Speaker = styled.span`
  font-weight: ${props => props.theme.fonts.weight.semiBold};
  color: ${props => props.theme.colors.primary[400]};
  margin-right: ${props => props.theme.spacing.sm};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.colors.text.tertiary};
  gap: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.fonts.size.lg};
`;

const ActionItemsCard = styled(Card)`
  min-height: 400px;
  display: flex;
  flex-direction: column;
`;

const ActionItemsList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const ActionItem = styled.div`
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.success[50]};
  border-left: 4px solid ${props => props.theme.colors.success[500]};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const ActionItemText = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.fonts.size.base};
`;

const ActionItemMeta = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.fonts.size.sm};
  color: ${props => props.theme.colors.text.tertiary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

export const MeetingPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string }>>([]);
  const [actionItems, setActionItems] = useState<Array<{ text: string; assignee?: string }>>([]);
  const [error, setError] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<string>('');

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
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
      
      // Request microphone access
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      console.log('Microphone access granted!');

      // Generate session ID
      sessionIdRef.current = `session_${Date.now()}`;
      
      // Connect to WebSocket
      const wsUrl = `ws://localhost:8000/ws/meeting/${sessionIdRef.current}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data);
          
          if (data.type === 'transcript') {
            setTranscript(prev => [...prev, {
              speaker: data.data.speaker,
              text: data.data.text
            }]);
          } else if (data.type === 'action_items') {
            setActionItems(prev => [...prev, ...data.data]);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Check if backend is running on port 8000.');
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
      };

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          // Send audio chunk to backend
          ws.send(event.data);
          console.log(`Sent audio chunk: ${event.data.size} bytes`);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred');
      };

      // Start recording (send chunks every 1 second)
      mediaRecorder.start(1000);
      console.log('🎙️ Recording started');

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      setIsRecording(true);
      
    } catch (err: any) {
      console.error('Error starting recording:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    
    // Stop MediaRecorder
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
    console.log('✅ Recording stopped');
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

    // Validate file type
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/webm', 'audio/ogg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(wav|mp3|m4a|webm|ogg)$/i)) {
      setError('Please upload a valid audio file (WAV, MP3, M4A, WebM, or OGG)');
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setIsRecording(true);
    setDuration(0);
    setTranscript([]);
    setActionItems([]);
    setError('');

    try {
      // Generate session ID
      const sessionId = Date.now().toString();
      
      // Connect to WebSocket
      const ws = new WebSocket(`ws://localhost:8000/ws/meeting/${sessionId}`);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected for file upload');
        
        // Read file and send in chunks
        const reader = new FileReader();
        reader.onload = async (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const blob = new Blob([arrayBuffer], { type: file.type });
          
          // Send the entire file as a single chunk
          ws.send(blob);
          
          // Start a timer to simulate processing
          timerRef.current = setInterval(() => {
            setDuration(prev => prev + 1);
          }, 1000);
        };
        
        reader.onerror = () => {
          setError('Failed to read audio file');
          setIsRecording(false);
        };
        
        reader.readAsArrayBuffer(file);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'transcript') {
          setTranscript(prev => [...prev, {
            speaker: data.speaker,
            text: data.text
          }]);
        } else if (data.type === 'action_item') {
          setActionItems(prev => [...prev, {
            text: data.text,
            assignee: data.assignee
          }]);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Failed to connect to server');
        setIsRecording(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to process audio file');
      setIsRecording(false);
    }
  };

  return (
    <PageContainer>
      {error && (
        <div style={{ 
          padding: '16px', 
          marginBottom: '24px', 
          backgroundColor: '#FEF2F2', 
          border: '1px solid #CC1F4E',
          borderRadius: '8px',
          color: '#CC1F4E'
        }}>
          ⚠️ {error}
        </div>
      )}

      {!isRecording && (
        <div style={{ 
          padding: '16px', 
          marginBottom: '24px', 
          backgroundColor: '#E7F4FA', 
          border: '1px solid #03A0EF',
          borderRadius: '8px',
          color: '#0A5387'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <strong>💡 No microphone?</strong> Upload a pre-recorded audio file to transcribe!
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="file"
              accept="audio/*,.wav,.mp3,.m4a,.webm,.ogg"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="audio-upload"
            />
            <Button 
              variant="outline" 
              size="medium"
              onClick={() => document.getElementById('audio-upload')?.click()}
            >
              📁 Upload Audio File
            </Button>
            <span style={{ color: '#898A92', fontSize: '0.875rem' }}>
              Supported: WAV, MP3, M4A, WebM, OGG (max 50MB)
            </span>
          </div>
        </div>
      )}
      
      <Grid>
        <ControlCard>
          <RecordButton
            variant={isRecording ? 'danger' : 'primary'}
            onClick={handleStartStop}
            $isRecording={isRecording}
            disabled={isRecording}
          >
            {isRecording ? '⏹️' : '🎙️'}
          </RecordButton>
          <Timer>{formatTime(duration)}</Timer>
          {isRecording ? (
            <div style={{ fontSize: '1.2rem', color: '#CC1F4E' }}>
              🔴 Processing audio...
            </div>
          ) : (
            <div style={{ fontSize: '1rem', color: '#898A92' }}>
              Click the microphone to start live recording<br/>
              or upload a pre-recorded audio file above
            </div>
          )}
        </ControlCard>

        <ActionItemsCard>
          <TranscriptTitle>⚡ Action Items</TranscriptTitle>
          <ActionItemsList>
            {actionItems.length === 0 ? (
              <EmptyState>
                <div>📋</div>
                <div>Action items will appear here</div>
              </EmptyState>
            ) : (
              actionItems.map((item, index) => (
                <ActionItem key={index}>
                  <ActionItemText>{item.text}</ActionItemText>
                  {item.assignee && (
                    <ActionItemMeta>
                      <span>👤 {item.assignee}</span>
                    </ActionItemMeta>
                  )}
                </ActionItem>
              ))
            )}
          </ActionItemsList>
          {actionItems.length > 0 && (
            <ButtonGroup>
              <Button variant="primary" size="medium">
                Create Jira Tasks
              </Button>
              <Button variant="outline" size="medium">
                Export
              </Button>
            </ButtonGroup>
          )}
        </ActionItemsCard>
      </Grid>

      <div style={{ marginTop: '24px' }}>
        <TranscriptCard>
          <TranscriptTitle>📝 Live Transcript</TranscriptTitle>
          <TranscriptContent>
            {transcript.length === 0 ? (
              <EmptyState>
                <div>🎤</div>
                <div>Start recording to see live transcription</div>
              </EmptyState>
            ) : (
              transcript.map((line, index) => (
                <TranscriptLine key={index}>
                  <Speaker>{line.speaker}:</Speaker>
                  {line.text}
                </TranscriptLine>
              ))
            )}
          </TranscriptContent>
        </TranscriptCard>
      </div>
    </PageContainer>
  );
};
