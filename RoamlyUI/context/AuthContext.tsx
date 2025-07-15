// context/AuthContext.tsx
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  name: string;
  email: string;
  user_id: string;
  country: string;
  interestOne: string;
  language: string;
  age: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (name: string, email: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  loading: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load token/user from SecureStore on mount (optional, for persistence)
  useEffect(() => {
    (async () => {
      const storedToken = await SecureStore.getItemAsync('jwtToken');
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    })();
  }, []);

  const login = async (name: string, email: string) => {
    setLoading(true);
    try {
      const res = await axios.post('http://192.168.1.102:8000/login/', null, {
        params: { name, email }
      });
      // Expecting: { user: {...}, token: "..." }
      setUser(res.data.user);
      setToken(res.data.token);
      await SecureStore.setItemAsync('jwtToken', res.data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(res.data.user));
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync('jwtToken');
    await SecureStore.deleteItemAsync('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
