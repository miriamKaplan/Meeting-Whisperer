import styled from 'styled-components';
import { useLocation } from 'react-router-dom';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: ${props => props.theme.size.sideNavBarWidth};
  right: 0;
  height: ${props => props.theme.size.siteHeaderHeight};
  background-color: ${props => props.theme.colors.background.primary};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  z-index: ${props => props.theme.zIndex.sticky};
  display: flex;
  align-items: center;
  padding: 0 ${props => props.theme.spacing.xl};
  transition: ${props => props.theme.transition};

  @media (max-width: ${props => props.theme.breakPoints.tablet}px) {
    left: 0;
    padding: 0 ${props => props.theme.spacing.md};
  }
`;

const PageTitle = styled.h1`
  font-size: ${props => props.theme.fonts.size['2xl']};
  font-weight: ${props => props.theme.fonts.weight.semiBold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const PageIcon = styled.div`
  font-size: ${props => props.theme.fonts.size['2xl']};
  margin-right: ${props => props.theme.spacing.md};
`;

const LeftSide = styled.div`
  display: flex;
  align-items: center;
`;

const RightSide = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const StatusIndicator = styled.div<{ $isRecording?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props => 
    props.$isRecording 
      ? props.theme.colors.error[50] 
      : props.theme.colors.neutral[100]};
  color: ${props => 
    props.$isRecording 
      ? props.theme.colors.error[600] 
      : props.theme.colors.text.secondary};
  font-size: ${props => props.theme.fonts.size.sm};
  font-weight: ${props => props.theme.fonts.weight.medium};
`;

const StatusDot = styled.div<{ $isRecording?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => 
    props.$isRecording 
      ? props.theme.colors.error[500] 
      : props.theme.colors.neutral[400]};
  
  ${props => props.$isRecording && `
    animation: pulse 2s ease-in-out infinite;
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `}
`;

const getPageInfo = (pathname: string) => {
  switch (pathname) {
    case '/meeting':
      return { title: 'Meeting', icon: '🎙️' };
    case '/history':
      return { title: 'History', icon: '📚' };
    case '/settings':
      return { title: 'Settings', icon: '⚙️' };
    default:
      return { title: 'Meeting Whisperer', icon: '✨' };
  }
};

export const SiteHeader = () => {
  const location = useLocation();
  const pageInfo = getPageInfo(location.pathname);
  const isRecording = false; // TODO: Connect to meeting state

  return (
    <HeaderContainer>
      <LeftSide>
        <PageIcon>{pageInfo.icon}</PageIcon>
        <PageTitle>{pageInfo.title}</PageTitle>
      </LeftSide>
      <RightSide>
        <StatusIndicator $isRecording={isRecording}>
          <StatusDot $isRecording={isRecording} />
          {isRecording ? 'Recording' : 'Idle'}
        </StatusIndicator>
      </RightSide>
    </HeaderContainer>
  );
};
