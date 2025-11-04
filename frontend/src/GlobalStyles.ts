import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    font-family: ${props => props.theme.fonts.family.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    background-color: ${props => props.theme.colors.background.secondary};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.fonts.size.base};
    line-height: 1.5;
  }

  #root {
    height: 100%;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${props => props.theme.fonts.weight.semiBold};
    line-height: 1.2;
  }

  h1 {
    font-size: ${props => props.theme.fonts.size['4xl']};
  }

  h2 {
    font-size: ${props => props.theme.fonts.size['3xl']};
  }

  h3 {
    font-size: ${props => props.theme.fonts.size['2xl']};
  }

  h4 {
    font-size: ${props => props.theme.fonts.size.xl};
  }

  h5 {
    font-size: ${props => props.theme.fonts.size.lg};
  }

  h6 {
    font-size: ${props => props.theme.fonts.size.base};
  }

  a {
    color: ${props => props.theme.colors.text.link};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${props => props.theme.colors.text.linkHover};
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.neutral[100]};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.neutral[400]};
    border-radius: ${props => props.theme.borderRadius.md};

    &:hover {
      background: ${props => props.theme.colors.neutral[500]};
    }
  }

  /* Utility classes */
  .separator {
    height: 1px;
    width: 100%;
    background-color: ${props => props.theme.colors.border.primary};
  }

  .clickable-row {
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${props => props.theme.colors.neutral[50]};
    }

    &:active {
      background-color: ${props => props.theme.colors.neutral[100]};
    }
  }
`;
