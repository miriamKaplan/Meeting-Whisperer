// Theme inspired by CRB Partner Portal Design System
export const theme = {
  colors: {
    // Foundation Colors - matching CRB palette
    primary: {
      50: '#E7F4FA',
      100: '#D0EBF9',
      200: '#8CD2F6',
      300: '#03A0EF',
      400: '#0289D3',
      500: '#1470CC',
      600: '#065F9A',
      700: '#0A5387',
      800: '#0F436E',
      900: '#143456',
    },
    neutral: {
      50: '#F5F8FA',
      100: '#EBF0F2',
      200: '#D5D9DD',
      300: '#BFC1C8',
      400: '#AAABB2',
      500: '#898A92',
      600: '#676871',
      700: '#464853',
      800: '#30313C',
      900: '#1F0040',
      white: '#FFFFFF',
      black: '#000000',
    },
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    error: {
      50: '#FEF2F2',
      100: '#FBDEDD',
      200: '#F5B5B2',
      300: '#F08C87',
      400: '#EA625B',
      500: '#CC1F4E',
      600: '#B61F43',
      700: '#A11F38',
      800: '#8B1E2D',
      900: '#751E22',
    },
    accent: {
      primary: {
        50: '#B686E8',
        100: '#8646C9',
      },
      secondary: {
        50: '#7EBFBA',
        100: '#38807A',
      },
    },
    // Semantic colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F8FA',
      tertiary: '#EBF0F2',
      inverse: '#1F0040',
    },
    text: {
      primary: '#1F0040',
      secondary: '#464853',
      tertiary: '#898A92',
      inverse: '#FFFFFF',
      disabled: '#BFC1C8',
      link: '#03A0EF',
      linkHover: '#0289D3',
      error: '#CC1F4E',
      success: '#10B981',
      warning: '#F59E0B',
    },
    border: {
      primary: '#D5D9DD',
      secondary: '#EBF0F2',
      focus: '#03A0EF',
      error: '#CC1F4E',
    },
    icon: {
      primary: '#464853',
      secondary: '#898A92',
      interactive: '#03A0EF',
      inverse: '#FFFFFF',
      disabled: '#BFC1C8',
    },
  },
  fonts: {
    family: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Courier New", monospace',
    },
    size: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    weight: {
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },
  borderRadius: {
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  size: {
    siteHeaderHeight: '64px',
    sideNavBarWidth: '240px',
  },
  breakPoints: {
    mobile: 375,
    tablet: 768,
    tabletTop: 1024,
    desktop: 1280,
    wide: 1920,
  },
  transition: 'all 0.3s ease-in-out',
  zIndex: {
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modal: 400,
    popover: 500,
    toast: 600,
    tooltip: 700,
  },
};

export type Theme = typeof theme;
