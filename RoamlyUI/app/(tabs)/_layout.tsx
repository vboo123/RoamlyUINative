// app/(tabs)/_layout.tsx
import { useAuth } from '@/hooks/useAuth';
import { Redirect, Tabs, router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { IconButton } from 'react-native-paper';

export default function TabsLayout() {
  const { user, loading, logout } = useAuth();

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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          headerRight: () => (
            <IconButton
              icon="logout"
              onPress={async () => {
                await logout();
                router.replace('/sign-in');
              }}
              accessibilityLabel="Log out"
            />
          ),
        }}
      />
    </Tabs>
  );
}
