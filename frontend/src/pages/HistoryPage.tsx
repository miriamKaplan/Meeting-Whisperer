import styled from 'styled-components';
import { Card } from '../components/Card';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: ${props => props.theme.fonts.size['3xl']};
  margin-bottom: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.primary};
`;

const EmptyState = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.tertiary};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
`;

export const HistoryPage = () => {
  return (
    <PageContainer>
      <Title>Meeting History</Title>
      <EmptyState>
        <EmptyIcon>📚</EmptyIcon>
        <div style={{ fontSize: '1.2rem' }}>
          No meetings recorded yet
        </div>
        <div>
          Start your first meeting to see history here
        </div>
      </EmptyState>
    </PageContainer>
  );
};
