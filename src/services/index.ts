// Exportar todos os services
export { userService } from './userService';
export { eventService } from './eventService';
export { quoteService } from './quoteService';
export { reviewService } from './reviewService';

// Exportar tipos
export type { CreateUserData, UpdateUserData, LoginCredentials } from './userService';
export type { CreateEventData, UpdateEventData, EventFilters } from './eventService';
export type { CreateQuoteData, UpdateQuoteData } from './quoteService';
export type { CreateReviewData, UpdateReviewData } from './reviewService';