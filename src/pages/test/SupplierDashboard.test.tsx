import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { SupplierDashboard } from '../SupplierDashboard';
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

const mockUser = {
  id: 'supplier-1',
  name: 'João Silva',
  email: 'joao@example.com',
  role: 'SUPPLIER',
};

const mockQuotes = [
  {
    id: 'quote-1',
    message: 'Preciso de buffet para 100 pessoas',
    status: 'PENDING',
    createdAt: '2024-01-15T10:00:00Z',
    organizer: {
      name: 'Maria Santos',
      email: 'maria@example.com',
    },
    event: {
      title: 'Casamento',
      date: '2024-06-20T18:00:00Z',
      location: 'São Paulo, SP',
      guestCount: 100,
    },
  },
  {
    id: 'quote-2',
    message: 'Orçamento para decoração',
    status: 'RESPONDED',
    response: 'Orçamento enviado conforme solicitado',
    price: 5000,
    createdAt: '2024-01-10T14:30:00Z',
    organizer: {
      name: 'Pedro Oliveira',
      email: 'pedro@example.com',
    },
    event: {
      title: 'Aniversário',
      date: '2024-05-15T15:00:00Z',
      location: 'Rio de Janeiro, RJ',
      guestCount: 50,
    },
  },
  {
    id: 'quote-3',
    message: 'Fotografia para evento corporativo',
    status: 'ACCEPTED',
    response: 'Confirmo disponibilidade',
    price: 3000,
    createdAt: '2024-01-05T09:00:00Z',
    organizer: {
      name: 'Ana Costa',
      email: 'ana@example.com',
    },
    event: {
      title: 'Evento Corporativo',
      date: '2024-04-10T09:00:00Z',
      location: 'Brasília, DF',
      guestCount: 200,
    },
  },
];

