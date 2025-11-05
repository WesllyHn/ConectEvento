import { describe, it, expect, vi, beforeEach } from 'vitest';
import { quoteService, CreateQuoteData, UpdateQuoteData } from './quoteService';
import * as api from './api';

vi.mock('./api');

describe('quoteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockQuote = {
    id: '1',
    eventId: 'event-1',
    supplierId: 'supplier-1',
    organizerId: 'org-1',
    message: 'Need catering for 150 guests',
    status: 'PENDING',
    response: null,
    price: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  describe('getBudgetsByUserId', () => {
    it('should fetch budgets by user ID', async () => {
      const mockResponse = {
        success: true,
        message: 'Budgets retrieved successfully',
        data: [mockQuote],
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await quoteService.getBudgetsByUserId('org-1');

      expect(api.apiRequest).toHaveBeenCalledWith('/budgets?id=org-1');
      expect(result).toEqual([mockQuote]);
    });

    it('should return empty array when no budgets exist', async () => {
      const mockResponse = {
        success: true,
        message: 'No budgets found',
        data: [],
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await quoteService.getBudgetsByUserId('org-2');

      expect(api.apiRequest).toHaveBeenCalledWith('/budgets?id=org-2');
      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      vi.mocked(api.apiRequest).mockRejectedValue(new Error('API Error'));

      await expect(quoteService.getBudgetsByUserId('org-1')).rejects.toThrow('API Error');
    });
  });

  describe('createBudget', () => {
    it('should create a new budget request', async () => {
      const newQuoteData: CreateQuoteData = {
        eventId: 'event-1',
        supplierId: 'supplier-1',
        organizerId: 'org-1',
        message: 'Need DJ services for wedding',
      };

      const mockResponse = {
        success: true,
        message: 'Budget created successfully',
        data: { ...mockQuote, ...newQuoteData, id: '2' },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await quoteService.createBudget(newQuoteData);

      expect(api.apiRequest).toHaveBeenCalledWith('/budgets', {
        method: 'POST',
        body: JSON.stringify(newQuoteData),
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should create budget with detailed message', async () => {
      const detailedQuoteData: CreateQuoteData = {
        eventId: 'event-2',
        supplierId: 'supplier-2',
        organizerId: 'org-1',
        message: 'Looking for a photographer for corporate event. Need 8 hours coverage, edited photos within 2 weeks.',
      };

      const mockResponse = {
        success: true,
        message: 'Budget created successfully',
        data: { ...mockQuote, ...detailedQuoteData, id: '3' },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await quoteService.createBudget(detailedQuoteData);

      expect(api.apiRequest).toHaveBeenCalledWith('/budgets', {
        method: 'POST',
        body: JSON.stringify(detailedQuoteData),
      });
      expect(result.message).toBe(detailedQuoteData.message);
    });

    it('should handle creation errors', async () => {
      const quoteData: CreateQuoteData = {
        eventId: 'event-1',
        supplierId: 'supplier-1',
        organizerId: 'org-1',
        message: 'Test message',
      };

      vi.mocked(api.apiRequest).mockRejectedValue(new Error('Creation failed'));

      await expect(quoteService.createBudget(quoteData)).rejects.toThrow('Creation failed');
    });
  });

  describe('updateBudget', () => {
    it('should update budget status', async () => {
      const updateData: UpdateQuoteData = {
        status: 'RESPONDED',
        response: 'We can provide the service',
        price: 5000,
      };

      const mockResponse = {
        success: true,
        message: 'Budget updated successfully',
        data: { ...mockQuote, ...updateData },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await quoteService.updateBudget('1', updateData);

      expect(api.apiRequest).toHaveBeenCalledWith('/budgets/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(mockResponse.data);
      expect(result.status).toBe('RESPONDED');
      expect(result.price).toBe(5000);
    });

    it('should update only status to ACCEPTED', async () => {
      const updateData: UpdateQuoteData = {
        status: 'ACCEPTED',
      };

      const mockResponse = {
        success: true,
        message: 'Budget accepted',
        data: { ...mockQuote, status: 'ACCEPTED' },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await quoteService.updateBudget('1', updateData);

      expect(api.apiRequest).toHaveBeenCalledWith('/budgets/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      expect(result.status).toBe('ACCEPTED');
    });

    it('should update only status to REJECTED', async () => {
      const updateData: UpdateQuoteData = {
        status: 'REJECTED',
      };

      const mockResponse = {
        success: true,
        message: 'Budget rejected',
        data: { ...mockQuote, status: 'REJECTED' },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await quoteService.updateBudget('1', updateData);

      expect(result.status).toBe('REJECTED');
    });

    it('should update only response and price', async () => {
      const updateData: UpdateQuoteData = {
        response: 'Available for the date, price includes setup and breakdown',
        price: 8500,
      };

      const mockResponse = {
        success: true,
        message: 'Budget updated successfully',
        data: { ...mockQuote, ...updateData, status: 'RESPONDED' },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await quoteService.updateBudget('1', updateData);

      expect(result.response).toBe(updateData.response);
      expect(result.price).toBe(8500);
    });

    it('should handle update errors', async () => {
      const updateData: UpdateQuoteData = {
        status: 'ACCEPTED',
      };

      vi.mocked(api.apiRequest).mockRejectedValue(new Error('Update failed'));

      await expect(quoteService.updateBudget('1', updateData)).rejects.toThrow('Update failed');
    });
  });
});
