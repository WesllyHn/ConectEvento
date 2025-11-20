import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Suppliers } from '../Suppliers';
import * as userService from '../../services/userService';
import * as uploadService from '../../services/uploadService';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', name: 'Test User' },
  }),
}));

vi.mock('../../services/userService');
vi.mock('../../services/uploadService');

describe('Suppliers', () => {
  const mockSuppliers = [
    {
      id: '1',
      name: 'Buffet Delícia',
      companyName: 'Buffet Delícia Ltda',
      description: 'Buffet completo',
      location: 'São Paulo, SP',
      services: [{ service: 'Buffet' }, { service: 'Coquetel' }],
      rating: 4.8,
      reviewCount: 125,
      priceRange: 'MID',
      availability: true,
      portfolio: [{ id: 'img1' }],
    },
    {
      id: '2',
      name: 'DJ Sound',
      companyName: 'DJ Sound',
      description: 'Som profissional',
      location: 'Rio de Janeiro, RJ',
      services: [{ service: 'DJ' }, { service: 'Som' }],
      rating: 4.9,
      reviewCount: 98,
      priceRange: 'PREMIUM',
      availability: true,
      portfolio: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.userService.getSuppliers).mockResolvedValue(mockSuppliers);
    vi.mocked(uploadService.uploadService.getImageUrl).mockReturnValue('https://example.com/image.jpg');
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Suppliers />
      </MemoryRouter>
    );
  };

  it('should render page title and description', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Fornecedores')).toBeInTheDocument();
      expect(screen.getByText('Encontre os melhores fornecedores para seu evento')).toBeInTheDocument();
    });
  });

  it('should load and display suppliers', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet Delícia Ltda')).toBeInTheDocument();
      expect(screen.getByText('DJ Sound')).toBeInTheDocument();
    });

    expect(userService.userService.getSuppliers).toHaveBeenCalled();
  });

  it('should display supplier details', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet completo')).toBeInTheDocument();
      expect(screen.getByText('São Paulo, SP')).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('(125 avaliações)')).toBeInTheDocument();
    });
  });

  it('should filter suppliers by search query', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet Delícia Ltda')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar...');
    await user.type(searchInput, 'DJ');

    await waitFor(() => {
      expect(screen.queryByText('Buffet Delícia Ltda')).not.toBeInTheDocument();
      expect(screen.getByText('DJ Sound')).toBeInTheDocument();
    });
  });

  it('should filter suppliers by location', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet Delícia Ltda')).toBeInTheDocument();
    });

    const locationInput = screen.getByPlaceholderText('Localização...');
    await user.type(locationInput, 'Rio de Janeiro');

    await waitFor(() => {
      expect(screen.queryByText('Buffet Delícia Ltda')).not.toBeInTheDocument();
      expect(screen.getByText('DJ Sound')).toBeInTheDocument();
    });
  });

  it('should display result count', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('fornecedores encontrados')).toBeInTheDocument();
    });
  });

  it('should show empty state when no suppliers match filters', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet Delícia Ltda')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar...');
    await user.type(searchInput, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByText('Nenhum fornecedor encontrado')).toBeInTheDocument();
    });
  });

  it('should navigate to supplier detail when clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet Delícia Ltda')).toBeInTheDocument();
    });

    const supplierCard = screen.getByText('Buffet Delícia Ltda').closest('.cursor-pointer');
    if (supplierCard) {
      await user.click(supplierCard);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/supplier/1');
  });

  it('should display price range badges', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Intermediário')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });
  });

  it('should display availability status', async () => {
    renderComponent();

    await waitFor(() => {
      const availableBadges = screen.getAllByText('✓ Disponível');
      expect(availableBadges.length).toBe(2);
    });
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(userService.userService.getSuppliers).mockRejectedValue(new Error('API Error'));
    
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('Buffet Delícia Ltda')).not.toBeInTheDocument();
    });
  });
});