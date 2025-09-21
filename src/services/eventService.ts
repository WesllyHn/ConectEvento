import { apiRequest } from './api';
import { Event } from '../types';

export interface CreateEventData {
  title: string;
  type: 'WEDDING' | 'BIRTHDAY' | 'CORPORATE' | 'GRADUATION' | 'BAPTISM' | 'BABY_SHOWER' | 'BRIDAL_SHOWER' | 'ENGAGEMENT' | 'KIDS_PARTY' | 'OTHER';
  date: string;
  location: string;
  budget: string;
  description: string;
  organizerId: string;
  guestCount: number;
}

export interface UpdateEventData {
  title?: string;
  type?: 'WEDDING' | 'BIRTHDAY' | 'CORPORATE' | 'GRADUATION' | 'OTHER';
  date?: string;
  location?: string;
  budget?: string;
  description?: string;
}

export interface EventFilters {
  type?: string;
  status?: 'PLANNING' | 'CONFIRMED' | 'COMPLETED';
  page?: number;
  limit?: number;
}

class EventService {
  // Buscar todos os eventos
  // async getAllEvents(): Promise<Event[]> {
  //   return apiRequest('/events');
  // }

  // // Buscar evento por ID
  // async getEventById(eventId: string): Promise<Event> {
  //   return apiRequest(`/events/${eventId}`);
  // }

  // Criar novo evento
  async createEvent(eventData: CreateEventData): Promise<Event> {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  // Atualizar evento
  async updateEvent(eventId: string, eventData: UpdateEventData): Promise<Event> {
    return apiRequest(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  // Atualizar status do evento
  async updateEventStatus(eventId: string, status: 'PLANNING' | 'CONFIRMED' | 'COMPLETED'): Promise<Event> {
    return apiRequest(`/events/${eventId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Deletar evento
  async deleteEvent(eventId: string): Promise<void> {
    return apiRequest(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // Buscar eventos por organizador
  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    return apiRequest(`/events/organizer/${organizerId}`);
  }

  // Buscar eventos por tipo
  async getEventsByType(type: string): Promise<Event[]> {
    return apiRequest(`/events/type/${type}`);
  }

  // Buscar eventos com filtros
  async getEventsWithFilters(filters: EventFilters): Promise<Event[]> {
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/events?${queryString}` : '/events';
    
    return apiRequest(endpoint);
  }
}

export const eventService = new EventService();