import './src/i18n';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/useThemeStore';
import { getThemeColors } from './src/constants/colors';

export default function App() {
  const theme = useThemeStore((state) => state.theme);
  const colors = getThemeColors(theme);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}
