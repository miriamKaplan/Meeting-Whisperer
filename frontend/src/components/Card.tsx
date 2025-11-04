import styled, { css } from 'styled-components';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  flat?: boolean;
  ghost?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const StyledCard = styled.div<{
  $flat?: boolean;
  $ghost?: boolean;
  $clickable?: boolean;
  $padding: CardProps['padding'];
}>`
  background-color: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  transition: ${props => props.theme.transition};
  
  ${props => {
    if (props.$ghost) {
      return css`
        border: none;
        box-shadow: none;
      `;
    }
    if (props.$flat) {
      return css`
        border: 1px solid ${props.theme.colors.border.primary};
        box-shadow: none;
      `;
    }
    return css`
      border: 1px solid ${props.theme.colors.border.secondary};
      box-shadow: ${props.theme.shadows.md};
    `;
  }}

  ${props => {
    switch (props.$padding) {
      case 'none':
        return 'padding: 0;';
      case 'small':
        return `padding: ${props.theme.spacing.md};`;
      case 'large':
        return `padding: ${props.theme.spacing.xl};`;
      default: // medium
        return `padding: ${props.theme.spacing.lg};`;
    }
  }}

  ${props =>
    props.$clickable &&
    css`
      cursor: pointer;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: ${props.theme.shadows.lg};
      }
      
      &:active {
        transform: translateY(0);
      }
    `}
`;

export const Card = ({
  children,
  className,
  flat = false,
  ghost = false,
  onClick,
  padding = 'medium',
}: CardProps) => {
  return (
    <StyledCard
      className={className}
      $flat={flat}
      $ghost={ghost}
      $clickable={!!onClick}
      $padding={padding}
      onClick={onClick}
    >
      {children}
    </StyledCard>
  );
};
