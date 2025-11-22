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
  // Buscar todos os usuários
  async getAllUsers(): Promise<User[]> {
    return apiRequest('/users');
  }

  async getUserById(userId: string): Promise<any> {
    const response = await apiRequest(`/users/userId/${userId}`);
    return response.data;
  }

  // Criar novo usuário
  async createUser(userData: CreateUserData): Promise<User> {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Atualizar usuário
  async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Deletar usuário
  async deleteUser(userId: string): Promise<void> {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Login do usuário
  async loginUser(credentials: LoginCredentials): Promise<User> {
    const params = new URLSearchParams({
      email: credentials.email,
      password: credentials.password,
    });
    
    return apiRequest(`/users/login/?${params.toString()}`);
  }

  async getSuppliers(): Promise<any[]> {
    const response = await apiRequest('/users/supplier/');
    return response.data;
  }

  // Buscar organizadores (usuários do tipo ORGANIZER)
  async getOrganizers(): Promise<User[]> {
    const users = await this.getAllUsers();
    return users.filter(user => user.type === 'organizer');
  }
}

export const userService = new UserService();