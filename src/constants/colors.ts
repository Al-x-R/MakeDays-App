// src/constants/colors.ts

export type ThemeMode = 'dark' | 'light';

export const themeColors = {
  dark: {
    background: '#050508',
    surface: '#111115',
    modalSurface: '#1C1C22',

    gradients: {
      past: ['#2A4557', '#1B2E3C'] as const,
      today: ['#91F1FB', '#52D4E3'] as const,
      future: ['#33B5E5', '#0097A7'] as const,
      purple: ['#C084FC', '#7E22CE'] as const,
      indigo: ['#818CF8', '#3730A3'] as const,
      yellow: ['#FDE047', '#CA8A04'] as const,
      green: ['#4ADE80', '#166534'] as const,
      orange: ['#FB923C', '#C2410C'] as const,
      red: ['#F87171', '#991B1B'] as const,
      pink: ['#F472B6', '#BE185D'] as const,
      blue: ['#60A5FA', '#1D4ED8'] as const,
    },

    borders: {
      past: '#375163',
      future: '#00BCD4',
      subtle: '#1E293B',
    },

    text: {
      primary: '#FFFFFF',
      secondary: '#94A3B8',
      dim: '#A0B0C0',
      inverse: '#001F29',
      futureText: '#E0F7FA',
      onGradient: '#FFFFFF',
    },
  },

  light: {
    background: '#F5F8FF',
    surface: '#FFFFFF',
    modalSurface: '#FFFFFF',

    gradients: {
      past: ['#CFE0F6', '#AFC6E9'] as const,
      today: ['#7ED9FF', '#4FA7FF'] as const,
      future: ['#67B7FF', '#3B82F6'] as const,
      purple: ['#C7B5FF', '#8B5CF6'] as const,
      indigo: ['#A5B4FC', '#4F46E5'] as const,
      yellow: ['#FDE68A', '#D97706'] as const,
      green: ['#86EFAC', '#15803D'] as const,
      orange: ['#FDBA74', '#EA580C'] as const,
      red: ['#FCA5A5', '#DC2626'] as const,
      pink: ['#FDA4AF', '#DB2777'] as const,
      blue: ['#93C5FD', '#2563EB'] as const,
    },

    borders: {
      past: '#D6E0F2',
      future: '#7CC6FF',
      subtle: '#E3EAF7',
    },

    text: {
      primary: '#101727',
      secondary: '#52607A',
      dim: '#7A879F',
      inverse: '#FFFFFF',
      futureText: '#1E3A8A',
      onGradient: '#FFFFFF',
    },
  },
} as const;

export type AppColors = typeof themeColors.dark | typeof themeColors.light;

export const getThemeColors = (theme: ThemeMode): AppColors => themeColors[theme];

const colors = themeColors.dark;

export default colors;
