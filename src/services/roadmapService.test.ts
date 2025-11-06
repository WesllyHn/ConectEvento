import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roadmapService, RoadmapItem } from './roadmapService';
import * as api from './api';

vi.mock('./api');

describe('roadmapService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRoadmapItem: RoadmapItem = {
    id: '1',
    idEvent: 'event-1',
    category: 'BIRTHDAY',
    title: 'Test Item',
    description: 'Test Description',
    price: '1000',
    status: 'PLANNING',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  describe('getRoadmapByEventId', () => {
    it('should fetch roadmap items by event ID', async () => {
      const mockResponse = {
        success: true,
        message: 'Roadmap retrieved successfully',
        data: [mockRoadmapItem],
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await roadmapService.getRoadmapByEventId('event-1');

      expect(api.apiRequest).toHaveBeenCalledWith('/roadmaps/eventId/event-1');
      expect(result).toEqual([mockRoadmapItem]);
    });

    it('should return empty array when data is not an array', async () => {
      const mockResponse = {
        success: true,
        message: 'Success',
        data: mockRoadmapItem,
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await roadmapService.getRoadmapByEventId('event-1');

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      vi.mocked(api.apiRequest).mockRejectedValue(new Error('API Error'));

      await expect(roadmapService.getRoadmapByEventId('event-1')).rejects.toThrow('API Error');
    });
  });

  describe('getRoadmapById', () => {
    it('should fetch a single roadmap item by ID', async () => {
      const mockResponse = {
        success: true,
        message: 'Roadmap retrieved successfully',
        data: mockRoadmapItem,
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await roadmapService.getRoadmapById('1');

      expect(api.apiRequest).toHaveBeenCalledWith('/roadmaps/1');
      expect(result).toEqual(mockRoadmapItem);
    });

    it('should return null when data is an array', async () => {
      const mockResponse = {
        success: true,
        message: 'Success',
        data: [mockRoadmapItem],
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await roadmapService.getRoadmapById('1');

      expect(result).toBeNull();
    });
  });

  describe('createRoadmap', () => {
    it('should create a new roadmap item', async () => {
      const newItemData = {
        idEvent: 'event-1',
        category: 'BIRTHDAY',
        title: 'New Item',
        description: 'New Description',
        price: '2000',
        status: 'PLANNING',
      };

      const mockResponse = {
        success: true,
        message: 'Roadmap created successfully',
        data: { ...mockRoadmapItem, ...newItemData },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await roadmapService.createRoadmap(newItemData);

      expect(api.apiRequest).toHaveBeenCalledWith('/roadmaps/', {
        method: 'POST',
        body: JSON.stringify(newItemData),
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateRoadmap', () => {
    it('should update an existing roadmap item', async () => {
      const updateData = {
        status: 'CONTRACTED' as const,
        price: '1500',
      };

      const mockResponse = {
        success: true,
        message: 'Roadmap updated successfully',
        data: { ...mockRoadmapItem, ...updateData },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await roadmapService.updateRoadmap('1', updateData);

      expect(api.apiRequest).toHaveBeenCalledWith('/roadmaps/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteRoadmap', () => {
    it('should delete a roadmap item', async () => {
      vi.mocked(api.apiRequest).mockResolvedValue({});

      await roadmapService.deleteRoadmap('1');

      expect(api.apiRequest).toHaveBeenCalledWith('/roadmaps/1', {
        method: 'DELETE',
      });
    });

    it('should handle delete errors', async () => {
      vi.mocked(api.apiRequest).mockRejectedValue(new Error('Delete failed'));

      await expect(roadmapService.deleteRoadmap('1')).rejects.toThrow('Delete failed');
    });
  });
});
