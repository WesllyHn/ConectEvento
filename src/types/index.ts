export interface User {
  id: string;
  name: string;
  email: string;
  type: 'organizer' | 'supplier' | 'ORGANIZER' | 'SUPPLIER';
  avatar?: string;
  createdAt: string;
  companyName?: string;
  cnpjOrCpf?: string;
  description?: string;
  location?: string;
  priceRange?: 'budget' | 'mid' | 'premium' | 'BUDGET' | 'MID' | 'PREMIUM';
  services?: Services[];
  portfolio?: string[];
  availability?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface Event {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  budget: string;
  description: string;
  organizerId: string;
  status: 'planning' | 'confirmed' | 'completed' | 'PLANNING' | 'CONFIRMED' | 'COMPLETED';
}

export interface QuoteRequest {
  id: string;
  eventId: string;
  supplierId: string;
  organizerId: string;
  message: string;
  status: 'pending' | 'responded' | 'accepted' | 'rejected';
  createdAt: string;
  response?: string;
  price?: number;
}

export interface Review {
  id: string;
  supplierId: string;
  organizerId: string;
  eventId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Supplier extends User {
  type: 'SUPPLIER';
  companyName: string;
  description: string;
  services: Services[];
  location: string;
  priceRange: 'budget' | 'mid' | 'premium';
  rating: number;
  reviewCount: number;
  portfolio: string[];
  availability: boolean;
  cnpj?: string;
  address?: string;
}

export interface Services {
  id: string;
  servies: string;
  supplierId: string;
}