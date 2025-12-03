import { apiRequest } from './api';
import { User } from '../types';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  type: 'ORGANIZER' | 'SUPPLIER';
  companyName?: string;
  cnpjOrCpf?: string;
  description?: string;
  location?: string;
  priceRange?: 'BUDGET' | 'MID' | 'PREMIUM';
  services?: Array<{ service: string }>;
  portfolio?: Array<{ imageUrl: string }>;
}

export interface UpdateUserData {
  name?: string;
  description?: string;
  availability?: boolean;
  companyName?: string;
  location?: string;
  priceRange?: 'BUDGET' | 'MID' | 'PREMIUM';
  services?: Array<{ service: string }>;
  portfolio?: Array<{ imageUrl: string }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

class UserService {
  async getAllUsers(): Promise<User[]> {
    return apiRequest('/users');
  }

  async getUserById(userId: string): Promise<any> {
    const response = await apiRequest(`/users/userId/${userId}`);
    return response.data;
  }

  async createUser(userData: CreateUserData): Promise<User> {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string): Promise<void> {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async loginUser(credentials: LoginCredentials): Promise<{ success: boolean; data?: { user: User; token: string }; message?: string }> {
    const params = new URLSearchParams({
      email: credentials.email,
      password: credentials.password,
    });
    
    try {
      const response = await apiRequest(`/users/login/?${params.toString()}`);
      
      // A resposta agora vem no formato: { success: true, message: "...", data: { user, token } }
      if (response.success && response.data && response.data.user && response.data.token) {
        return {
          success: true,
          data: {
            user: response.data.user,
            token: response.data.token,
          },
          message: response.message,
        };
      }
      
      // Se success for false ou não houver data
      return {
        success: false,
        message: response.message || 'Erro ao fazer login',
      };
    } catch (error: any) {
      // Tratar erros da API
      return {
        success: false,
        message: error.message || 'Erro ao fazer login',
      };
    }
  }

  async getSuppliers(): Promise<any[]> {
    const response = await apiRequest('/users/supplier/');
    return response.data;
  }

  async getOrganizers(): Promise<User[]> {
    const users = await this.getAllUsers();
    return users.filter(user => user.type === 'organizer');
  }
}

export const userService = new UserService();