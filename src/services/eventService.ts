import { apiRequest } from './api';

export interface Event {
  id: string;
  title: string;
  type: 'WEDDING' | 'BIRTHDAY' | 'CORPORATE' | 'GRADUATION' | 'OTHER';
  date: string;
  location: string;
  budget: string;
  description?: string;
  guestCount?: number;
  status: 'PLANNING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  type: 'WEDDING' | 'BIRTHDAY' | 'CORPORATE' | 'GRADUATION' | 'OTHER';
  date: string;
  location: string;
  budget: string;
  description?: string;
  guestCount?: number;
  organizerId: string;
}

export interface UpdateEventData {
  title?: string;
  type?: 'WEDDING' | 'BIRTHDAY' | 'CORPORATE' | 'GRADUATION' | 'OTHER';
  date?: string;
  location?: string;
  budget?: string;
  description?: string;
  guestCount?: number;
  status?: 'PLANNING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

class EventService {
  async getEventById(eventId: string): Promise<Event> {
    const response = await apiRequest(`/events/${eventId}`) as any;
    return response.data;
  }

  async getEventsByOrganizerId(organizerId: string): Promise<Event[]> {
    const response = await apiRequest(`/events/organizer/${organizerId}`) as any;
    return response.data;
  }

  async createEvent(eventData: CreateEventData): Promise<Event> {
    const response = await apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }) as any;
    return response.data;
  }

  async updateEvent(eventId: string, eventData: UpdateEventData): Promise<Event> {
    const response = await apiRequest(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }) as any;
    return response.data;
  }

  async updateEventStatus(eventId: string, status: 'PLANNING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'): Promise<Event> {
    const response = await apiRequest(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }) as any;
    return response.data;
  }

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    return this.getEventsByOrganizerId(organizerId);
  }
}

export const eventService = new EventService();
