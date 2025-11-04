import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const SideNavContainer = styled.nav`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${props => props.theme.size.sideNavBarWidth};
  background-color: ${props => props.theme.colors.background.primary};
  border-right: 1px solid ${props => props.theme.colors.border.primary};
  display: flex;
  flex-direction: column;
  z-index: ${props => props.theme.zIndex.fixed};
  
  @media (max-width: ${props => props.theme.breakPoints.tablet}px) {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
`;

const Logo = styled.div`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
`;

const LogoTitle = styled.h2`
  font-size: ${props => props.theme.fonts.size.xl};
  font-weight: ${props => props.theme.fonts.weight.bold};
  color: ${props => props.theme.colors.primary[300]};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const NavList = styled.ul`
  list-style: none;
  padding: ${props => props.theme.spacing.md};
  margin: 0;
  flex: 1;
`;

const NavItem = styled.li`
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.secondary};
  text-decoration: none;
  font-size: ${props => props.theme.fonts.size.base};
  font-weight: ${props => props.theme.fonts.weight.medium};
  transition: ${props => props.theme.transition};

  &:hover {
    background-color: ${props => props.theme.colors.neutral[50]};
    color: ${props => props.theme.colors.text.primary};
  }

  &.active {
    background-color: ${props => props.theme.colors.primary[50]};
    color: ${props => props.theme.colors.primary[300]};
    font-weight: ${props => props.theme.fonts.weight.semiBold};
  }
`;

const NavIcon = styled.span`
  font-size: ${props => props.theme.fonts.size.xl};
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavLabel = styled.span``;

const Footer = styled.div`
  padding: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
  font-size: ${props => props.theme.fonts.size.sm};
  color: ${props => props.theme.colors.text.tertiary};
  text-align: center;
`;

const navItems = [
  { path: '/meeting', label: 'Meeting', icon: '🎙️' },
  { path: '/history', label: 'History', icon: '📚' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export const SideNavBar = () => {
  return (
    <SideNavContainer>
      <Logo>
        <LogoTitle>
          <span>✨</span> Meeting Whisperer
        </LogoTitle>
      </Logo>
      <NavList>
        {navItems.map((item) => (
          <NavItem key={item.path}>
            <StyledNavLink to={item.path}>
              <NavIcon>{item.icon}</NavIcon>
              <NavLabel>{item.label}</NavLabel>
            </StyledNavLink>
          </NavItem>
        ))}
      </NavList>
      <Footer>
        Powered by AI Agents
      </Footer>
    </SideNavContainer>
  );
};
