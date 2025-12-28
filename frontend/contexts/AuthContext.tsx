'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockUser, mockCredentials } from '@/lib/mock-data';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  pixKey: string;
  referralCode: string;
  balance: number;
  pendingBalance: number;
  totalEarnings: number;
  createdAt: string;
  networkSize: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se há usuário logado no localStorage ao carregar
  useEffect(() => {
    const storedUser = localStorage.getItem('rifanet_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validar credenciais mockadas
    if (email === mockCredentials.email && password === mockCredentials.password) {
      setUser(mockUser);
      localStorage.setItem('rifanet_user', JSON.stringify(mockUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rifanet_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

