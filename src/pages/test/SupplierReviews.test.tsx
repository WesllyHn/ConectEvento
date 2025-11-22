import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SupplierReviews } from '../SupplierReviews';
import * as reviewService from '../../services/reviewService';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'supplier-1', name: 'Test Supplier' },
  }),
}));

vi.mock('../../services/reviewService');

describe('SupplierReviews', () => {
  const mockReviews = [
    {
      id: 'review-1',
      rating: 5,
      comment: 'Excelente serviço!',
      createdAt: '2024-01-15T10:00:00Z',
      organizer: { name: 'João Silva' },
      event: { type: 'WEDDING' },
      response: null,
      responseDate: null,
    },
    {
      id: 'review-2',
      rating: 4,
      comment: 'Muito bom, recomendo!',
      createdAt: '2024-01-10T14:30:00Z',
      organizer: { name: 'Maria Santos' },
      event: { type: 'BIRTHDAY' },
      response: 'Obrigado pelo feedback!',
      responseDate: '2024-01-11T09:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(reviewService.reviewService.getReviewsByUserId).mockResolvedValue(mockReviews);
    vi.mocked(reviewService.reviewService.respondToReview).mockResolvedValue({});
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <SupplierReviews />
      </MemoryRouter>
    );
  };

  it('should render page title and description', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Minhas Avaliações')).toBeInTheDocument();
      expect(screen.getByText('Veja o que seus clientes estão dizendo sobre seus serviços')).toBeInTheDocument();
    });
  });

  it('should load and display reviews', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Excelente serviço!')).toBeInTheDocument();
      expect(screen.getByText('Muito bom, recomendo!')).toBeInTheDocument();
    });

    expect(reviewService.reviewService.getReviewsByUserId).toHaveBeenCalledWith('supplier-1', 'SUPPLIER');
  });

  it('should display statistics correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Total de Avaliações')).toBeInTheDocument();
      expect(screen.getByText('Avaliação Média')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });
  });

  it('should display review details', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Casamento')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('Aniversário')).toBeInTheDocument();
    });
  });

  it('should show response button for reviews without response', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Responder avaliação')).toBeInTheDocument();
    });
  });

  it('should display existing responses', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Obrigado pelo feedback!')).toBeInTheDocument();
      expect(screen.getByText('Sua resposta')).toBeInTheDocument();
    });
  });

  it('should open response modal when clicking respond button', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Responder avaliação')).toBeInTheDocument();
    });

    const respondButton = screen.getByText('Responder avaliação');
    await user.click(respondButton);

    await waitFor(() => {
      expect(screen.getByText('Responder Avaliação')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Agradeça pelo feedback e responda de forma profissional...')).toBeInTheDocument();
    });
  });

  it('should submit response successfully', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Responder avaliação')).toBeInTheDocument();
    });

    const respondButton = screen.getByText('Responder avaliação');
    await user.click(respondButton);

    const textarea = screen.getByPlaceholderText('Agradeça pelo feedback e responda de forma profissional...');
    await user.type(textarea, 'Obrigado pela avaliação!');

    const submitButton = screen.getByText('Enviar Resposta');
    await user.click(submitButton);

    await waitFor(() => {
      expect(reviewService.reviewService.respondToReview).toHaveBeenCalledWith(
        'review-1',
        expect.objectContaining({
          response: 'Obrigado pela avaliação!',
        })
      );
    });
  });

  it('should close modal when clicking cancel', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Responder avaliação')).toBeInTheDocument();
    });

    const respondButton = screen.getByText('Responder avaliação');
    await user.click(respondButton);

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Responder Avaliação')).not.toBeInTheDocument();
    });
  });

  it('should navigate back to dashboard', async () => {
    const user = userEvent.setup();
    renderComponent();

    const backButton = screen.getByText('Voltar ao Dashboard');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/supplier-dashboard');
  });

  it('should show empty state when no reviews', async () => {
    vi.mocked(reviewService.reviewService.getReviewsByUserId).mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Sem avaliações')).toBeInTheDocument();
      expect(screen.getByText('Quando você receber avaliações dos clientes, elas aparecerão aqui')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(reviewService.reviewService.getReviewsByUserId).mockRejectedValue(new Error('API Error'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar as avaliações. Tente novamente.')).toBeInTheDocument();
    });
  });

  it('should display rating distribution', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Distribuição de Notas')).toBeInTheDocument();
    });
  });

  it('should disable submit button when textarea is empty', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Responder avaliação')).toBeInTheDocument();
    });

    const respondButton = screen.getByText('Responder avaliação');
    await user.click(respondButton);

    await waitFor(() => {
      const submitButton = screen.getByText('Enviar Resposta').closest('button');
      expect(submitButton).toBeDisabled();
    });
  });
});