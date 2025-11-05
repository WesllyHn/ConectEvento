export interface Event {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  budget: string;
  status: string;
  organizerId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  description: string;
  priceRange: string;
}

export interface QuoteRequest {
  id: string;
  eventId: string;
  supplierId: string;
  status: string;
  organizerId?: string;
  createdAt: string;
  message?: string;
  response?: string;
  price?: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
}

export interface DetailedReview {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
}

export interface CompletedService {
  id: string;
  name: string;
  date: string;
}

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Casamento Maria e João',
    type: 'WEDDING',
    date: '2024-12-15',
    location: 'São Paulo, SP',
    budget: '20000+',
    status: 'planning',
    organizerId: '1'
  }
];

export const mockSuppliers: Supplier[] = [];


export const mockQuoteRequests: QuoteRequest[] = [];

export const mockReviews: Review[] = [];

export const mockDetailedReviews: DetailedReview[] = [];

export const mockCompletedServices: CompletedService[] = [];

export const eventTypes = [
  { label: 'Casamento', value: 'WEDDING' },
  { label: 'Aniversário', value: 'BIRTHDAY' },
  { label: 'Corporativo', value: 'CORPORATE' },
  { label: 'Formatura', value: 'GRADUATION' },
  { label: 'Outro', value: 'OTHER' }
];

export const budgetRanges = ['0-5000', '5000-10000', '10000-20000', '20000+'];

export const serviceOptions = ['Catering', 'Fotografia', 'Decoração', 'Música', 'Outros'];

export const mockOrganizerStats = {
  totalEvents: 0,
  activeQuotes: 0,
  completedEvents: 0,
};

export const mockSupplierStats = {
  totalQuotes: 0,
  acceptedQuotes: 0,
  rating: 0,
};
