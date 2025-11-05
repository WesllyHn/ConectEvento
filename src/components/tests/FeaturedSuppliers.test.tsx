import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockIsAuthenticated = { value: false };

// Mock do react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock do AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated.value,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    signup: vi.fn(),
  }),
}));

// Mock dos dados
vi.mock('../../data/mockData', () => ({
  mockSuppliers: [
    {
      id: '1',
      companyName: 'Buffet Delícia',
      location: 'São Paulo, SP',
      description: 'Buffet completo para eventos corporativos e festas',
      services: ['Buffet Completo', 'Coquetel', 'Coffee Break'],
      rating: 4.8,
      reviewCount: 125,
      priceRange: 'mid',
      avatar: 'https://example.com/avatar1.jpg',
      portfolio: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg', 'https://example.com/img3.jpg'],
    },
    {
      id: '2',
      companyName: 'DJ Premium Sound',
      location: 'Rio de Janeiro, RJ',
      description: 'Som profissional e iluminação para todos os tipos de eventos',
      services: ['DJ', 'Som', 'Iluminação'],
      rating: 4.9,
      reviewCount: 98,
      priceRange: 'premium',
      avatar: 'https://example.com/avatar2.jpg',
      portfolio: ['https://example.com/img4.jpg', 'https://example.com/img5.jpg', 'https://example.com/img6.jpg'],
    },
    {
      id: '3',
      companyName: 'Decorações Encanto',
      location: 'Curitiba, PR',
      description: 'Decoração temática e personalizada para seu evento',
      services: ['Decoração', 'Flores', 'Cenografia'],
      rating: 4.7,
      reviewCount: 87,
      priceRange: 'budget',
      avatar: 'https://example.com/avatar3.jpg',
      portfolio: ['https://example.com/img7.jpg', 'https://example.com/img8.jpg', 'https://example.com/img9.jpg'],
    },
  ],
}));

// Importa o componente DEPOIS dos mocks
import { FeaturedSuppliers } from '../FeaturedSuppliers';

