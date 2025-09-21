import { Supplier, Event, QuoteRequest, Review } from '../types';

export const mockSuppliers: Supplier[] = [
  {
    id: 'cmfsznwce0006ogugwty30n5a',
    name: 'Buffet Elegância',
    email: 'teste3@gmail.com',
    type: 'supplier',
    companyName: 'Buffet Elegância Ltda',
    description: 'Especializados em casamentos e eventos corporativos há mais de 15 anos. Oferecemos cardápios personalizados e decoração completa.',
    services: ['Buffet', 'Decoração', 'Garçons'],
    location: 'São Paulo, SP',
    priceRange: 'premium',
    rating: 0,
    reviewCount: 0,
    portfolio: [
      'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg',
      'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg',
      'https://images.pexels.com/photos/1709447/pexels-photo-1709447.jpeg'
    ],
    availability: true,
    avatar: '',
    createdAt: '2023-01-10'
  },
  {
    id: '2',
    name: 'DJ Music Pro',
    email: 'contato@djmusicpro.com',
    type: 'supplier',
    companyName: 'DJ Music Pro',
    description: 'Som, iluminação e animação para todos os tipos de eventos. Equipamentos de última geração e DJs especializados.',
    services: ['DJ', 'Som e Iluminação', 'Animação'],
    location: 'Rio de Janeiro, RJ',
    priceRange: 'mid',
    rating: 0,
    reviewCount: 0,
    portfolio: [
      'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
      'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg'
    ],
    availability: true,
    avatar: '',
    createdAt: '2023-02-15'
  },
  {
    id: '3',
    name: 'Flores & Decoração',
    email: 'contato@floresdecoração.com',
    type: 'supplier',
    companyName: 'Flores & Decoração ME',
    description: 'Especialistas em decoração floral e ambientação para casamentos, formaturas e eventos sociais.',
    services: ['Decoração Floral', 'Ambientação', 'Buquês'],
    location: 'Belo Horizonte, MG',
    priceRange: 'mid',
    rating: 0,
    reviewCount: 0,
    portfolio: [
      'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg',
      'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'
    ],
    availability: true,
    avatar: '',
    createdAt: '2023-03-20'
  }
];

// Adicionar fornecedor para o usuário logado
if (typeof window !== 'undefined') {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  if (currentUser.type === 'supplier' && !mockSuppliers.find(s => s.id === currentUser.id)) {
    mockSuppliers.push({
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      type: 'supplier',
      companyName: 'Minha Empresa',
      description: 'Descrição da minha empresa de eventos.',
      services: ['Buffet', 'Decoração'],
      location: 'São Paulo, SP',
      priceRange: 'mid',
      rating: 0,
      reviewCount: 0,
      portfolio: [],
      availability: true,
      avatar: currentUser.avatar || '',
      createdAt: currentUser.createdAt
    });
  }
}

export const mockEvents: Event[] = [
  {
    id: 'cmflta1uw000dogs5m7dzaqo1',
    title: 'Casamento da Maria e João',
    type: 'Casamento',
    date: '2024-06-15',
    location: 'São Paulo, SP',
    budget: 'R$ 50.000 - R$ 80.000',
    description: 'Casamento para 150 pessoas em local fechado.',
    organizerId: '1',
    status: 'planning'
  },
  {
    id: 'cmfltb0r1000fogs5qvugn87a',
    title: 'Aniversário de 50 anos',
    type: 'Aniversário',
    date: '2024-07-20',
    location: 'Rio de Janeiro, RJ',
    budget: 'R$ 15.000 - R$ 25.000',
    description: 'Festa de aniversário para 80 pessoas.',
    organizerId: '1',
    status: 'confirmed'
  },
  {
    id: '3',
    title: 'Evento Corporativo - Lançamento',
    type: 'Corporativo',
    date: '2024-08-10',
    location: 'São Paulo, SP',
    budget: 'R$ 30.000 - R$ 45.000',
    description: 'Evento de lançamento de produto para 200 pessoas.',
    organizerId: '1',
    status: 'planning'
  }
];

export const mockQuoteRequests: QuoteRequest[] = [
  {
    id: '1',
    eventId: '1',
    supplierId: 'cmfsznwce0006ogugwty30n5a',
    organizerId: '1',
    message: 'Gostaria de um orçamento de um buffet completo para 150 pessoas.',
    status: 'responded',
    createdAt: '2025-08-20',
    response: 'Olá! Temos disponibilidade para sua data. O valor seria R$ 35.000 incluindo decoração.',
    price: 35000
  },
  {
    id: '1',
    eventId: '1',
    supplierId: 'cmfsznwce0006ogugwty30n5a',
    organizerId: '2',
    message: 'teste de solicitação de orçamento.',
    status: 'pending',
    createdAt: '2025-08-20',
    // response: 'Olá! Temos disponibilidade para sua data. O valor seria R$ 35.000 incluindo decoração.',
    // price: 35000
  },
  {
    id: '2',
    eventId: '2',
    supplierId: '2',
    organizerId: '1',
    message: 'Preciso de DJ e som para festa de aniversário de 80 pessoas.',
    status: 'pending',
    createdAt: '2025-08-22'
  },
  {
    id: '3',
    eventId: '1',
    supplierId: '3',
    organizerId: '1',
    message: 'Orçamento para decoração floral completa do casamento.',
    status: 'accepted',
    createdAt: '2025-08-18',
    response: 'Perfeito! Podemos fazer toda a decoração floral. Valor: R$ 8.500',
    price: 8500
  }
];

