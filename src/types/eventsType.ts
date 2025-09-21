// Enums (ajuste para refletir seu schema/Prisma)
export type EventType = 'WEDDING' | string;
export type EventStatus = 'PLANNING' | string;

// Item
export interface EventDTO {
  id: string;
  title: string;
  type: EventType;
  date: string;           // ISO string
  location: string;
  budget: string;         // ex.: "15000" ou "R$ 50.000 - R$ 80.000"
  description?: string | null;
  status: EventStatus;
  organizerId: string;
  guestCount?: number | null;
  createdAt: string;      // ISO string
  updatedAt: string;      // ISO string
  quoteRequests: unknown[];
  reviews: unknown[];
}

// Paginação
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Envelope genérico para qualquer resposta com `data`
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Payload específico dessa rota
export interface OrganizerEventsPayload {
  events: EventDTO[];
  pagination: Pagination;
}

// Resposta tipada da rota
export type GetOrganizerEventsResponse = ApiResponse<OrganizerEventsPayload>;
