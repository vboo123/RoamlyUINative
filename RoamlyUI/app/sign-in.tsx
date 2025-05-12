// app/sign-in.tsx
import { Text, View, Button } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';

export default function SignIn() {
  const { login } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome, please sign in</Text>
      <Button
        title="Sign In"
        onPress={async () => {
          await login(); // perform login
          router.replace('/'); // redirect to home or protected screen
        }}
      />
    </View>
  );
}
