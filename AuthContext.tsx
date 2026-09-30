import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export interface User {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  loginWithDemo: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ca_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('ca_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.data);
          setToken(storedToken);
        } catch (err) {
          console.error('Session expired or invalid:', err);
          localStorage.removeItem('ca_token');
          localStorage.removeItem('ca_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    const { access_token, user: loggedUser } = res.data;
    localStorage.setItem('ca_token', access_token);
    localStorage.setItem('ca_user', JSON.stringify(loggedUser));
    setToken(access_token);
    setUser(loggedUser);
  };

  const register = async (data: any) => {
    const res = await authService.register(data);
    const { access_token, user: newUser } = res.data;
    localStorage.setItem('ca_token', access_token);
    localStorage.setItem('ca_user', JSON.stringify(newUser));
    setToken(access_token);
    setUser(newUser);
  };

  const loginWithDemo = async () => {
    setLoading(true);
    try {
      const res = await authService.demoSeed();
      const { access_token, user: demoUser } = res.data;
      localStorage.setItem('ca_token', access_token);
      localStorage.setItem('ca_user', JSON.stringify(demoUser));
      setToken(access_token);
      setUser(demoUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ca_token');
    localStorage.removeItem('ca_user');
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await authService.getMe();
      setUser(res.data);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginWithDemo,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
