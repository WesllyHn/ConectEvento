import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService, CreateUserData, UpdateUserData, LoginCredentials } from './userService';
import * as api from './api';
import { User } from '../types';

vi.mock('./api');

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockOrganizer: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    type: 'organizer',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const mockSupplier: User = {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    type: 'supplier',
    category: 'catering',
    rating: 4.8,
    reviewCount: 25,
    verified: true,
    availability: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  describe('getAllUsers', () => {
    it('should fetch all users', async () => {
      const mockUsers = [mockOrganizer, mockSupplier];
      vi.mocked(api.apiRequest).mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(api.apiRequest).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockUsers);
    });

    it('should handle API errors', async () => {
      vi.mocked(api.apiRequest).mockRejectedValue(new Error('API Error'));

      await expect(userService.getAllUsers()).rejects.toThrow('API Error');
    });
  });

  describe('getUserById', () => {
    it('should fetch a user by ID', async () => {
      const mockResponse = {
        success: true,
        message: 'User retrieved successfully',
        data: mockOrganizer,
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await userService.getUserById('1');

      expect(api.apiRequest).toHaveBeenCalledWith('/users/userId/1');
      expect(result).toEqual(mockOrganizer);
    });

    it('should handle not found errors', async () => {
      vi.mocked(api.apiRequest).mockRejectedValue(new Error('User not found'));

      await expect(userService.getUserById('999')).rejects.toThrow('User not found');
    });
  });

  describe('createUser', () => {
    it('should create a new organizer', async () => {
      const userData: CreateUserData = {
        name: 'New Organizer',
        email: 'neworg@example.com',
        password: 'securePassword123',
        type: 'ORGANIZER',
      };

      const newUser: User = {
        ...mockOrganizer,
        id: '3',
        name: userData.name,
        email: userData.email,
      };

      vi.mocked(api.apiRequest).mockResolvedValue(newUser);

      const result = await userService.createUser(userData);

      expect(api.apiRequest).toHaveBeenCalledWith('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      expect(result).toEqual(newUser);
    });

    it('should create a new supplier with full details', async () => {
      const supplierData: CreateUserData = {
        name: 'New Catering Company',
        email: 'catering@example.com',
        password: 'securePassword456',
        type: 'SUPPLIER',
        companyName: 'Delicious Catering',
        cnpjOrCpf: '12.345.678/0001-90',
        description: 'Premium catering services',
        location: 'São Paulo, SP',
        priceRange: 'PREMIUM',
        services: [
          { service: 'Wedding Catering' },
          { service: 'Corporate Events' },
        ],
        portfolio: [
          { imageUrl: 'https://example.com/photo1.jpg' },
        ],
      };

      const newSupplier: User = {
        ...mockSupplier,
        id: '4',
        name: supplierData.name,
        email: supplierData.email,
      };

      vi.mocked(api.apiRequest).mockResolvedValue(newSupplier);

      const result = await userService.createUser(supplierData);

      expect(api.apiRequest).toHaveBeenCalledWith('/users', {
        method: 'POST',
        body: JSON.stringify(supplierData),
      });
      expect(result).toEqual(newSupplier);
    });

    it('should handle creation errors', async () => {
      const userData: CreateUserData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        type: 'ORGANIZER',
      };

      vi.mocked(api.apiRequest).mockRejectedValue(new Error('Email already exists'));

      await expect(userService.createUser(userData)).rejects.toThrow('Email already exists');
    });
  });

  describe('updateUser', () => {
    it('should update user information', async () => {
      const updateData: UpdateUserData = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      const updatedUser: User = {
        ...mockSupplier,
        name: updateData.name,
        description: updateData.description,
      };

      vi.mocked(api.apiRequest).mockResolvedValue(updatedUser);

      const result = await userService.updateUser('2', updateData);

      expect(api.apiRequest).toHaveBeenCalledWith('/users/2', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(updatedUser);
    });

    it('should update supplier availability', async () => {
      const updateData: UpdateUserData = {
        availability: false,
      };

      const updatedSupplier: User = {
        ...mockSupplier,
        availability: false,
      };

      vi.mocked(api.apiRequest).mockResolvedValue(updatedSupplier);

      const result = await userService.updateUser('2', updateData);

      expect(result.availability).toBe(false);
    });

    it('should update supplier services and portfolio', async () => {
      const updateData: UpdateUserData = {
        services: [
          { service: 'Wedding Photography' },
          { service: 'Event Photography' },
          { service: 'Portrait Photography' },
        ],
        portfolio: [
          { imageUrl: 'https://example.com/new1.jpg' },
          { imageUrl: 'https://example.com/new2.jpg' },
        ],
      };

      const updatedSupplier: User = {
        ...mockSupplier,
      };

      vi.mocked(api.apiRequest).mockResolvedValue(updatedSupplier);

      await userService.updateUser('2', updateData);

      expect(api.apiRequest).toHaveBeenCalledWith('/users/2', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
    });

    it('should handle update errors', async () => {
      const updateData: UpdateUserData = {
        name: 'Failed Update',
      };

      vi.mocked(api.apiRequest).mockRejectedValue(new Error('Update failed'));

      await expect(userService.updateUser('2', updateData)).rejects.toThrow('Update failed');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      vi.mocked(api.apiRequest).mockResolvedValue(undefined);

      await userService.deleteUser('1');

      expect(api.apiRequest).toHaveBeenCalledWith('/users/1', {
        method: 'DELETE',
      });
    });

    it('should handle delete errors', async () => {
      vi.mocked(api.apiRequest).mockRejectedValue(new Error('Delete failed'));

      await expect(userService.deleteUser('1')).rejects.toThrow('Delete failed');
    });
  });

  describe('loginUser', () => {
    it('should login a user with valid credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'john@example.com',
        password: 'password123',
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockOrganizer);

      const result = await userService.loginUser(credentials);

      const params = new URLSearchParams({
        email: credentials.email,
        password: credentials.password,
      });

      expect(api.apiRequest).toHaveBeenCalledWith(`/users/login/?${params.toString()}`);
      expect(result).toEqual(mockOrganizer);
    });

    it('should handle invalid credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      vi.mocked(api.apiRequest).mockRejectedValue(new Error('Invalid credentials'));

      await expect(userService.loginUser(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getSuppliers', () => {
    it('should fetch all suppliers', async () => {
      const mockSuppliers = [mockSupplier, { ...mockSupplier, id: '3' }];
      const mockResponse = {
        success: true,
        message: 'Suppliers retrieved successfully',
        data: mockSuppliers,
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await userService.getSuppliers();

      expect(api.apiRequest).toHaveBeenCalledWith('/users/supplier/');
      expect(result).toEqual(mockSuppliers);
    });

    it('should return empty array when no suppliers exist', async () => {
      const mockResponse = {
        success: true,
        message: 'No suppliers found',
        data: [],
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await userService.getSuppliers();

      expect(result).toEqual([]);
    });
  });

  describe('getOrganizers', () => {
    it('should fetch all organizers', async () => {
      const mockUsers = [
        mockOrganizer,
        { ...mockOrganizer, id: '3', name: 'Another Organizer' },
        mockSupplier,
      ];

      vi.mocked(api.apiRequest).mockResolvedValue(mockUsers);

      const result = await userService.getOrganizers();

      expect(api.apiRequest).toHaveBeenCalledWith('/users');
      expect(result).toHaveLength(2);
      expect(result.every(user => user.type === 'organizer')).toBe(true);
    });

    it('should return empty array when no organizers exist', async () => {
      vi.mocked(api.apiRequest).mockResolvedValue([mockSupplier]);

      const result = await userService.getOrganizers();

      expect(result).toEqual([]);
    });
  });
});
