// context/AuthContext.tsx
import { createContext, useContext, useState } from 'react';
import axios from 'axios';

interface User {
  name: string;
  email: string;
  user_id: string;
  country: string;
  interestOne: string;
  interestTwo: string;
  interestThree: string;
  language: string;
  age: number;
}


interface AuthContextType {
  user: User | null;
  login: (name: string, email: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  loading: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (name: string, email: string) => {
    setLoading(true);
    try {
      const res = await axios.get('https://roamlyservice.onrender.com/login', {
        params: { name, email },
      });
      setUser(res.data); 
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
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
