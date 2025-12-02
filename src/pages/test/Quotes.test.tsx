import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Quotes } from '../Quotes';
import { useAuth } from '../../context/AuthContext';
import { quoteService } from '../../services/quoteService';

vi.mock('../../context/AuthContext');
vi.mock('../../services/quoteService');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockSupplierUser = {
  id: 'supplier-1',
  name: 'Buffet São Paulo',
  email: 'buffet@example.com',
  type: 'SUPPLIER',
};

const mockOrganizerUser = {
  id: 'organizer-1',
  name: 'Maria Silva',
  email: 'maria@example.com',
  type: 'ORGANIZER',
};

const mockBudgets = [
  {
    id: 'budget-1',
    message: 'Preciso de buffet para 100 pessoas',
    status: 'PENDING',
    createdAt: '2024-01-15T10:00:00Z',
    price: null,
    response: null,
    organizer: {
      name: 'João Santos',
    },
    supplier: {
      companyName: 'Buffet Premium',
    },
    event: {
      title: 'Casamento',
      location: 'São Paulo, SP',
      guestCount: 100,
    },
  },
  {
    id: 'budget-2',
    message: 'Orçamento para decoração',
    status: 'RESPONDED',
    response: 'Orçamento enviado conforme solicitado',
    price: 5000,
    createdAt: '2024-01-10T14:30:00Z',
    organizer: {
      name: 'Pedro Oliveira',
    },
    supplier: {
      companyName: 'Decorações Especiais',
    },
    event: {
      title: 'Aniversário',
      location: 'Rio de Janeiro, RJ',
      guestCount: 50,
    },
  },
];

describe('Quotes', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Quotes />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (quoteService.getBudgetsByUserId as any).mockResolvedValue(mockBudgets);
    (quoteService.updateBudget as any).mockResolvedValue({});
  });

  describe('Supplier View', () => {
    beforeEach(() => {
      (useAuth as any).mockReturnValue({ user: mockSupplierUser });
    });

    it('should render supplier header correctly', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Solicitações de Orçamento')).toBeInTheDocument();
        expect(screen.getByText('Gerencie as solicitações de orçamento recebidas')).toBeInTheDocument();
      });
    });

    it('should display organizer name for supplier', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('João Santos')).toBeInTheDocument();
      });
    });

    it('should show respond button for pending budgets', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Responder Solicitação')).toBeInTheDocument();
      });
    });

    it('should submit response successfully', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await waitFor(() => {
        const respondButton = screen.getByText('Responder Solicitação');
        user.click(respondButton);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('0,00')).toBeInTheDocument();
      });

      const priceInput = screen.getByPlaceholderText('0,00');
      const messageInput = screen.getByPlaceholderText('Descreva sua proposta e condições...');

      await user.type(priceInput, '5000');
      await user.type(messageInput, 'Orçamento conforme solicitado');

      const submitButton = screen.getByText('Enviar Resposta');
      await user.click(submitButton);

      await waitFor(() => {
        expect(quoteService.updateBudget).toHaveBeenCalledWith(
          'budget-1',
          expect.objectContaining({
            status: 'RESPONDED',
            response: 'Orçamento conforme solicitado',
            price: 5000,
          })
        );
      });
    });
  });

  describe('Organizer View', () => {
    beforeEach(() => {
      (useAuth as any).mockReturnValue({ user: mockOrganizerUser });
    });

    it('should render organizer header correctly', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Meus Orçamentos')).toBeInTheDocument();
        expect(screen.getByText('Acompanhe suas solicitações de orçamento')).toBeInTheDocument();
      });
    });

    it('should display supplier name for organizer', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Buffet Premium')).toBeInTheDocument();
      });
    });

    it('should show accept and reject buttons for responded budgets', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Aceitar Orçamento')).toBeInTheDocument();
        expect(screen.getByText('Rejeitar')).toBeInTheDocument();
      });
    });

    it('should accept budget successfully', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Aceitar Orçamento')).toBeInTheDocument();
      });

      const acceptButton = screen.getByText('Aceitar Orçamento');
      await user.click(acceptButton);

      await waitFor(() => {
        expect(quoteService.updateBudget).toHaveBeenCalledWith(
          'budget-2',
          { status: 'ACCEPTED' }
        );
      });
    });

    it('should reject budget successfully', async () => {
      const user = userEvent.setup();
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Rejeitar')).toBeInTheDocument();
      });

      const rejectButton = screen.getByText('Rejeitar');
      await user.click(rejectButton);

      await waitFor(() => {
        expect(quoteService.updateBudget).toHaveBeenCalledWith(
          'budget-2',
          { status: 'REJECTED' }
        );
      });
    });
  });

  describe('Budget Display', () => {
    beforeEach(() => {
      (useAuth as any).mockReturnValue({ user: mockSupplierUser });
    });

    it('should display budget status correctly', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Pendente')).toBeInTheDocument();
        expect(screen.getByText('Respondido')).toBeInTheDocument();
      });
    });

    it('should display event information', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Casamento')).toBeInTheDocument();
        expect(screen.getByText('São Paulo, SP')).toBeInTheDocument();
        expect(screen.getByText('100 convidados')).toBeInTheDocument();
      });
    });

    it('should display budget message', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Preciso de buffet para 100 pessoas')).toBeInTheDocument();
      });
    });

    it('should display price when available', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText(/R\$ 5\.000,00/)).toBeInTheDocument();
      });
    });

    it('should display response when available', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Orçamento enviado conforme solicitado')).toBeInTheDocument();
      });
    });
  });

  describe('Loading and Empty States', () => {
    beforeEach(() => {
      (useAuth as any).mockReturnValue({ user: mockSupplierUser });
    });

    it('should show empty state when no budgets', async () => {
      (quoteService.getBudgetsByUserId as any).mockResolvedValue([]);
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Nenhuma solicitação de orçamento recebida')).toBeInTheDocument();
      });
    });

    it('should load budgets on mount', async () => {
      renderComponent();
      await waitFor(() => {
        expect(quoteService.getBudgetsByUserId).toHaveBeenCalledWith(mockSupplierUser.id);
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      (useAuth as any).mockReturnValue({ user: mockSupplierUser });
    });

    it('should have back to dashboard button', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Voltar ao Dashboard')).toBeInTheDocument();
      });
    });
  });
});