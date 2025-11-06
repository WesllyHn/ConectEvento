import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reviewService, CreateReviewData, UpdateReviewResponse } from './reviewService';
import * as api from './api';

vi.mock('./api');

describe('reviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockReview = {
    id: '1',
    supplierId: 'supplier-1',
    organizerId: 'org-1',
    eventId: 'event-1',
    rating: 5,
    comment: 'Excellent service!',
    response: null,
    responseDate: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  describe('getSuppliersToReview', () => {
    it('should fetch suppliers available to review by organizer ID', async () => {
      const mockSuppliers = [
        { id: 'supplier-1', name: 'Supplier One', category: 'CATERING' },
        { id: 'supplier-2', name: 'Supplier Two', category: 'PHOTOGRAPHY' },
      ];

      const mockResponse = {
        success: true,
        message: 'Suppliers retrieved successfully',
        data: mockSuppliers,
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await reviewService.getSuppliersToReview('org-1');

      expect(api.apiRequest).toHaveBeenCalledWith('/reviews/organizadorId/org-1');
      expect(result).toEqual(mockSuppliers);
    });

    it('should return empty array when no suppliers to review', async () => {
      const mockResponse = {
        success: true,
        message: 'No suppliers to review',
        data: [],
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await reviewService.getSuppliersToReview('org-2');

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      vi.mocked(api.apiRequest).mockRejectedValue(new Error('API Error'));

      await expect(reviewService.getSuppliersToReview('org-1')).rejects.toThrow('API Error');
    });
  });

  describe('getReviewsByUserId', () => {
    it('should fetch reviews for an organizer', async () => {
      const mockResponse = {
        success: true,
        message: 'Reviews retrieved successfully',
        data: [mockReview],
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await reviewService.getReviewsByUserId('org-1', 'ORGANIZER');

      expect(api.apiRequest).toHaveBeenCalledWith('/reviews/org-1?type=ORGANIZER');
      expect(result).toEqual([mockReview]);
    });

    it('should fetch reviews for a supplier', async () => {
      const supplierReviews = [
        { ...mockReview, id: '2', supplierId: 'supplier-1' },
        { ...mockReview, id: '3', supplierId: 'supplier-1', rating: 4 },
      ];

      const mockResponse = {
        success: true,
        message: 'Reviews retrieved successfully',
        data: supplierReviews,
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await reviewService.getReviewsByUserId('supplier-1', 'SUPPLIER');

      expect(api.apiRequest).toHaveBeenCalledWith('/reviews/supplier-1?type=SUPPLIER');
      expect(result).toEqual(supplierReviews);
    });

    it('should return empty array when no reviews exist', async () => {
      const mockResponse = {
        success: true,
        message: 'No reviews found',
        data: [],
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await reviewService.getReviewsByUserId('org-3', 'ORGANIZER');

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      vi.mocked(api.apiRequest).mockRejectedValue(new Error('API Error'));

      await expect(reviewService.getReviewsByUserId('org-1', 'ORGANIZER')).rejects.toThrow('API Error');
    });
  });

  describe('createReview', () => {
    it('should create a new review with 5 stars', async () => {
      const reviewData: CreateReviewData = {
        supplierId: 'supplier-1',
        organizerId: 'org-1',
        eventId: 'event-1',
        rating: 5,
        comment: 'Outstanding service! Highly recommend.',
      };

      const mockResponse = {
        success: true,
        message: 'Review created successfully',
        data: { ...mockReview, ...reviewData, id: '2' },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await reviewService.createReview(reviewData);

      expect(api.apiRequest).toHaveBeenCalledWith('/reviews/', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
      expect(result).toEqual(mockResponse.data);
      expect(result.rating).toBe(5);
    });

    it('should create a review with lower rating', async () => {
      const reviewData: CreateReviewData = {
        supplierId: 'supplier-2',
        organizerId: 'org-1',
        eventId: 'event-2',
        rating: 3,
        comment: 'Service was okay but could be better.',
      };

      const mockResponse = {
        success: true,
        message: 'Review created successfully',
        data: { ...mockReview, ...reviewData, id: '3' },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await reviewService.createReview(reviewData);

      expect(result.rating).toBe(3);
      expect(result.comment).toBe(reviewData.comment);
    });

    it('should create a review with detailed comment', async () => {
      const reviewData: CreateReviewData = {
        supplierId: 'supplier-3',
        organizerId: 'org-1',
        eventId: 'event-3',
        rating: 5,
        comment: 'Amazing photography! They captured every special moment. Professional, punctual, and the edited photos were delivered on time. Will definitely hire again.',
      };

      const mockResponse = {
        success: true,
        message: 'Review created successfully',
        data: { ...mockReview, ...reviewData, id: '4' },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await reviewService.createReview(reviewData);

      expect(result.comment).toBe(reviewData.comment);
    });

    it('should handle creation errors', async () => {
      const reviewData: CreateReviewData = {
        supplierId: 'supplier-1',
        organizerId: 'org-1',
        eventId: 'event-1',
        rating: 4,
        comment: 'Good service',
      };

      vi.mocked(api.apiRequest).mockRejectedValue(new Error('Creation failed'));

      await expect(reviewService.createReview(reviewData)).rejects.toThrow('Creation failed');
    });
  });

  describe('respondToReview', () => {
    it('should add supplier response to a review', async () => {
      const responseData: UpdateReviewResponse = {
        response: 'Thank you for the feedback! We appreciate your business.',
        responseDate: '2025-01-15T10:30:00.000Z',
      };

      const mockResponse = {
        success: true,
        message: 'Response added successfully',
        data: { ...mockReview, ...responseData },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await reviewService.respondToReview('1', responseData);

      expect(api.apiRequest).toHaveBeenCalledWith('/reviews/1', {
        method: 'PUT',
        body: JSON.stringify(responseData),
      });
      expect(result.response).toBe(responseData.response);
      expect(result.responseDate).toBe(responseData.responseDate);
    });

    it('should respond to negative review professionally', async () => {
      const responseData: UpdateReviewResponse = {
        response: 'We apologize for your experience. We would like to discuss this further to make it right. Please contact us directly.',
        responseDate: '2025-01-16T14:20:00.000Z',
      };

      const mockResponse = {
        success: true,
        message: 'Response added successfully',
        data: { ...mockReview, rating: 2, ...responseData },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await reviewService.respondToReview('2', responseData);

      expect(result.response).toContain('apologize');
    });

    it('should handle response errors', async () => {
      const responseData: UpdateReviewResponse = {
        response: 'Thank you!',
        responseDate: '2025-01-17T09:00:00.000Z',
      };

      vi.mocked(api.apiRequest).mockRejectedValue(new Error('Response failed'));

      await expect(reviewService.respondToReview('1', responseData)).rejects.toThrow('Response failed');
    });
  });
});
