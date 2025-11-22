import { apiRequest } from './api';

export interface CreateReviewData {
  supplierId: string;
  organizerId: string;
  eventId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewResponse {
  response: string;
  responseDate: string;
}

class ReviewService {
  async getSuppliersToReview(organizerId: string): Promise<any[]> {
    const response = await apiRequest(`/reviews/organizadorId/${organizerId}`);
    return response.data;
  }

  async getReviewsByUserId(userId: string, type: 'ORGANIZER' | 'SUPPLIER'): Promise<any[]> {
    const response = await apiRequest(`/reviews/${userId}?type=${type}`);
    return response.data;
  }

  async createReview(reviewData: CreateReviewData): Promise<any> {
    const response = await apiRequest('/reviews/', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
    return response.data;
  }

  async respondToReview(reviewId: string, responseData: UpdateReviewResponse): Promise<any> {
    const response = await apiRequest(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(responseData),
    });
    return response.data;
  }
}

export const reviewService = new ReviewService();