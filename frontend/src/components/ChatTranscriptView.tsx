import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  background: white;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f3f2f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c8c6c4;
    border-radius: 4px;

    &:hover {
      background: #a19f9d;
    }
  }
`;

const DateDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 24px 0 16px;
  text-align: center;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #e1dfdd;
  }

  span {
    padding: 0 16px;
    font-size: 12px;
    font-weight: 600;
    color: #8A8886;
  }
`;

const MessageGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  &:hover {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 8px;
    margin: -8px -8px 8px -8px;
  }
`;

const Avatar = styled.div<{ color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  text-transform: uppercase;
`;

const MessageContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
`;

const SpeakerName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #252423;
`;

const Timestamp = styled.span`
  font-size: 12px;
  color: #8A8886;
`;

const LiveBadge = styled.span`
  background: #C4314B;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

const MessageText = styled.div<{ isLive?: boolean }>`
  font-size: 14px;
  color: #252423;
  line-height: 1.5;
  word-wrap: break-word;
  font-style: ${props => props.isLive ? 'italic' : 'normal'};
  opacity: ${props => props.isLive ? '0.8' : '1'};
`;

const EmotionTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f3f2f1;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 12px;
  color: #605E5C;
  margin-top: 8px;
  font-weight: 500;
`;

const EmotionBar = styled.div<{ level: number }>`
  width: 40px;
  height: 6px;
  background: #e1dfdd;
  border-radius: 3px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.level}%;
    background: linear-gradient(to right,
      #C4314B 0%,
      #F59E0B 25%,
      #EAB308 50%,
      #84CC16 75%,
      #22C55E 100%
    );
    border-radius: 3px;
    transition: width 0.3s ease;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8A8886;
  text-align: center;
  padding: 48px 24px;

  .icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #605E5C;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: #8A8886;
    margin: 0;
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

interface ChatTranscriptViewProps {
  transcript: TranscriptItem[];
}

const getSpeakerColor = (speaker: string): string => {
  const colors = [
    '#5B5FC7', // Teams purple
    '#00897B', // Teal
    '#6264A7', // Blue-purple
    '#C239B3', // Magenta
    '#00B7C3', // Cyan
    '#8764B8', // Purple
  ];

  const index = speaker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const getSpeakerInitials = (speaker: string): string => {
  const words = speaker.trim().split(' ');
  if (words.length >= 2) {
    return words[0][0] + words[1][0];
  }
  return speaker.substring(0, 2);
};

const formatTime = (timestamp?: string): string => {
  if (!timestamp) {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const getEmotionEmoji = (level: number): string => {
  if (level >= 70) return '😊';
  if (level >= 55) return '🙂';
  if (level >= 40) return '😐';
  if (level >= 25) return '🙁';
  return '😔';
};

export const ChatTranscriptView: React.FC<ChatTranscriptViewProps> = ({ transcript }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  if (transcript.length === 0) {
    return (
      <ChatContainer>
        <EmptyState>
          <div className="icon">🎯</div>
          <h3>No messages yet</h3>
          <p>Start recording to see the meeting transcript appear here</p>
        </EmptyState>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <DateDivider>
        <span>Today</span>
      </DateDivider>

      {transcript.map((item, index) => {
        const isLive = item.text.startsWith('[LIVE]');
        const displayText = isLive ? item.text.replace('[LIVE] ', '').replace('...', '') : item.text;

        return (
          <MessageGroup key={index}>
            <Avatar color={getSpeakerColor(item.speaker)}>
              {getSpeakerInitials(item.speaker)}
            </Avatar>
            <MessageContent>
              <MessageHeader>
                <SpeakerName>{item.speaker}</SpeakerName>
                <Timestamp>{formatTime(item.timestamp)}</Timestamp>
                {isLive && <LiveBadge>● Live</LiveBadge>}
              </MessageHeader>
              <MessageText isLive={isLive}>
                {displayText}
              </MessageText>
              {item.emotions && !isLive && (
                <EmotionTag>
                  {getEmotionEmoji(item.emotions.happiness_level)}
                  {item.emotions.happiness_level}% • {item.emotions.sentiment}
                  <EmotionBar level={item.emotions.happiness_level} />
                </EmotionTag>
              )}
            </MessageContent>
          </MessageGroup>
        );
      })}
      <div ref={chatEndRef} />
    </ChatContainer>
  );
};
