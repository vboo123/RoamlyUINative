// app/(tabs)/_layout.tsx
import { useAuth } from '@/hooks/useAuth';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
    </Tabs>
  );
}