describe('FeaturedSuppliers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated.value = false;
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <FeaturedSuppliers />
      </MemoryRouter>
    );
  };

  it('should render section title correctly', () => {
    renderComponent();

    expect(screen.getByText('Fornecedores em Destaque')).toBeInTheDocument();
  });

  it('should render section subtitle correctly', () => {
    renderComponent();

    expect(
      screen.getByText(/Profissionais com as melhores avaliações e maior experiência no mercado/i)
    ).toBeInTheDocument();
  });

  it('should render exactly 3 featured suppliers', () => {
    renderComponent();

    expect(screen.getByText('Buffet Delícia')).toBeInTheDocument();
    expect(screen.getByText('DJ Premium Sound')).toBeInTheDocument();
    expect(screen.getByText('Decorações Encanto')).toBeInTheDocument();
  });

  it('should render supplier company names', () => {
    renderComponent();

    expect(screen.getByText('Buffet Delícia')).toBeInTheDocument();
    expect(screen.getByText('DJ Premium Sound')).toBeInTheDocument();
    expect(screen.getByText('Decorações Encanto')).toBeInTheDocument();
  });

  it('should render supplier locations', () => {
    renderComponent();

    expect(screen.getByText('São Paulo, SP')).toBeInTheDocument();
    expect(screen.getByText('Rio de Janeiro, RJ')).toBeInTheDocument();
    expect(screen.getByText('Curitiba, PR')).toBeInTheDocument();
  });

  it('should render supplier descriptions', () => {
    renderComponent();

    expect(screen.getByText('Buffet completo para eventos corporativos e festas')).toBeInTheDocument();
    expect(screen.getByText('Som profissional e iluminação para todos os tipos de eventos')).toBeInTheDocument();
    expect(screen.getByText('Decoração temática e personalizada para seu evento')).toBeInTheDocument();
  });

  it('should render supplier services limited to 3', () => {
    renderComponent();

    expect(screen.getByText('Buffet Completo')).toBeInTheDocument();
    expect(screen.getByText('Coquetel')).toBeInTheDocument();
    expect(screen.getByText('Coffee Break')).toBeInTheDocument();
    expect(screen.getByText('DJ')).toBeInTheDocument();
    expect(screen.getByText('Som')).toBeInTheDocument();
    expect(screen.getByText('Iluminação')).toBeInTheDocument();
  });

  it('should render supplier ratings', () => {
    renderComponent();

    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument();
  });

  it('should render supplier review counts', () => {
    renderComponent();

    expect(screen.getByText('(125 avaliações)')).toBeInTheDocument();
    expect(screen.getByText('(98 avaliações)')).toBeInTheDocument();
    expect(screen.getByText('(87 avaliações)')).toBeInTheDocument();
  });

  it('should render price range badges correctly', () => {
    renderComponent();

    expect(screen.getByText('Intermediário')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Econômico')).toBeInTheDocument();
  });

  it('should render lock icon and login text when not authenticated', () => {
    mockIsAuthenticated.value = false;
    renderComponent();

    const loginTexts = screen.getAllByText('Login');
    expect(loginTexts.length).toBe(3);
  });

  it('should not render lock icon when authenticated', () => {
    mockIsAuthenticated.value = true;
    renderComponent();

    const loginTexts = screen.queryAllByText('Login');
    expect(loginTexts.length).toBe(0);
  });

  it('should render "Ver Todos os Fornecedores" button', () => {
    renderComponent();

    expect(screen.getByText('Ver Todos os Fornecedores')).toBeInTheDocument();
  });

  it('should navigate to /suppliers when clicking "Ver Todos" button', async () => {
    const user = userEvent.setup();
    renderComponent();

    const button = screen.getByText('Ver Todos os Fornecedores');
    await user.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/suppliers');
  });

  it('should navigate to login when clicking supplier card while not authenticated', async () => {
    const user = userEvent.setup();
    mockIsAuthenticated.value = false;
    renderComponent();

    const supplierCard = screen.getByText('Buffet Delícia').closest('div');
    if (supplierCard) {
      await user.click(supplierCard);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should navigate to supplier detail when clicking supplier card while authenticated', async () => {
    const user = userEvent.setup();
    mockIsAuthenticated.value = true;
    renderComponent();

    const supplierCard = screen.getByText('Buffet Delícia').closest('div');
    if (supplierCard) {
      await user.click(supplierCard);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/supplier/1');
  });

  it('should render supplier avatars with correct alt text', () => {
    renderComponent();

    const avatar1 = screen.getByAltText('Buffet Delícia');
    const avatar2 = screen.getByAltText('DJ Premium Sound');
    const avatar3 = screen.getByAltText('Decorações Encanto');

    expect(avatar1).toBeInTheDocument();
    expect(avatar2).toBeInTheDocument();
    expect(avatar3).toBeInTheDocument();
  });

  it('should render portfolio images', () => {
    const { container } = renderComponent();

    const portfolioImages = container.querySelectorAll('img[alt="Portfolio"]');
    expect(portfolioImages.length).toBe(9); // 3 suppliers x 3 images each
  });

  it('should render star icons for ratings', () => {
    const { container } = renderComponent();

    const starIcons = container.querySelectorAll('svg');
    expect(starIcons.length).toBeGreaterThan(0);
  });

  it('should render MapPin icons for locations', () => {
    renderComponent();

    const locations = screen.getAllByText(/São Paulo|Rio de Janeiro|Curitiba/);
    expect(locations.length).toBeGreaterThan(0);
  });

  it('should navigate to different supplier details when clicking different cards', async () => {
    const user = userEvent.setup();
    mockIsAuthenticated.value = true;
    renderComponent();

    const supplier1 = screen.getByText('Buffet Delícia').closest('div');
    const supplier2 = screen.getByText('DJ Premium Sound').closest('div');

    if (supplier1) {
      await user.click(supplier1);
    }
    expect(mockNavigate).toHaveBeenCalledWith('/supplier/1');

    if (supplier2) {
      await user.click(supplier2);
    }
    expect(mockNavigate).toHaveBeenCalledWith('/supplier/2');
  });
});