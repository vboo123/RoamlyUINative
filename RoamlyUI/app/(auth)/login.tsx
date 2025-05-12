import { useAuth } from '@/hooks/useAuth'
import { Button, Text, View } from 'react-native'

export default function Login() {
  const { login } = useAuth()

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 24, marginBottom: 12 }}>Login Page</Text>
      <Button title="Login" onPress={login} />
    </View>
  )
}
