// app/(tabs)/_layout.tsx
import { useAuth } from '@/hooks/useAuth';
import { Redirect, Tabs, router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

export default function TabsLayout() {
  const { user, loading, logout } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTitleStyle: {
          color: theme.colors.onSurface,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <IconButton
              icon="compass"
              iconColor={color}
              size={size}
              style={{ margin: 0 }}
            />
          ),
          headerRight: () => (
            <IconButton
              icon="logout"
              onPress={async () => {
                await logout();
                router.replace('/sign-in');
              }}
              accessibilityLabel="Log out"
              iconColor={theme.colors.onSurface}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => (
            <IconButton
              icon="map"
              iconColor={color}
              size={size}
              style={{ margin: 0 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
