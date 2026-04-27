import { DarkTheme, DefaultTheme } from '@react-navigation/native';

import { getThemeColors } from '../constants/colors';
import { useThemeStore } from '../store/useThemeStore';

export const useAppTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const colors = getThemeColors(theme);

  const navigationTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text.primary,
      border: colors.borders.subtle,
      primary: colors.gradients.today[1],
      notification: colors.gradients.red[0],
    },
  };

  return { theme, colors, navigationTheme };
};
