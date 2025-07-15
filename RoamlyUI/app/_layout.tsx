import { Colors } from '@/constants/Colors'
import { AuthProvider } from '@/context/AuthContext'
import { LandmarkProvider } from '@/context/LandmarkContext'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Slot } from 'expo-router'
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper'

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Create custom themes based on the app's color scheme
  const lightTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: colors.tint,
      onPrimary: '#ffffff',
      surface: colors.background,
      onSurface: colors.text,
      surfaceVariant: '#f5f5f5',
      onSurfaceVariant: colors.text,
      outline: '#e0e0e0',
      outlineVariant: '#f0f0f0',
    },
  };

  const darkTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: colors.tint,
      onPrimary: '#000000',
      surface: colors.background,
      onSurface: colors.text,
      surfaceVariant: '#2a2a2a',
      onSurfaceVariant: colors.text,
      outline: '#404040',
      outlineVariant: '#303030',
    },
  };

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  console.log("enter here first...")

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <LandmarkProvider>
          <Slot />
        </LandmarkProvider>
      </AuthProvider>
    </PaperProvider>
  )
}
