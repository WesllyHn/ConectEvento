import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest, API_BASE_URL } from './api';

// Mock do fetch global
global.fetch = vi.fn();

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // describe('API_BASE_URL', () => {
  //   it('should be defined', () => {
  //     expect(API_BASE_URL).toBeDefined();
  //   });
  // });

  describe('apiRequest', () => {
    it('should make a successful GET request', async () => {
      const mockData = { success: true, data: { id: 1 } };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const result = await apiRequest('/test');

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/test`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should make a POST request with body', async () => {
      const requestBody = { name: 'New Item' };
      const mockData = { success: true };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await apiRequest('/items', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/items`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
    });

    it('should make a DELETE request', async () => {
      const mockData = { success: true };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await apiRequest('/items/1', {
        method: 'DELETE',
      });

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/items/1`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should merge custom headers with default headers', async () => {
      const mockData = { success: true };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await apiRequest('/test', {
        headers: {
          'Authorization': 'Bearer token123',
        },
      });

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/test`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token123',
          }),
        })
      );
    });

    it('should throw error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await expect(apiRequest('/bad-request')).rejects.toThrow('HTTP error! status: 400');
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network failure'));

      await expect(apiRequest('/test')).rejects.toThrow('Network failure');
    });

    it('should handle JSON parsing errors', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await expect(apiRequest('/test')).rejects.toThrow('Invalid JSON');
    });

    it('should handle array response', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const result = await apiRequest('/items');

      expect(result).toEqual(mockData);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should pass additional RequestInit options', async () => {
      const mockData = { success: true };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await apiRequest('/test', {
        method: 'POST',
        credentials: 'include',
      });

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/test`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });
  });
});