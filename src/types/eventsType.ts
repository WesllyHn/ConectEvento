export type EventType = 'WEDDING' | string;
export type EventStatus = 'PLANNING' | string;

export interface EventDTO {
  id: string;
  title: string;
  type: EventType;
  date: string;
  location: string;
  budget: string;
  description?: string | null;
  status: EventStatus;
  organizerId: string;
  guestCount?: number | null;
  createdAt: string;
  updatedAt: string;
  quoteRequests: unknown[];
  reviews: unknown[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface OrganizerEventsPayload {
  events: EventDTO[];
  pagination: Pagination;
}

export type GetOrganizerEventsResponse = ApiResponse<OrganizerEventsPayload>;