export const mockReviews: Review[] = [
  {
    id: '1',
    supplierId: 'cmfsznwce0006ogugwty30n5a',
    organizerId: '1',
    eventId: '1',
    rating: 5,
    comment: 'Serviço excepcional! Superou todas as expectativas.',
    createdAt: '2025-08-25'
  },
  {
    id: '2',
    supplierId: '3',
    organizerId: '1',
    eventId: '1',
    rating: 4,
    comment: 'Decoração linda, mas houve um pequeno atraso na montagem.',
    createdAt: '2025-08-26'
  },
  {
    id: '3',
    supplierId: 'cmfsznwce0006ogugwty30n5a',
    organizerId: '2',
    eventId: '2',
    rating: 5,
    comment: 'Buffet maravilhoso, todos os convidados elogiaram!',
    createdAt: '2025-08-28'
  }
];

// Dados para avaliações detalhadas dos fornecedores
export const mockDetailedReviews = [
  {
    id: '1',
    supplierId: 'cmfsznwce0006ogugwty30n5a',
    organizerName: 'Maria Silva',
    rating: 5,
    comment: 'Serviço excepcional! O buffet estava delicioso e a decoração superou todas as expectativas. A equipe foi muito profissional e pontual.',
    date: '2025-08-25',
    eventType: 'Casamento',
    response: 'Muito obrigado pelo feedback! Foi um prazer trabalhar no seu casamento. Desejamos muita felicidade ao casal!',
    responseDate: '2025-08-26'
  },
  {
    id: '2',
    supplierId: 'cmfsznwce0006ogugwty30n5a',
    organizerName: 'João Santos',
    rating: 4,
    comment: 'Ótimo atendimento e qualidade dos pratos. Apenas alguns pequenos atrasos na montagem, mas no geral muito satisfeito.',
    date: '2025-08-20',
    eventType: 'Aniversário'
  },
  {
    id: '3',
    supplierId: '2',
    organizerName: 'Ana Costa',
    rating: 5,
    comment: 'DJ excelente! Animou a festa toda e tocou exatamente o que pedimos.',
    date: '2025-08-15',
    eventType: 'Formatura',
    response: 'Ficamos muito felizes em saber que ficou satisfeita! Obrigado pela confiança.',
    responseDate: '2025-08-16'
  },
  {
    id: '4',
    supplierId: '3',
    organizerName: 'Carlos Oliveira',
    rating: 4,
    comment: 'Decoração linda, flores frescas e arranjos criativos. Recomendo!',
    date: '2025-08-12',
    eventType: 'Casamento'
  }
];

