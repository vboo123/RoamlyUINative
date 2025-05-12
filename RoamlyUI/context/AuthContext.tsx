import { createContext, useContext, useState } from 'react'

interface AuthContextType {
  user: { id: string; name: string } | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {}
})

interface User {
  id: string;
  name: string;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const login = () => setUser({ id: '123', name: 'Vaibhav' })
  const logout = () => setUser(null)


  // {user, login, logout} will be passed to any component that 
  // uses useContext(AuthContext)
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
