import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { userService, LoginCredentials } from '../services';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: 'organizer' | 'supplier') => Promise<boolean>;
  register: (userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string, userType: 'organizer' | 'supplier'): Promise<boolean> => {
    try {
      const credentials: LoginCredentials = { email, password };
      const loggedUser = await userService.loginUser(credentials);
      console.log('Logged in user:', loggedUser);
      // Verificar se o tipo do usuário corresponde ao selecionado
      const normalizedUserType = loggedUser.type.toLowerCase();
      if (normalizedUserType !== userType) {
        return false;
      }
      
      // Normalizar o tipo para o formato esperado pelo frontend
      const normalizedUser = {
        ...loggedUser,
        type: userType as 'organizer' | 'supplier'
      };
      
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const createUserData = {
        name: userData.name!,
        email: userData.email!,
        password: 'defaultPassword', // Você pode adicionar um campo de senha no formulário
        type: userData.type === 'organizer' ? 'ORGANIZER' as const : 'SUPPLIER' as const,
        companyName: userData.companyName,
        description: userData.description,
        location: userData.location,
      };
      
      const newUser = await userService.createUser(createUserData);
      
      // Normalizar o tipo para o formato esperado pelo frontend
      const normalizedUser = {
        ...newUser,
        type: userData.type as 'organizer' | 'supplier'
      };
      
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}