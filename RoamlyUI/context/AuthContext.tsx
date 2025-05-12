import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async auth check (e.g., from SecureStore or Firebase)
    const checkAuth = async () => {
      // await something like getTokenFromStorage()
      await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate delay
      setUser(null); // or setUser({ id: '123', name: 'Vaibhav' }) if auto-login
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = () => {
    setUser({ id: '123', name: 'Vaibhav' });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
