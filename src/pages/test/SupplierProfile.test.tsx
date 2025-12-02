import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SupplierProfile } from '../SupplierProfile';
import * as userService from '../../services/userService';
import * as uploadService from '../../services/uploadService';
import * as reviewService from '../../services/reviewService';
import * as eventService from '../../services/eventService';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'supplier-1' }),
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', name: 'Test User', type: 'client' },
    isAuthenticated: true,
  }),
}));

vi.mock('../../services/userService');
vi.mock('../../services/uploadService');
vi.mock('../../services/reviewService');
vi.mock('../../services/eventService');
vi.mock('antd', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Spin: ({ size }: any) => <div data-testid="loading-spinner">{size}</div>,
  Empty: ({ description }: any) => <div>{description}</div>,
  Form: {
    useForm: () => [{ resetFields: vi.fn() }, {}],
  },
  Input: ({ value, ...props }: any) => <input {...props} defaultValue={value} />,
  Select: (props: any) => <select {...props}>{props.children}</select>,
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Modal: ({ open, children }: any) => (open ? <div>{children}</div> : null),
  Row: ({ children }: any) => <div>{children}</div>,
  Col: ({ children }: any) => <div>{children}</div>,
  Rate: ({ value }: any) => <div data-testid="rating">{value}</div>,
  Avatar: (props: any) => <img {...props} alt={props.alt} />,
}));

const mockSupplierData = {
  id: 'supplier-1',
  name: 'Test Supplier',
  companyName: 'Test Company',
  description: 'Test description',
  location: 'São Paulo, SP',
  email: 'test@example.com',
  priceRange: 'MID',
  services: [{ service: 'Buffet' }, { service: 'Decoração' }],
  availability: true,
  avatar: null,
  rating: 4.8,
  reviewCount: 2,
};

const mockReviews = [
  {
    id: 'review-1',
    organizer: { name: 'Organizer 1' },
    rating: 5,
    createdAt: '2023-11-01',
    comment: 'Excelente trabalho!',
    event: { type: 'WEDDING' },
    response: 'Obrigado!',
    responseDate: '2023-11-02',
  },
];

const mockImages = [{ id: 'img-1' }, { id: 'img-2' }];

const mockEvents = [{ id: 'evt-1', title: 'Evento 1', date: '2025-11-11' }];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(userService.userService.getUserById).mockResolvedValue(mockSupplierData);
  vi.mocked(uploadService.uploadService.getSupplierImages).mockResolvedValue(mockImages);
  vi.mocked(uploadService.uploadService.getImageUrl).mockImplementation(
    (id: string) => `https://example.com/${id}.jpg`
  );
  vi.mocked(reviewService.reviewService.getReviewsByUserId).mockResolvedValue(mockReviews);
  vi.mocked(eventService.eventService.getEventsByOrganizerId).mockResolvedValue(mockEvents);
});

const renderComponent = () =>
  render(
    <MemoryRouter>
      <SupplierProfile />
    </MemoryRouter>
  );

describe('SupplierProfile', () => {
  it('should show loading spinner initially', () => {
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render supplier info after loading', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeInTheDocument();

      const locations = screen.getAllByText('São Paulo, SP');
      expect(locations.length).toBeGreaterThan(0);

      expect(screen.getByText('Intermediário')).toBeInTheDocument();
    });
  });

  it('should display services offered', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Buffet')).toBeInTheDocument();
      expect(screen.getByText('Decoração')).toBeInTheDocument();
    });
  });

  it('should display description', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  it('should display reviews', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Excelente trabalho!')).toBeInTheDocument();
      expect(screen.getByText('Resposta do fornecedor')).toBeInTheDocument();
      expect(screen.getByText('Obrigado!')).toBeInTheDocument();
    });
  });

  it('should render portfolio images if present', async () => {
    renderComponent();

    const firstPortfolioImage = await screen.findByAltText('Portfolio 1');
    expect(firstPortfolioImage).toBeInTheDocument();
  });

  it('should not render portfolio section if no images', async () => {
    vi.mocked(uploadService.uploadService.getSupplierImages).mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(userService.userService.getUserById).toHaveBeenCalled();
    });

    expect(screen.queryByText('Portfólio')).not.toBeInTheDocument();
  });

  it('should display contact info', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();

      const locations = screen.getAllByText('São Paulo, SP');
      expect(locations.length).toBeGreaterThan(0);
      expect(locations[0]).toBeInTheDocument();
    });
  });
});
