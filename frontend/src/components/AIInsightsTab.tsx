import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #faf9f8;

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

const Header = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #252423;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    width: 28px;
    height: 28px;
    object-fit: contain;
    background: transparent;
    mix-blend-mode: multiply;
    border-radius: 50%;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #605E5C;
  margin: 0;
`;

const InsightCard = styled.div`
  background: white;
  border-radius: 8px;
  border-left: 4px solid #5B5FC7;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  animation: slideIn 0.3s ease-out;
  transition: all 0.2s;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(91, 95, 199, 0.2);
    transform: translateY(-2px);
  }
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const InsightType = styled.span<{ type: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => {
    switch (props.type) {
      case 'suggestion':
        return `
          background: #E8F5E9;
          color: #2E7D32;
        `;
      case 'warning':
        return `
          background: #FFF4E5;
          color: #F59E0B;
        `;
      case 'info':
        return `
          background: #E3F2FD;
          color: #1976D2;
        `;
      default:
        return `
          background: #F3F2F1;
          color: #605E5C;
        `;
    }
  }}
`;

const Timestamp = styled.span`
  font-size: 12px;
  color: #8A8886;
`;

const InsightText = styled.div`
  font-size: 14px;
  color: #252423;
  line-height: 1.6;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #8A8886;
  text-align: center;
  background: white;
  border-radius: 8px;
  border: 2px dashed #e1dfdd;

  .icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;

    img {
      background: transparent;
      mix-blend-mode: multiply;
      border-radius: 50%;
    }
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
    max-width: 400px;
  }
`;

const RefreshButton = styled.button`
  background: #5B5FC7;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: background 0.2s;

  &:hover {
    background: #4A4FB0;
  }

  &:active {
    background: #3A3F9A;
  }
`;

const SummaryCard = styled.div`
  background: linear-gradient(135deg, #5B5FC7 0%, #7B7FE7 100%);
  color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(91, 95, 199, 0.3);
`;

const SummaryTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SummaryText = styled.p`
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  opacity: 0.95;
`;

interface AIInsightsTabProps {
  insights: string[];
  onRefresh?: () => void;
}

const categorizeInsight = (insight: string): string => {
  const lower = insight.toLowerCase();
  if (lower.includes('suggest') || lower.includes('recommend') || lower.includes('should')) {
    return 'suggestion';
  }
  if (lower.includes('warning') || lower.includes('concern') || lower.includes('issue')) {
    return 'warning';
  }
  return 'info';
};

const formatTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export const AIInsightsTab: React.FC<AIInsightsTabProps> = ({ insights, onRefresh }) => {
  if (insights.length === 0) {
    return (
      <Container>
        <EmptyState>
          <div className="icon">
            <img src="/assets/rabbit-logo.png" alt="AI Assistant" style={{ width: '80px', height: '80px', opacity: 0.5 }} />
          </div>
          <h3>No AI insights yet</h3>
          <p>
            Start recording to receive real-time AI-powered insights and analysis about your meeting
          </p>
          {onRefresh && (
            <RefreshButton onClick={onRefresh}>
              Generate Insights
            </RefreshButton>
          )}
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <img src="/assets/rabbit-logo.png" alt="AI Assistant" />
          AI-Powered Insights
        </Title>
        <Subtitle>
          Real-time analysis powered by Claude AI • {insights.length} insights generated
        </Subtitle>
      </Header>

      <SummaryCard>
        <SummaryTitle>
          <span>✨</span>
          Meeting Summary
        </SummaryTitle>
        <SummaryText>
          Your meeting is being analyzed in real-time. The AI assistant is tracking key discussion
          points, sentiment, and generating actionable insights as the conversation progresses.
        </SummaryText>
      </SummaryCard>

      {insights.slice().reverse().map((insight, index) => {
        const type = categorizeInsight(insight);
        return (
          <InsightCard key={index}>
            <InsightHeader>
              <InsightType type={type}>{type}</InsightType>
              <Timestamp>{formatTime()}</Timestamp>
            </InsightHeader>
            <InsightText>{insight}</InsightText>
          </InsightCard>
        );
      })}
    </Container>
  );
};