// Dados para roadmap de eventos
export const mockEventRoadmaps = {
  'Casamento': [
    { id: '1', category: 'Alimentação', name: 'Buffet', status: 'not_started', priority: 'high', estimatedCost: 'R$ 15.000 - R$ 30.000' },
    { id: '2', category: 'Decoração', name: 'Decoração Floral', status: 'not_started', priority: 'high', estimatedCost: 'R$ 3.000 - R$ 8.000' },
    { id: '3', category: 'Entretenimento', name: 'DJ/Banda', status: 'not_started', priority: 'high', estimatedCost: 'R$ 2.000 - R$ 5.000' },
    { id: '4', category: 'Fotografia', name: 'Fotógrafo', status: 'not_started', priority: 'high', estimatedCost: 'R$ 2.500 - R$ 6.000' },
    { id: '5', category: 'Transporte', name: 'Carro dos Noivos', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 500 - R$ 1.500' },
    { id: '6', category: 'Beleza', name: 'Maquiagem e Cabelo', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 800 - R$ 2.000' },
    { id: '7', category: 'Cerimônia', name: 'Celebrante', status: 'not_started', priority: 'high', estimatedCost: 'R$ 800 - R$ 2.500' },
    { id: '8', category: 'Doces', name: 'Bem Casados', status: 'not_started', priority: 'low', estimatedCost: 'R$ 300 - R$ 800' }
  ],
  'Aniversário': [
    { id: '1', category: 'Alimentação', name: 'Buffet/Catering', status: 'not_started', priority: 'high', estimatedCost: 'R$ 3.000 - R$ 10.000' },
    { id: '2', category: 'Decoração', name: 'Decoração Temática', status: 'not_started', priority: 'high', estimatedCost: 'R$ 1.500 - R$ 4.000' },
    { id: '3', category: 'Entretenimento', name: 'DJ/Animação', status: 'not_started', priority: 'high', estimatedCost: 'R$ 800 - R$ 2.500' },
    { id: '4', category: 'Doces', name: 'Bolo Personalizado', status: 'not_started', priority: 'high', estimatedCost: 'R$ 200 - R$ 800' },
    { id: '5', category: 'Fotografia', name: 'Fotógrafo', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 800 - R$ 2.500' },
    { id: '6', category: 'Entretenimento', name: 'Recreação Infantil', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 400 - R$ 1.200' }
  ],
  'Corporativo': [
    { id: '1', category: 'Alimentação', name: 'Coffee Break', status: 'not_started', priority: 'high', estimatedCost: 'R$ 1.000 - R$ 3.000' },
    { id: '2', category: 'Tecnologia', name: 'Som e Projeção', status: 'not_started', priority: 'high', estimatedCost: 'R$ 1.500 - R$ 4.000' },
    { id: '3', category: 'Local', name: 'Auditório/Sala', status: 'not_started', priority: 'high', estimatedCost: 'R$ 2.000 - R$ 8.000' },
    { id: '4', category: 'Materiais', name: 'Material Gráfico', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 500 - R$ 1.500' },
    { id: '5', category: 'Fotografia', name: 'Cobertura Fotográfica', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 800 - R$ 2.000' }
  ],
  'Formatura': [
    { id: '1', category: 'Alimentação', name: 'Jantar de Formatura', status: 'not_started', priority: 'high', estimatedCost: 'R$ 8.000 - R$ 20.000' },
    { id: '2', category: 'Entretenimento', name: 'Banda/DJ', status: 'not_started', priority: 'high', estimatedCost: 'R$ 2.000 - R$ 6.000' },
    { id: '3', category: 'Fotografia', name: 'Fotógrafo', status: 'not_started', priority: 'high', estimatedCost: 'R$ 1.500 - R$ 4.000' },
    { id: '4', category: 'Decoração', name: 'Decoração do Salão', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 2.000 - R$ 5.000' },
    { id: '5', category: 'Cerimônia', name: 'Mestre de Cerimônias', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 800 - R$ 2.000' }
  ]
};

// Dados para fornecedores que já prestaram serviços (para avaliação)
export const mockCompletedServices = [
  {
    id: '1',
    supplierId: 'cmfsznwce0006ogugwty30n5a',
    organizerId: '1',
    eventId: '1',
    supplierName: 'Buffet Elegância',
    supplierAvatar: '',
    services: ['Buffet', 'Decoração'],
    eventType: 'Casamento',
    completedDate: '2025-08-15',
    hasReview: true
  },
  {
    id: '2',
    supplierId: '3',
    organizerId: '1',
    eventId: '1',
    supplierName: 'Flores & Decoração',
    supplierAvatar: '',
    services: ['Decoração Floral'],
    eventType: 'Casamento',
    completedDate: '2025-08-15',
    hasReview: false
  }
];

// Dados para usuários mock (login)
export const mockUsers = [
  {
    id: '1',
    name: 'teste Organizador',
    email: 'teste1@gmail.com',
    type: 'organizer' as const,
    avatar: '',
    createdAt: '2025-08-15'
  },
  {
    id: '2',
    name: 'teste Fornecedor',
    email: 'teste2@gmail.com',
    type: 'supplier' as const,
    avatar: '',
    createdAt: '2025-08-10'
  }
];

// Opções de serviços disponíveis
export const serviceOptions = [
  'Buffet', 'Decoração', 'DJ', 'Som e Iluminação', 'Fotografia', 'Filmagem',
  'Animação', 'Garçons', 'Segurança', 'Limpeza', 'Transporte', 'Floricultura',
  'Bolo e Doces', 'Bebidas', 'Maquiagem', 'Cabelo', 'Celebrante', 'Música ao Vivo'
];

// Tipos de eventos disponíveis
export const eventTypes = [
  'Casamento', 'Aniversário', 'Corporativo', 'Formatura', 'Batizado', 
  'Chá de Bebê', 'Chá de Panela', 'Noivado', 'Festa Infantil', 'Outro'
];

// Faixas de orçamento
export const budgetRanges = [
  'R$ 5.000 - R$ 15.000',
  'R$ 15.000 - R$ 30.000', 
  'R$ 30.000 - R$ 50.000',
  'R$ 50.000 - R$ 80.000',
  'Acima de R$ 80.000'
];

// Dados para estatísticas do dashboard do organizador
export const mockOrganizerStats = {
  totalEvents: 0,
  totalQuotes: 0,
  respondedQuotes: 0,
  pendingQuotes: 0
};

// Dados para estatísticas do dashboard do fornecedor
export const mockSupplierStats = {
  totalRequests: 2,
  pendingRequests: 1,
  respondedRequests: 1,
  acceptedRequests: 1
};