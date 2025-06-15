import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

// Define color tokens (matching the previous Chakra UI theme)
const colorTokens = {
  primary: '#009688', // Teal - main UI color from Chakra theme
  primaryHover: '#00796b',
  primaryActive: '#00695c',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1677ff',
};

// Light theme configuration
export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: colorTokens.primary,
    colorSuccess: colorTokens.success,
    colorWarning: colorTokens.warning,
    colorError: colorTokens.error,
    colorInfo: colorTokens.info,
    borderRadius: 6,
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  algorithm: [],
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Table: {
      borderRadius: 6,
    },
    Card: {
      borderRadius: 8,
    },
  },
};

// Dark theme configuration
export const darkTheme: ThemeConfig = {
  ...lightTheme,
  algorithm: [theme.darkAlgorithm],
  token: {
    ...lightTheme.token,
  },
};

// Export default theme
export const antdTheme = lightTheme; 