import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthContextType, AuthResponse } from '../types/auth';
import { apiRequest } from '../services/api';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cyberguard_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('cyberguard_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const userData = await apiRequest<User>('/auth/me');
        setUser(userData);
      } catch (err) {
        console.error('Session expired or invalid token:', err);
        localStorage.removeItem('cyberguard_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, deviceName?: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          device_name: deviceName || window.navigator.userAgent,
          device_fingerprint: `fp_${window.screen.width}x${window.screen.height}_${window.navigator.language}`,
          ip_address: '103.211.54.12',
          geo_location: 'New Delhi, India',
        }),
      });

      localStorage.setItem('cyberguard_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          role: 'user',
        }),
      });

      localStorage.setItem('cyberguard_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('cyberguard_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
