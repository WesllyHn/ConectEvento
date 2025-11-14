import { apiRequest } from './api';

export interface CreateQuoteData {
  eventId: string;
  supplierId: string;
  organizerId: string;
  message: string;
}

export interface UpdateQuoteData {
  status?: 'PENDING' | 'RESPONDED' | 'ACCEPTED' | 'REJECTED';
  response?: string;
  price?: number;
}

class QuoteService {
  async getBudgetsByUserId(userId: string): Promise<any[]> {
    const response = await apiRequest(`/budgets?id=${userId}`);
    return response.data;
  }

  async createBudget(quoteData: CreateQuoteData): Promise<any> {
    const response = await apiRequest('/budgets', {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });
    return response.data;
  }

  async updateBudget(budgetId: string, updateData: UpdateQuoteData): Promise<any> {
    const response = await apiRequest(`/budgets/${budgetId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return response.data;
  }
}

export const quoteService = new QuoteService();