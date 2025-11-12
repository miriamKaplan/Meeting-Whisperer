import React, { ReactNode } from 'react';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f3f2f1;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e1dfdd;
  padding: 0 24px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 100;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #616161;
  cursor: pointer;
  font-size: 20px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  border-radius: 4px;

  &:hover {
    background: #f3f2f1;
  }
`;

const MeetingTitle = styled.h1`
  font-size: 16px;
  font-weight: 600;
  color: #252423;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const JoinButton = styled.button`
  background: #5B5FC7;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #4A4FB0;
  }

  &:active {
    background: #3A3F9A;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #616161;
  cursor: pointer;
  font-size: 18px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  width: 32px;
  height: 32px;

  &:hover {
    background: #f3f2f1;
  }
`;

const RecordingBanner = styled.div<{ isRecording: boolean; isVisible: boolean }>`
  background: ${props => props.isRecording ? '#C4314B' : '#F3F2F1'};
  color: ${props => props.isRecording ? 'white' : '#252423'};
  padding: 12px 24px;
  display: ${props => props.isVisible ? 'flex' : 'none'};
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e1dfdd;
  font-size: 13px;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const RecordingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .recording-dot {
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }
`;

const SaveButton = styled.button`
  background: white;
  color: #C4314B;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const CenterPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
`;

interface TeamsLayoutProps {
  children: ReactNode;
  meetingTitle?: string;
  isRecording?: boolean;
  showRecordingBanner?: boolean;
  onBack?: () => void;
  onJoin?: () => void;
  onSaveRecording?: () => void;
}

export const TeamsLayout: React.FC<TeamsLayoutProps> = ({
  children,
  meetingTitle = 'Meeting Whisperer',
  isRecording = false,
  showRecordingBanner = false,
  onBack,
  onJoin,
  onSaveRecording
}) => {
  return (
    <LayoutContainer>
      <Header>
        <HeaderLeft>
          <BackButton onClick={onBack}>
            ←
          </BackButton>
          <MeetingTitle>
            <span>📋</span>
            {meetingTitle}
          </MeetingTitle>
        </HeaderLeft>
        <HeaderRight>
          <IconButton title="Search">🔍</IconButton>
          <JoinButton onClick={onJoin}>Join</JoinButton>
          <IconButton title="More options">⋯</IconButton>
          <IconButton title="Help">❓</IconButton>
        </HeaderRight>
      </Header>

      <RecordingBanner isRecording={isRecording} isVisible={showRecordingBanner}>
        <RecordingInfo>
          {isRecording && <span className="recording-dot"></span>}
          <span>
            {isRecording
              ? '🔴 Recording in progress...'
              : '⏹️ Recording has stopped. Saving recording...'
            }
          </span>
        </RecordingInfo>
        {!isRecording && (
          <SaveButton onClick={onSaveRecording}>Save recording</SaveButton>
        )}
      </RecordingBanner>

      <MainContent>
        <CenterPanel>
          {children}
        </CenterPanel>
      </MainContent>
    </LayoutContainer>
  );
};
