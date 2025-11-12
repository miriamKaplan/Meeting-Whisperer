import React from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div<{ $isOpen: boolean }>`
  width: ${props => props.$isOpen ? '360px' : '0'};
  background: white;
  border-left: 1px solid #e1dfdd;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e1dfdd;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #252423;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Subtitle = styled.p`
  font-size: 12px;
  color: #605E5C;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #605E5C;
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  width: 28px;
  height: 28px;

  &:hover {
    background: #f3f2f1;
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;

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

const AssistantIcon = styled.div`
  width: 140px;
  height: 140px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: 50%;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: transparent;
    filter: drop-shadow(0 4px 16px rgba(91, 95, 199, 0.2));
    mix-blend-mode: multiply;
  }
`;

const WelcomeText = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const WelcomeTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #252423;
  margin: 0 0 8px 0;
`;

const WelcomeSubtitle = styled.p`
  font-size: 14px;
  color: #605E5C;
  margin: 0 0 4px 0;
`;

const OnlyForYouText = styled.p`
  font-size: 12px;
  color: #8A8886;
  margin: 0;
`;

const AgentDataBox = styled.div`
  margin: 0 20px 20px 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border: 1px solid #bae6fd;
  border-radius: 8px;
  min-height: 100px;
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #5B5FC7;
    border-radius: 3px;
  }
`;

const DataLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #5B5FC7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DataContent = styled.div`
  font-size: 14px;
  color: #252423;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const EmptyDataState = styled.div`
  text-align: center;
  color: #8A8886;
  font-size: 13px;
  padding: 20px;
  font-style: italic;
`;

const InsightsSection = styled.div`
  margin-top: 24px;
`;

const SectionTitle = styled.h4`
  font-size: 13px;
  font-weight: 600;
  color: #252423;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InsightCard = styled.div`
  background: #f3f2f1;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #252423;
  line-height: 1.5;
  border-left: 3px solid #5B5FC7;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &:hover {
    background: #edebe9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #8A8886;
  padding: 24px;
  font-size: 14px;
`;


interface AIAssistantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  insights: string[];
  agentData?: string;
}

export const AIAssistantSidebar: React.FC<AIAssistantSidebarProps> = ({
  isOpen,
  onClose,
  insights,
  agentData
}) => {
  return (
    <SidebarContainer $isOpen={isOpen}>
      <SidebarHeader>
        <SidebarTitle>
          <Title>
            <img
              src="/assets/rabbit-logo.png"
              alt="Cross River Rabbit"
              style={{ width: '24px', height: '24px', objectFit: 'contain', mixBlendMode: 'multiply', borderRadius: '50%' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.insertAdjacentHTML('afterend', '<span style="font-size: 20px;">🐰</span>');
              }}
            />
            Cross River Rabbit
          </Title>
          <Subtitle>It's just for you</Subtitle>
        </SidebarTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </SidebarHeader>

      <SidebarContent>
        <AssistantIcon>
          <img
            src="/assets/rabbit-logo.png"
            alt="Cross River Rabbit"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<div style="font-size: 60px; text-align: center;">🐰</div>';
            }}
          />
        </AssistantIcon>

        <WelcomeText>
          <WelcomeTitle>Cross River Rabbit</WelcomeTitle>
          <WelcomeSubtitle>AI-Powered Meeting Intelligence</WelcomeSubtitle>
          <OnlyForYouText>Only you can see this conversation</OnlyForYouText>
        </WelcomeText>

        <AgentDataBox>
          <DataLabel>
            <span>🐰</span>
            Rabbit Assistant Information
          </DataLabel>
          {agentData ? (
            <DataContent>{agentData}</DataContent>
          ) : (
            <EmptyDataState>
              No information available yet
            </EmptyDataState>
          )}
        </AgentDataBox>

        {insights.length > 0 ? (
          <InsightsSection>
            <SectionTitle>Live Insights</SectionTitle>
            {insights.slice().reverse().map((insight, index) => (
              <InsightCard key={index}>
                {insight}
              </InsightCard>
            ))}
          </InsightsSection>
        ) : (
          <EmptyState>
            Start recording to see AI-powered insights about your meeting in real-time.
          </EmptyState>
        )}
      </SidebarContent>
    </SidebarContainer>
  );
};
