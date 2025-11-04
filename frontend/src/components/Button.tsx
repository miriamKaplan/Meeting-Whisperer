import styled from 'styled-components';
import { ReactNode, MouseEvent } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  className?: string;
}

const StyledButton = styled.button<{
  $variant: ButtonProps['variant'];
  $size: ButtonProps['size'];
  $fullWidth?: boolean;
  $hasIcon?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  font-family: ${props => props.theme.fonts.family.primary};
  font-weight: ${props => props.theme.fonts.weight.medium};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: ${props => props.theme.transition};
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  
  ${props => {
    // Size variants
    switch (props.$size) {
      case 'small':
        return `
          padding: ${props.theme.spacing.sm} ${props.theme.spacing.md};
          font-size: ${props.theme.fonts.size.sm};
          height: 32px;
        `;
      case 'large':
        return `
          padding: ${props.theme.spacing.md} ${props.theme.spacing.xl};
          font-size: ${props.theme.fonts.size.base};
          height: 48px;
        `;
      default: // medium
        return `
          padding: ${props.theme.spacing.sm} ${props.theme.spacing.lg};
          font-size: ${props.theme.fonts.size.base};
          height: 40px;
        `;
    }
  }}

  ${props => props.$fullWidth && 'width: 100%;'}

  ${props => {
    // Color variants
    switch (props.$variant) {
      case 'primary':
        return `
          background-color: ${props.theme.colors.primary[300]};
          color: ${props.theme.colors.text.inverse};
          
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.primary[400]};
          }
          
          &:active:not(:disabled) {
            background-color: ${props.theme.colors.primary[500]};
          }
        `;
      case 'secondary':
        return `
          background-color: ${props.theme.colors.neutral[100]};
          color: ${props.theme.colors.text.primary};
          
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.neutral[200]};
          }
          
          &:active:not(:disabled) {
            background-color: ${props.theme.colors.neutral[300]};
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          color: ${props.theme.colors.primary[300]};
          border-color: ${props.theme.colors.primary[300]};
          
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.primary[50]};
          }
          
          &:active:not(:disabled) {
            background-color: ${props.theme.colors.primary[100]};
          }
        `;
      case 'ghost':
        return `
          background-color: transparent;
          color: ${props.theme.colors.text.primary};
          
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.neutral[100]};
          }
          
          &:active:not(:disabled) {
            background-color: ${props.theme.colors.neutral[200]};
          }
        `;
      case 'danger':
        return `
          background-color: ${props.theme.colors.error[500]};
          color: ${props.theme.colors.text.inverse};
          
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.error[600]};
          }
          
          &:active:not(:disabled) {
            background-color: ${props.theme.colors.error[700]};
          }
        `;
      default:
        return `
          background-color: ${props.theme.colors.primary[300]};
          color: ${props.theme.colors.text.inverse};
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.border.focus};
    outline-offset: 2px;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  isLoading = false,
  icon,
  iconPosition = 'left',
  type = 'button',
  fullWidth = false,
  className,
}: ButtonProps) => {
  return (
    <StyledButton
      onClick={onClick}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $hasIcon={!!icon}
      disabled={disabled || isLoading}
      type={type}
      className={className}
    >
      {isLoading && <LoadingSpinner />}
      {!isLoading && icon && iconPosition === 'left' && icon}
      {children}
      {!isLoading && icon && iconPosition === 'right' && icon}
    </StyledButton>
  );
};
