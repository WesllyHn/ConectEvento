import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventService, Event, CreateEventData, UpdateEventData } from './eventService';
import * as api from './api';

vi.mock('./api');

describe('eventService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEvent: Event = {
    id: '1',
    title: 'Test Wedding',
    type: 'WEDDING',
    date: '2025-12-31',
    location: 'São Paulo',
    budget: 'R$ 20.000 - R$ 50.000',
    description: 'Beautiful wedding',
    guestCount: 150,
    status: 'PLANNING',
    organizerId: 'org-1',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  describe('getEventsByOrganizerId', () => {
    it('should fetch events by organizer ID', async () => {
      const mockResponse = {
        success: true,
        message: 'Events retrieved successfully',
        data: [mockEvent],
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await eventService.getEventsByOrganizerId('org-1');

      expect(api.apiRequest).toHaveBeenCalledWith('/events/organizer/org-1');
      expect(result).toEqual([mockEvent]);
    });

    it('should handle API errors', async () => {
      vi.mocked(api.apiRequest).mockRejectedValue(new Error('API Error'));

      await expect(eventService.getEventsByOrganizerId('org-1')).rejects.toThrow('API Error');
    });
  });

  describe('getEventsByOrganizer', () => {
    it('should call getEventsByOrganizerId', async () => {
      const mockResponse = {
        success: true,
        message: 'Events retrieved successfully',
        data: [mockEvent],
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await eventService.getEventsByOrganizer('org-1');

      expect(api.apiRequest).toHaveBeenCalledWith('/events/organizer/org-1');
      expect(result).toEqual([mockEvent]);
    });
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const newEventData: CreateEventData = {
        title: 'New Wedding',
        type: 'WEDDING',
        date: '2025-12-31',
        location: 'Rio de Janeiro',
        budget: 'R$ 20.000 - R$ 50.000',
        description: 'Amazing wedding',
        guestCount: 200,
        organizerId: 'org-1',
      };

      const mockResponse = {
        success: true,
        message: 'Event created successfully',
        data: { ...mockEvent, ...newEventData, id: '2' },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await eventService.createEvent(newEventData);

      expect(api.apiRequest).toHaveBeenCalledWith('/events', {
        method: 'POST',
        body: JSON.stringify(newEventData),
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should create event without optional fields', async () => {
      const minimalEventData: CreateEventData = {
        title: 'Simple Event',
        type: 'BIRTHDAY',
        date: '2025-06-15',
        location: 'Belo Horizonte',
        budget: 'R$ 5.000 - R$ 10.000',
        organizerId: 'org-2',
      };

      const mockResponse = {
        success: true,
        message: 'Event created successfully',
        data: { ...mockEvent, ...minimalEventData, id: '3' },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await eventService.createEvent(minimalEventData);

      expect(api.apiRequest).toHaveBeenCalledWith('/events', {
        method: 'POST',
        body: JSON.stringify(minimalEventData),
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle creation errors', async () => {
      const newEventData: CreateEventData = {
        title: 'Error Event',
        type: 'CORPORATE',
        date: '2025-08-20',
        location: 'Brasília',
        budget: 'R$ 10.000 - R$ 20.000',
        organizerId: 'org-1',
      };

      vi.mocked(api.apiRequest).mockRejectedValue(new Error('Creation failed'));

      await expect(eventService.createEvent(newEventData)).rejects.toThrow('Creation failed');
    });
  });

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      const updateData: UpdateEventData = {
        title: 'Updated Wedding',
        status: 'CONFIRMED',
        guestCount: 180,
      };

      const mockResponse = {
        success: true,
        message: 'Event updated successfully',
        data: { ...mockEvent, ...updateData },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await eventService.updateEvent('1', updateData);

      expect(api.apiRequest).toHaveBeenCalledWith('/events/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should update only status', async () => {
      const updateData: UpdateEventData = {
        status: 'COMPLETED',
      };

      const mockResponse = {
        success: true,
        message: 'Event updated successfully',
        data: { ...mockEvent, status: 'COMPLETED' },
      };

      vi.mocked(api.apiRequest).mockResolvedValue(mockResponse);

      const result = await eventService.updateEvent('1', updateData);

      expect(api.apiRequest).toHaveBeenCalledWith('/events/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      expect(result.status).toBe('COMPLETED');
    });

    it('should handle update errors', async () => {
      const updateData: UpdateEventData = {
        title: 'Failed Update',
      };

      vi.mocked(api.apiRequest).mockRejectedValue(new Error('Update failed'));

      await expect(eventService.updateEvent('1', updateData)).rejects.toThrow('Update failed');
    });
  });
});
