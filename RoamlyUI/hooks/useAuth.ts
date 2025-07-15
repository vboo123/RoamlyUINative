import { useAuthContext } from '@/context/AuthContext'

export const useAuth = () => {
  const { user, token, login, logout, loading } = useAuthContext()

  return { user, token, login, logout, loading }
}
