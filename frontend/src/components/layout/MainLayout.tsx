import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { SiteHeader } from './SiteHeader';
import { SideNavBar } from './SideNavBar';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: ${props => props.theme.size.sideNavBarWidth};
  
  @media (max-width: ${props => props.theme.breakPoints.tablet}px) {
    margin-left: 0;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.xl};
  margin-top: ${props => props.theme.size.siteHeaderHeight};
  background-color: ${props => props.theme.colors.background.secondary};

  @media (max-width: ${props => props.theme.breakPoints.tablet}px) {
    padding: ${props => props.theme.spacing.md};
  }
`;

export const MainLayout = () => {
  return (
    <LayoutContainer>
      <SideNavBar />
      <MainContent>
        <SiteHeader />
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};
