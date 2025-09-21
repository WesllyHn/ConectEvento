import { apiRequest } from './api';
import { Review } from '../types';

export interface CreateReviewData {
  supplierId: string;
  organizerId: string;
  eventId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

class ReviewService {
  // Buscar todas as avaliações
  async getAllReviews(): Promise<Review[]> {
 
    return [];
  }

  // Buscar avaliações por fornecedor
  async getReviewsBySupplier(supplierId: string): Promise<Review[]> {
 
    return [];
  }

  // Buscar avaliações por organizador
  async getReviewsByOrganizer(organizerId: string): Promise<Review[]> {
 
    return [];
  }

  // Criar nova avaliação
  async createReview(reviewData: CreateReviewData): Promise<Review> {
    // Por enquanto simula criação até a API estar implementada
    const newReview: Review = {
      id: Date.now().toString(),
      supplierId: reviewData.supplierId,
      organizerId: reviewData.organizerId,
      eventId: reviewData.eventId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: new Date().toISOString(),
    };
    
    console.log('Review created (mock):', newReview);
    return newReview;
  }

  // Atualizar avaliação
  async updateReview(reviewId: string, updateData: UpdateReviewData): Promise<Review> {
    // Por enquanto simula atualização até a API estar implementada
    console.log('Review updated (mock):', { reviewId, updateData });
    
    return {
      id: reviewId,
      supplierId: '',
      organizerId: '',
      eventId: '',
      rating: updateData.rating || 5,
      comment: updateData.comment || '',
      createdAt: new Date().toISOString(),
    };
  }

  // Deletar avaliação
  async deleteReview(reviewId: string): Promise<void> {
    // Por enquanto simula deleção até a API estar implementada
    console.log('Review deleted (mock):', reviewId);
  }
}

export const reviewService = new ReviewService();