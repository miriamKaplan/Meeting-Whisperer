import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { TeamsLayout } from '../components/layout/TeamsLayout';
import { TeamsTabNavigation } from '../components/TeamsTabNavigation';
import { ChatTranscriptView } from '../components/ChatTranscriptView';
import { AIAssistantSidebar } from '../components/AIAssistantSidebar';
import { ActionItemsTab } from '../components/ActionItemsTab';
import { QATab } from '../components/QATab';
import { AIInsightsTab } from '../components/AIInsightsTab';

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MainPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PreviewSection = styled.div`
  background: white;
  border-bottom: 1px solid #e1dfdd;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 600px;
`;

const PreviewBox = styled.div`
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

  video, audio {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  audio {
    width: 100%;
    height: 60px;
  }
`;

const EmptyPreview = styled.div`
  text-align: center;
  color: #8A8886;
  padding: 40px;

  .icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
`;

const TabContent = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ControlBar = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #e1dfdd;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RecordButton = styled.button<{ $isRecording: boolean }>`
  background: ${props => props.$isRecording ? '#C4314B' : '#5B5FC7'};
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 6px ${props => props.$isRecording ? 'rgba(196, 49, 75, 0.3)' : 'rgba(91, 95, 199, 0.3)'};

  &:hover {
    background: ${props => props.$isRecording ? '#A8284F' : '#4A4FB0'};
    box-shadow: 0 4px 12px ${props => props.$isRecording ? 'rgba(196, 49, 75, 0.4)' : 'rgba(91, 95, 199, 0.4)'};
  }

  &:active {
    transform: translateY(1px);
  }

  .dot {
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    animation: ${props => props.$isRecording ? 'pulse 2s infinite' : 'none'};
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`;

const SecondaryButton = styled.button`
  background: white;
  color: #5B5FC7;
  border: 1px solid #e1dfdd;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #5B5FC7;
    background: #f3f2f1;
  }

  &:active {
    background: #e1dfdd;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Timer = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #252423;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  padding: 8px 16px;
  background: #f3f2f1;
  border-radius: 6px;
`;

const FileUploadButton = styled.label`
  background: white;
  color: #605E5C;
  border: 1px solid #e1dfdd;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    border-color: #5B5FC7;
    color: #5B5FC7;
    background: #f3f2f1;
  }

  input {
    display: none;
  }
`;

const FileDisplay = styled.div`
  background: white;
  border: 1px solid #e1dfdd;
  padding: 10px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #252423;
