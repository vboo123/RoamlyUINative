import { useAuthContext } from '@/context/AuthContext'
import { useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'

export const useAuth = () => {
  const { user, login, logout } = useAuthContext()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)'
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [user, segments])

  return { user, login, logout }
}
