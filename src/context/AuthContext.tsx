import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { userService, LoginCredentials } from '../services';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: 'organizer' | 'supplier') => Promise<boolean>;
  register: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há token e usuário salvos ao carregar
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, userType: 'organizer' | 'supplier'): Promise<boolean> => {
    try {
      const credentials: LoginCredentials = { email, password };
      const response = await userService.loginUser(credentials);
      console.log('Login response:', response);

      // Verificar se o login foi bem-sucedido
      if (!response.success || !response.data) {
        return false;
      }

      const { user: userData, token } = response.data;

      // Validar tipo de usuário
      const normalizedUserType = userData.type.toLowerCase();
      if (normalizedUserType !== userType) {
        return false;
      }

      // Normalizar dados do usuário
      const normalizedUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        type: userType,
        password: password, // Senha não é armazenada no localStorage, mas é necessária no tipo
        createdAt: userData.createdAt || new Date().toISOString(),
        avatar: userData.avatar,
        companyName: userData.companyName,
        description: userData.description,
        location: userData.location,
        priceRange: userData.priceRange,
        rating: userData.rating,
        reviewCount: userData.reviewCount,
        availability: userData.availability,
      };

      // Armazenar token e usuário
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      
      if (!userData.password) {
        return { success: false, message: 'Senha é obrigatória' };
      }
      
      const createUserData = {
        name: userData.name!,
        email: userData.email!,
        password: userData.password,
        type: userData.type === 'organizer' ? 'ORGANIZER' as const : 'SUPPLIER' as const,
        companyName: userData.companyName,
        description: userData.description,
        location: userData.location,
      };
      console.log("createUserData", createUserData)
      const newUser = await userService.createUser(createUserData);
      
      const normalizedUser: User = {
        ...newUser,
        type: userData.type as 'organizer' | 'supplier',
        password: userData.password,
        createdAt: newUser.createdAt || new Date().toISOString(),
      };
      
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'Erro ao criar conta. Tente novamente.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const contextValue = useMemo(() => ({
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading
  }), [user, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}