describe('SupplierDashboard', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <SupplierDashboard />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
    (quoteService.getBudgetsByUserId as any).mockResolvedValue(mockQuotes);
    (quoteService.updateBudget as any).mockResolvedValue({});
  });

  describe('Rendering', () => {
    it('should render dashboard header with user name', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Dashboard do Fornecedor')).toBeInTheDocument();
        expect(screen.getByText('João Silva')).toBeInTheDocument();
      });
    });

    it('should render all stats cards', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Total de Solicitações')).toBeInTheDocument();
        expect(screen.getByText('Pendentes')).toBeInTheDocument();
        expect(screen.getByText('Respondidas')).toBeInTheDocument();
        expect(screen.getByText('Aceitas')).toBeInTheDocument();
      });
    });

    it('should render quick actions section', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Ações Rápidas')).toBeInTheDocument();
        expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
        expect(screen.getByText('Ver Meu Perfil')).toBeInTheDocument();
        expect(screen.getByText('Minhas Avaliações')).toBeInTheDocument();
      });
    });

    it('should render tabs for filtering quotes', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText(/Pendentes \(1\)/)).toBeInTheDocument();
        expect(screen.getByText(/Respondidas \(1\)/)).toBeInTheDocument();
        expect(screen.getByText(/Todas \(3\)/)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should show loading state initially', () => {
      renderComponent();
      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });

    it('should load quotes on mount', async () => {
      renderComponent();
      await waitFor(() => {
        expect(quoteService.getBudgetsByUserId).toHaveBeenCalledWith(mockUser.id);
      });
    });

    it('should display quotes after loading', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
        expect(screen.getByText('Preciso de buffet para 100 pessoas')).toBeInTheDocument();
      });
    });

    it('should handle loading error gracefully', async () => {
      (quoteService.getBudgetsByUserId as any).mockRejectedValue(new Error('API Error'));
      renderComponent();
      await waitFor(() => {
        expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should show pending quotes by default', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
        expect(screen.queryByText('Pedro Oliveira')).not.toBeInTheDocument();
      });
    });

    it('should filter by responded quotes when tab is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      });

      const respondedTab = screen.getByText(/Respondidas \(1\)/);
      await user.click(respondedTab);

      await waitFor(() => {
        expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
        expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument();
      });
    });

    it('should show all quotes when all tab is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      });

      const allTab = screen.getByText(/Todas \(3\)/);
      await user.click(allTab);

      await waitFor(() => {
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
        expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument();
        expect(screen.getByText('Ana Costa')).toBeInTheDocument();
      });
    });
  });

  describe('Quote Display', () => {
    it('should display quote status badge correctly', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Pendente')).toBeInTheDocument();
      });

      const respondedTab = screen.getByText(/Respondidas \(1\)/);
      await user.click(respondedTab);

      await waitFor(() => {
        expect(screen.getByText('Respondido')).toBeInTheDocument();
      });

      const allTab = screen.getByText(/Todas \(3\)/);
      await user.click(allTab);

      await waitFor(() => {
        expect(screen.getByText('Aceito')).toBeInTheDocument();
      });
    });

    it('should display event information', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Casamento')).toBeInTheDocument();
        expect(screen.getByText(/São Paulo, SP/)).toBeInTheDocument();
        expect(screen.getByText(/Convidados: 100/)).toBeInTheDocument();
      });
    });

    it('should display quote message', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Preciso de buffet para 100 pessoas')).toBeInTheDocument();
      });
    });

    it('should display organizer information', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
        expect(screen.getByText('maria@example.com')).toBeInTheDocument();
      });
    });

    it('should show respond button for pending quotes', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Responder')).toBeInTheDocument();
        expect(screen.getByText('Recusar')).toBeInTheDocument();
      });
    });

    it('should show edit button for responded quotes', async () => {
      const user = userEvent.setup();
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      });

      const respondedTab = screen.getByText(/Respondidas \(1\)/);
      await user.click(respondedTab);

      await waitFor(() => {
        expect(screen.getByText('Editar Resposta')).toBeInTheDocument();
      });
    });

    it('should display response details for responded quotes', async () => {
      const user = userEvent.setup();
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      });

      const respondedTab = screen.getByText(/Respondidas \(1\)/);
      await user.click(respondedTab);

      await waitFor(() => {
        expect(screen.getByText('Orçamento enviado conforme solicitado')).toBeInTheDocument();
        expect(screen.getByText(/Valor: R\$ 5\.000,00/)).toBeInTheDocument();
      });
    });
  });

  describe('Response Modal', () => {
    it('should open modal when respond button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Responder')).toBeInTheDocument();
      });

      const respondButton = screen.getByText('Responder');
      await user.click(respondButton);

      await waitFor(() => {
        expect(screen.getByText('Responder Solicitação')).toBeInTheDocument();
      });
    });

    it('should render modal form fields', async () => {
      const user = userEvent.setup();
      renderComponent();
      await waitFor(() => {
        const respondButton = screen.getByText('Responder');
        user.click(respondButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Valor do Orçamento (R$)')).toBeInTheDocument();
        expect(screen.getByText('Mensagem de Resposta')).toBeInTheDocument();
      });
    });

    it('should close modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      await waitFor(() => {
        const respondButton = screen.getByText('Responder');
        user.click(respondButton);
      });

      await waitFor(() => {
        const cancelButtons = screen.getAllByText('Cancelar');
        expect(cancelButtons.length).toBeGreaterThan(0);
      });

      const cancelButtons = screen.getAllByText('Cancelar');
      await user.click(cancelButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('Responder Solicitação')).not.toBeInTheDocument();
      });
    });

    it('should close modal when X button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();
      await waitFor(() => {
        const respondButton = screen.getByText('Responder');
        user.click(respondButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Responder Solicitação')).toBeInTheDocument();
      });

      const modal = screen.getByText('Responder Solicitação').closest('.fixed');
      const xButton = modal?.querySelector('button.hover\\:bg-gray-100');

      expect(xButton).toBeTruthy();
      if (xButton) {
        await user.click(xButton as HTMLElement);
      }

      await waitFor(() => {
        expect(screen.queryByText('Responder Solicitação')).not.toBeInTheDocument();
      });
    });

    it('should allow typing in price input', async () => {
      const user = userEvent.setup();
      renderComponent();
      await waitFor(() => {
        const respondButton = screen.getByText('Responder');
        user.click(respondButton);
      });

      await waitFor(() => {
        const priceInput = screen.getByPlaceholderText('R$ 0,00') as HTMLInputElement;
        expect(priceInput).toBeInTheDocument();
      });

      const priceInput = screen.getByPlaceholderText('R$ 0,00') as HTMLInputElement;
      await user.clear(priceInput);
      await user.type(priceInput, '5000');

      expect(priceInput.value).toMatch(/R\$\s*50,00/);
    });

    it('should allow typing in message textarea', async () => {
      const user = userEvent.setup();
      renderComponent();
      await waitFor(() => {
        const respondButton = screen.getByText('Responder');
        user.click(respondButton);
      });

      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText(/Descreva os detalhes/) as HTMLTextAreaElement;
        expect(messageInput).toBeInTheDocument();
      });

      const messageInput = screen.getByPlaceholderText(/Descreva os detalhes/) as HTMLTextAreaElement;
      await user.clear(messageInput);
      await user.type(messageInput, 'Orçamento detalhado');

      expect(messageInput.value).toBe('Orçamento detalhado');
    });

    it('should submit response with correct data', async () => {
      const user = userEvent.setup();
      renderComponent();
      await waitFor(() => {
        const respondButton = screen.getByText('Responder');
        user.click(respondButton);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('R$ 0,00')).toBeInTheDocument();
      });

      const priceInput = screen.getByPlaceholderText('R$ 0,00');
      const messageInput = screen.getByPlaceholderText(/Descreva os detalhes/);

      await user.clear(priceInput);
      await user.type(priceInput, '5000');
      await user.clear(messageInput);
      await user.type(messageInput, 'Orçamento conforme solicitado');

      const submitButton = screen.getByText('Enviar Resposta');
      await user.click(submitButton);

      await waitFor(() => {
        expect(quoteService.updateBudget).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should show submitting state when form is being submitted', async () => {
      const user = userEvent.setup();
      let resolveUpdate: any;
      (quoteService.updateBudget as any).mockImplementation(
        () => new Promise(resolve => { resolveUpdate = resolve; })
      );

      renderComponent();
      await waitFor(() => {
        const respondButton = screen.getByText('Responder');
        user.click(respondButton);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('R$ 0,00')).toBeInTheDocument();
      });

      const priceInput = screen.getByPlaceholderText('R$ 0,00');
      const messageInput = screen.getByPlaceholderText(/Descreva os detalhes/);

      await user.clear(priceInput);
      await user.type(priceInput, '5000');
      await user.clear(messageInput);
      await user.type(messageInput, 'Orçamento');

      const submitButton = screen.getByText('Enviar Resposta');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Enviando...')).toBeInTheDocument();
      });

      if (resolveUpdate) resolveUpdate({});
    });

    it('should reload quotes after successful submission', async () => {
      const user = userEvent.setup();
      renderComponent();
      await waitFor(() => {
        expect(quoteService.getBudgetsByUserId).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        const respondButton = screen.getByText('Responder');
        user.click(respondButton);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('R$ 0,00')).toBeInTheDocument();
      });

      const priceInput = screen.getByPlaceholderText('R$ 0,00');
      const messageInput = screen.getByPlaceholderText(/Descreva os detalhes/);

      await user.clear(priceInput);
      await user.type(priceInput, '5000');
      await user.clear(messageInput);
      await user.type(messageInput, 'Orçamento');

      const submitButton = screen.getByText('Enviar Resposta');
      await user.click(submitButton);

      await waitFor(() => {
        expect(quoteService.getBudgetsByUserId).toHaveBeenCalledTimes(2);
      }, { timeout: 3000 });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no quotes are available', async () => {
      (quoteService.getBudgetsByUserId as any).mockResolvedValue([]);
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Nenhuma solicitação pendente')).toBeInTheDocument();
        expect(screen.getByText('Novas solicitações aparecerão aqui')).toBeInTheDocument();
      });
    });

    it('should show correct empty state message for each tab', async () => {
      const user = userEvent.setup();
      (quoteService.getBudgetsByUserId as any).mockResolvedValue([]);
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Nenhuma solicitação pendente')).toBeInTheDocument();
      });

      const respondedTab = screen.getByText(/Respondidas \(0\)/);
      await user.click(respondedTab);
      await waitFor(() => {
        expect(screen.getByText('Nenhuma solicitação respondida')).toBeInTheDocument();
        expect(screen.getByText('Suas respostas aparecerão aqui')).toBeInTheDocument();
      });

      const allTab = screen.getByText(/Todas \(0\)/);
      await user.click(allTab);
      await waitFor(() => {
        expect(screen.getByText('Nenhuma solicitação recebida')).toBeInTheDocument();
        expect(screen.getByText('Suas respostas aparecerão aqui')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should have working navigation buttons', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
        expect(screen.getByText('Ver Meu Perfil')).toBeInTheDocument();
        expect(screen.getByText('Minhas Avaliações')).toBeInTheDocument();
      });
    });
  });
});
