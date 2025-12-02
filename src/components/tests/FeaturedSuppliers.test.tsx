import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as userService from '../../services/userService';
import * as uploadService from '../../services/uploadService';

const mockNavigate = vi.fn();
const mockIsAuthenticated = { value: false };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated.value,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    signup: vi.fn(),
  }),
}));

vi.mock('../../services/userService', () => ({
  userService: {
    getSuppliers: vi.fn(),
  },
}));

vi.mock('../../services/uploadService', () => ({
  uploadService: {
    getImageUrl: vi.fn(),
  },
}));

import { FeaturedSuppliers } from '../FeaturedSuppliers';

describe('FeaturedSuppliers', () => {
  const mockSuppliers = [
    {
      id: '1',
      name: 'Buffet Delícia',
      companyName: 'Buffet Delícia Ltda',
      location: 'São Paulo, SP',
      description: 'Buffet completo para eventos corporativos e festas',
      services: [{ service: 'Buffet Completo' }, { service: 'Coquetel' }, { service: 'Coffee Break' }],
      rating: 4.8,
      reviewCount: 125,
      priceRange: 'MID',
      avatar: null,
      portfolio: [
        { id: 'img1', imageData: [], mimeType: 'image/jpeg' },
        { id: 'img2', imageData: [], mimeType: 'image/jpeg' },
      ],
      availability: true,
      createdAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'DJ Premium Sound',
      companyName: 'DJ Premium Sound',
      location: 'Rio de Janeiro, RJ',
      description: 'Som profissional e iluminação para todos os tipos de eventos',
      services: [{ service: 'DJ' }, { service: 'Som' }, { service: 'Iluminação' }],
      rating: 4.9,
      reviewCount: 98,
      priceRange: 'PREMIUM',
      avatar: null,
      portfolio: [],
      availability: true,
      createdAt: '2025-01-02T00:00:00.000Z',
    },
    {
      id: '3',
      name: 'Decorações Encanto',
      companyName: 'Decorações Encanto',
      location: 'Curitiba, PR',
      description: 'Decoração temática e personalizada para seu evento',
      services: [{ service: 'Decoração' }, { service: 'Flores' }],
      rating: 4.7,
      reviewCount: 87,
      priceRange: 'BUDGET',
      avatar: null,
      portfolio: [],
      availability: true,
      createdAt: '2025-01-03T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated.value = false;
    
    vi.mocked(userService.userService.getSuppliers).mockResolvedValue(mockSuppliers);
    vi.mocked(uploadService.uploadService.getImageUrl).mockReturnValue('https://example.com/image.jpg');
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <FeaturedSuppliers />
      </MemoryRouter>
    );
  };

  it('should render loading state initially', () => {
    renderComponent();

    const { container } = render(
      <MemoryRouter>
        <FeaturedSuppliers />
      </MemoryRouter>
    );
    
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should load and display suppliers', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet Delícia Ltda')).toBeInTheDocument();
      expect(screen.getByText('DJ Premium Sound')).toBeInTheDocument();
      expect(screen.getByText('Decorações Encanto')).toBeInTheDocument();
    });

    expect(userService.userService.getSuppliers).toHaveBeenCalled();
  });

  it('should render section title correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Profissionais em Destaque')).toBeInTheDocument();
    });
  });

  it('should render section subtitle correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/Conheça os fornecedores mais bem avaliados e contratados da plataforma/i)
      ).toBeInTheDocument();
    });
  });

  it('should render supplier locations', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('São Paulo, SP')).toBeInTheDocument();
      expect(screen.getByText('Rio de Janeiro, RJ')).toBeInTheDocument();
      expect(screen.getByText('Curitiba, PR')).toBeInTheDocument();
    });
  });

  it('should render supplier descriptions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet completo para eventos corporativos e festas')).toBeInTheDocument();
      expect(screen.getByText('Som profissional e iluminação para todos os tipos de eventos')).toBeInTheDocument();
      expect(screen.getByText('Decoração temática e personalizada para seu evento')).toBeInTheDocument();
    });
  });

  it('should render supplier ratings', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('4.9')).toBeInTheDocument();
      expect(screen.getByText('4.7')).toBeInTheDocument();
    });
  });

  it('should render supplier review counts', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('125 avaliações')).toBeInTheDocument();
      expect(screen.getByText('98 avaliações')).toBeInTheDocument();
      expect(screen.getByText('87 avaliações')).toBeInTheDocument();
    });
  });

  it('should render price range badges correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Intermediário')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Econômico')).toBeInTheDocument();
    });
  });

  it('should navigate to login with return path when clicking supplier card while not authenticated', async () => {
    const user = userEvent.setup();
    mockIsAuthenticated.value = false;
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet Delícia Ltda')).toBeInTheDocument();
    });

    const supplierCard = screen.getByText('Buffet Delícia Ltda').closest('[role="button"]');
    if (supplierCard) {
      await user.click(supplierCard);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { returnTo: '/supplier/1' } });
  });

  it('should navigate to supplier detail when clicking supplier card while authenticated', async () => {
    const user = userEvent.setup();
    mockIsAuthenticated.value = true;
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet Delícia Ltda')).toBeInTheDocument();
    });

    const supplierCard = screen.getByText('Buffet Delícia Ltda').closest('[role="button"]');
    if (supplierCard) {
      await user.click(supplierCard);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/supplier/1');
  });

  it('should render error state when API fails', async () => {
    vi.mocked(userService.userService.getSuppliers).mockRejectedValue(new Error('API Error'));
    
    renderComponent();

    // Aguarda até 4 tentativas de retry (cada uma com delays exponenciais)
    // Tentativa 1: imediato
    // Tentativa 2: após 1s
    // Tentativa 3: após 2s
    // Tentativa 4: após 4s
    // Total: aproximadamente 7-8 segundos
    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Ops! Algo deu errado';
      })).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('should show retry button on error', async () => {
    vi.mocked(userService.userService.getSuppliers).mockRejectedValue(new Error('API Error'));
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Tentar novamente';
      })).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('should render empty state when no suppliers available', async () => {
    vi.mocked(userService.userService.getSuppliers).mockResolvedValue([]);
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Nenhum fornecedor em destaque')).toBeInTheDocument();
    });
  });

  it('should render star icons for ratings', async () => {
    const { container } = renderComponent();

    await waitFor(() => {
      const starIcons = container.querySelectorAll('svg');
      expect(starIcons.length).toBeGreaterThan(0);
    });
  });

  it('should render services badges', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet Completo')).toBeInTheDocument();
      expect(screen.getByText('DJ')).toBeInTheDocument();
      expect(screen.getByText('Decoração')).toBeInTheDocument();
    });
  });

  it('should render "Ver perfil" link for each supplier', async () => {
    renderComponent();

    await waitFor(() => {
      const verPerfilLinks = screen.getAllByText('Ver perfil');
      expect(verPerfilLinks.length).toBe(3);
    });
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    mockIsAuthenticated.value = true;
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet Delícia Ltda')).toBeInTheDocument();
    });

    const supplierCard = screen.getByText('Buffet Delícia Ltda').closest('[role="button"]');
    if (supplierCard) {
      supplierCard.focus();
      await user.keyboard('{Enter}');
    }

    expect(mockNavigate).toHaveBeenCalledWith('/supplier/1');
  });

  it('should display badge with platform name', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Destaques do ConectEvento')).toBeInTheDocument();
    });
  });
});