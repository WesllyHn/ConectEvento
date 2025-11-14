import { apiRequest } from './api';

type EventType = 'WEDDING' | 'BIRTHDAY' | 'CORPORATE' | 'GRADUATION' | 'OTHER';
type EventStatus = 'PLANNING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Event {
  id: string;
  title: string;
  type: EventType;
  date: string;
  location: string;
  budget: string;
  description?: string;
  guestCount?: number;
  status: EventStatus;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  type: EventType;
  date: string;
  location: string;
  budget: string;
  description?: string;
  guestCount?: number;
  organizerId: string;
}

export interface UpdateEventData {
  title?: string;
  type?: EventType;
  date?: string;
  location?: string;
  budget?: string;
  description?: string;
  guestCount?: number;
  status?: EventStatus;
}

class EventService {
  async getEventById(eventId: string): Promise<Event> {
    const response = await apiRequest(`/events/${eventId}`);
    return response.data;
  }

  async getEventsByOrganizerId(organizerId: string): Promise<Event[]> {
    const response = await apiRequest(`/events/organizer/${organizerId}`);
    return response.data;
  }

  async createEvent(eventData: CreateEventData): Promise<Event> {
    const response = await apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    return response.data;
  }

  async updateEvent(eventId: string, eventData: UpdateEventData): Promise<Event> {
    const response = await apiRequest(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
    return response.data;
  }

  async updateEventStatus(eventId: string, status: EventStatus): Promise<Event> {
    const response = await apiRequest(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response.data;
  }

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    return this.getEventsByOrganizerId(organizerId);
  }
}

export const eventService = new EventService();