`;

const FileName = styled.span`
  flex: 1;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileSize = styled.span`
  font-size: 12px;
  color: #8A8886;
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: #C4314B;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #FDE7E9;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #605E5C;
  cursor: pointer;
  font-size: 18px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  img {
    background: transparent;
    mix-blend-mode: multiply;
    border-radius: 50%;
  }

  &:hover {
    background: #f3f2f1;
    color: #5B5FC7;
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
  timestamp?: string;
}

const MeetingPageTeams: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState('chat');
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [realtimeInsights, setRealtimeInsights] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showRecordingBanner, setShowRecordingBanner] = useState(false);
  const [agentData, setAgentData] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('paul'); // Can be changed to user's actual ID

  // Refs
  const timerRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording function
  const startRecording = async () => {
    try {
      setShowRecordingBanner(true);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Browser speech recognition not supported. Please use Chrome or Safari.');
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      speechRecognitionRef.current = recognition;
      sessionIdRef.current = `session_${Date.now()}`;

      recognition.onresult = async (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Show interim results in real-time
        if (interimTranscript) {
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
          setTranscript(prev => prev.filter(item => !item.text.startsWith('[LIVE]')));

          try {
            const response = await fetch('http://localhost:8000/api/analyze-emotion', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: finalTranscript,
                speaker: 'You',
                recent_transcript: transcript.slice(-5).map(item => ({
                  speaker: item.speaker,
                  text: item.text,
                  timestamp: new Date().toISOString()
                }))
              })
            });

            const emotionData = await response.json();

            // Handle real-time insights from Claude
            if (emotionData.realtime_insights && emotionData.realtime_insights.length > 0) {
              console.log('🤖 Real-time insights received:', emotionData.realtime_insights);
              setRealtimeInsights(prev => [...prev, ...emotionData.realtime_insights]);
            }

            const newTranscriptItem = {
              speaker: 'You',
              text: finalTranscript,
              timestamp: new Date().toISOString(),
              emotions: emotionData
            };

            setTranscript(prev => {
              const updated = [...prev, newTranscriptItem];

              // Generate action items every 3 lines
              if (updated.length % 3 === 0) {
                generateActionItems(updated);
              }

              // Check for personalized context
              checkPersonalizedContext(finalTranscript, updated);

              return updated;
            });

          } catch (err) {
            console.error('Emotion analysis failed:', err);
            const newTranscriptItem = {
              speaker: 'You',
              text: finalTranscript,
              timestamp: new Date().toISOString()
            };

            setTranscript(prev => {
              const updated = [...prev, newTranscriptItem];
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
      };

      recognition.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Error starting recording:', err);
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsRecording(false);
  };

  // Generate action items
  const generateActionItems = async (currentTranscript: TranscriptItem[]) => {
    try {
      const transcriptData = currentTranscript.map(item => ({
        speaker: item.speaker,
        text: item.text,
        timestamp: new Date().toISOString()
      }));

      const existingActionItems = actionItems.map(item => {
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

      if (result.action_items && result.action_items.length > 0) {
        const newActionItems = result.action_items.map((item: any) =>
          `${item.text} ${item.assignee ? `(${item.assignee})` : ''} [${item.priority}]`
        );
        setActionItems(newActionItems);
      }

    } catch (err) {
      console.error('Action item generation failed:', err);
    }
  };

  // Add to Jira handler
  const handleAddToJira = async (actionItem: string, index: number) => {
    try {
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

      const response = await fetch('http://localhost:8000/api/create-jira-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_item: itemData })
      });

      const result = await response.json();

      if (result.success) {
        const ticketInfo = result.demo_mode ?
          `🎯 DEMO: Jira Ticket Created!\n\nTicket: ${result.ticket_key}\nSummary: ${result.summary}\n\nNote: This is a demo.` :
          `✅ Jira Ticket Created Successfully!\n\nTicket: ${result.ticket_key}\nURL: ${result.ticket_url}`;

        const shouldOpen = confirm(ticketInfo);

        if (shouldOpen && result.ticket_url && !result.demo_mode) {
          window.open(result.ticket_url, '_blank');
        }

        setActionItems(prev =>
          prev.map((item, i) => i === index ? `${item} ✅` : item)
        );
      } else {
        alert(`❌ Failed to create Jira ticket: ${result.error}`);
      }

    } catch (err) {
      console.error('Jira integration failed:', err);
      alert('❌ Jira integration failed. Check console for details.');
    }
  };

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const audioTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/m4a'];
    const videoTypes = ['video/mp4', 'video/quicktime'];
    const allValidTypes = [...audioTypes, ...videoTypes];

    if (!allValidTypes.includes(file.type) && !file.name.match(/\.(wav|mp3|m4a|mp4|mov)$/i)) {
      alert('❌ Invalid file type. Please upload audio (WAV, MP3, M4A) or video (MP4, MOV) files.');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);

    // Store the uploaded file
    setUploadedFile(file);
    console.log('File uploaded:', file.name);

    // Reset input
    event.target.value = '';

    // Process file with agents
    await processFileWithAgents(file);
  };

  // Process file with all agents - REAL-TIME STREAMING
  const processFileWithAgents = async (file: File) => {
    try {
      console.log('🎬 Starting REAL-TIME file processing for:', file.name);
      alert('🎬 Starting video processing - watch console for updates!');

      // Clear previous data
      setTranscript([]);
      setActionItems([]);
      setRealtimeInsights([]);

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);

      // Use streaming endpoint for real-time updates
      console.log('📤 Connecting to streaming endpoint...');
      const response = await fetch('http://localhost:8000/api/process-media-stream', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Connected to stream, receiving real-time updates...');
      console.log('Response headers:', response.headers);
      console.log('Response body:', response.body);

      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        console.error('❌ No reader available from response.body');
        throw new Error('No reader available');
      }

      let buffer = '';
      let chunkCount = 0;

      try {
        while (true) {
          console.log(`📦 Reading chunk ${++chunkCount}...`);
          const { done, value } = await reader.read();

          if (done) {
            console.log('✅ Stream completed, total chunks:', chunkCount);
            break;
          }

          // Decode the chunk
          const chunkText = decoder.decode(value, { stream: true });
          console.log(`📦 Chunk ${chunkCount} raw data (${chunkText.length} chars):`, chunkText.substring(0, 200));
          buffer += chunkText;

          // Process complete SSE messages
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          console.log(`📄 Processing ${lines.length} lines from buffer`);

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6); // Remove 'data: ' prefix
              console.log('🔍 Parsing SSE data:', data);

              try {
                const event = JSON.parse(data);
                console.log('📥 Stream event:', event.type, event);

                switch (event.type) {
                  case 'status':
                    console.log('ℹ️ Status:', event.message);
                    break;

                  case 'transcript':
                    // Add transcript line in real-time
                    const newLine = event.line;
                    console.log('📝 New transcript line:', newLine);
                    setTranscript(prev => {
                      const updated = [...prev, {
                        speaker: newLine.speaker,
                        text: newLine.text,
                        timestamp: newLine.timestamp,
                        emotions: newLine.emotion ? {
                          sentiment: 'neutral',
                          confidence: newLine.emotion_score || 0.5,
                          happiness_level: 50,
                          key_emotions: [newLine.emotion],
                          mood_summary: newLine.emotion
                        } : undefined
                      }];
                      console.log('✅ Transcript updated, now has', updated.length, 'items');
                      return updated;
                    });
                    break;

                  case 'action_items':
                    // Update action items in real-time
                    console.log('📋 Updating action items:', event.items);
                    const items = event.items.map((item: any) =>
                      `${item.text} ${item.assignee ? `(${item.assignee})` : ''} [${item.priority || 'medium'}]`
                    );
                    setActionItems(items);
                    console.log('✅ Action items updated, now has', items.length, 'items');
                    break;

                  case 'complete':
                    console.log('✅ Processing complete:', event.message);
                    break;

                  case 'error':
                    console.error('❌ Stream error:', event.message);
                    alert(`Error: ${event.message}`);
                    break;
                }
              } catch (e) {
                console.error('❌ Error parsing stream data:', e, 'Data was:', data);
              }
            } else if (line.trim()) {
              console.log('⚠️ Non-SSE line:', line);
            }
          }
        }
      } catch (streamError) {
        console.error('❌ Stream reading error:', streamError);
        throw streamError;
      }

    } catch (error) {
      console.error('❌ File processing error:', error);
      alert(`Error processing file: ${error}`);
    }
  };

  // Check for personalized context
  const checkPersonalizedContext = async (newText: string, currentTranscript: TranscriptItem[]) => {
    try {
      const recentTranscript = currentTranscript.slice(-10).map(item => ({
        speaker: item.speaker,
        text: item.text,
        timestamp: item.timestamp || new Date().toISOString()
      }));

      const response = await fetch('http://localhost:8000/api/personalized-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          text: newText,
          recent_transcript: recentTranscript
        })
      });

      const result = await response.json();

      if (result.display_message && result.display_message.trim()) {
        setAgentData(result.display_message);
      }

    } catch (err) {
      console.error('Personalized context error:', err);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setUploadedFile(null);
    setFilePreviewUrl(null);
  };

  // Clear session
  const clearSession = () => {
    if (isRecording) {
      return;
    }

    setTranscript([]);
    setActionItems([]);
    setRealtimeInsights([]);
    setDuration(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const tabs = [
    { id: 'chat', label: 'Chat', badge: transcript.length },
    { id: 'insights', label: 'AI Insights', badge: realtimeInsights.length },
    { id: 'actions', label: 'Action Items', badge: actionItems.length },
    { id: 'qa', label: 'Q&A' }
  ];

  return (
    <TeamsLayout
      meetingTitle="Meeting Whisperer - Cross River Rabbit"
      isRecording={isRecording}
      showRecordingBanner={showRecordingBanner}
      onBack={() => window.history.back()}
      onJoin={() => console.log('Join clicked')}
      onSaveRecording={() => setShowRecordingBanner(false)}
    >
      <ContentArea>
        <MainPanel>
          <ControlBar>
            <ControlGroup>
              <RecordButton
                $isRecording={isRecording}
                onClick={isRecording ? stopRecording : startRecording}
              >
                <span className="dot"></span>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </RecordButton>

              <Timer>{formatDuration(duration)}</Timer>

              <SecondaryButton onClick={clearSession} disabled={isRecording}>
                Clear Session
              </SecondaryButton>

              {!uploadedFile ? (
                <FileUploadButton>
                  📎 Upload File
                  <input
                    type="file"
                    accept=".wav,.mp3,.m4a,.mp4,.mov"
                    onChange={handleFileUpload}
                    disabled={isRecording}
                  />
                </FileUploadButton>
              ) : (
                <FileDisplay>
                  <span>📄</span>
                  <FileName>{uploadedFile.name}</FileName>
                  <FileSize>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</FileSize>
                  <RemoveFileButton onClick={handleRemoveFile} title="Remove file">
                    ×
                  </RemoveFileButton>
                </FileDisplay>
              )}
            </ControlGroup>

            <ControlGroup>
              <IconButton
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title="Toggle Cross River Rabbit"
              >
                <img src="/assets/rabbit-logo.png" alt="Cross River Rabbit" style={{ width: '20px', height: '20px' }} />
              </IconButton>
            </ControlGroup>
          </ControlBar>

          <PreviewSection>
            {uploadedFile && filePreviewUrl ? (
              <PreviewBox>
                {uploadedFile.type.startsWith('video/') || uploadedFile.name.match(/\.(mp4|mov)$/i) ? (
                  <video src={filePreviewUrl} controls autoPlay />
                ) : (
                  <audio src={filePreviewUrl} controls autoPlay />
                )}
              </PreviewBox>
            ) : (
              <EmptyPreview>
                <div className="icon">🎬</div>
                <p>Upload a file to preview it here</p>
              </EmptyPreview>
            )}
          </PreviewSection>

          <TeamsTabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <TabContent>
            {activeTab === 'chat' && (
              <ChatTranscriptView transcript={transcript} />
            )}
            {activeTab === 'insights' && (
              <AIInsightsTab
                insights={realtimeInsights}
                onRefresh={() => console.log('Refresh insights')}
              />
            )}
            {activeTab === 'actions' && (
              <ActionItemsTab
                actionItems={actionItems}
                onAddToJira={handleAddToJira}
                onGenerateItems={() => generateActionItems(transcript)}
              />
            )}
            {activeTab === 'qa' && (
              <QATab transcript={transcript} />
            )}
          </TabContent>
        </MainPanel>

        <AIAssistantSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          insights={realtimeInsights}
          agentData={agentData}
        />
      </ContentArea>
    </TeamsLayout>
  );
};

export default MeetingPageTeams;
