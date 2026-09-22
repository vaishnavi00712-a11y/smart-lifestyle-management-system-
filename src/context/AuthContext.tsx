import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; age?: number; lifestyle_goal?: string }) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const refreshUser = async () => {
    if (!localStorage.getItem('token')) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authService.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      showToast('Session expired. Please log in again.', 'info');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    const res = await authService.login({ email, password: pass });
    setLoading(false);

    if (res.success && res.data) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      showToast(`Welcome back, ${res.data.user.name}!`, 'success');
      return true;
    } else {
      showToast(res.message || 'Login failed. Please check your credentials.', 'error');
      return false;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    age?: number;
    lifestyle_goal?: string;
  }): Promise<boolean> => {
    setLoading(true);
    const res = await authService.register(data);
    setLoading(false);

    if (res.success && res.data) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      showToast('Welcome to Smart Lifestyle Management!', 'success');
      return true;
    } else {
      showToast(res.message || 'Registration failed.', 'error');
      return false;
    }
  };

  const logout = () => {
    authService.logout().catch(() => {});
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
