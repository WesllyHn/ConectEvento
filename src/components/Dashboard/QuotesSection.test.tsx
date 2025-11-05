import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuotesSection } from './QuotesSection';
import { quoteService } from '../../services/quoteService';

// Mock do quoteService
vi.mock('../../services/quoteService', () => ({
  quoteService: {
    updateBudget: vi.fn(),
  },
}));

// Mock completo do antd - usar vi.fn() diretamente
vi.mock('antd', () => ({
  Button: ({ children, onClick, loading, disabled, ...props }: any) => {
    const childText = typeof children === 'string' ? children : 
                     Array.isArray(children) ? children.find(c => typeof c === 'string') : '';
    const testId = childText.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        data-testid={testId}
        data-loading={loading}
        {...props}
      >
        {children}
      </button>
    );
  },
  Empty: ({ description }: any) => (
    <div data-testid="empty">
      {description}
    </div>
  ),
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock do DataCard
vi.mock('../Common', () => ({
  DataCard: ({ title, children, status }: any) => (
    <div data-testid="data-card">
      {title && <div>{title}</div>}
      {status && (
        <span data-testid={`status-${status.text.toLowerCase()}`}>
          {status.text}
        </span>
      )}
      {children}
    </div>
  ),
}));

// Mock dos ícones
vi.mock('lucide-react', () => ({
  CheckCircle: () => null,
  XCircle: () => null,
}));

describe('QuotesSection', () => {
  const mockQuotes = [
    {
      id: '1',
      supplierId: 'supplier-1',
      organizerId: 'organizer-1',
      eventId: 'event-1',
      message: 'Need catering for 150 guests',
      status: 'PENDING' as const,
      createdAt: '2025-01-15T10:00:00.000Z',
      supplier: {
        name: 'Catering Company',
        companyName: 'Best Catering',
      },
      event: {
        title: 'Wedding Event',
      },
    },
    {
      id: '2',
      supplierId: 'supplier-2',
      organizerId: 'organizer-1',
      eventId: 'event-2',
      message: 'Looking for a DJ',
      status: 'RESPONDED' as const,
      response: 'Available for your event. Rate is R$ 3000',
      price: 3000,
      createdAt: '2025-01-14T10:00:00.000Z',
      supplier: {
        name: 'DJ Services',
      },
      event: {
        title: 'Birthday Party',
      },
    },
    {
      id: '3',
      supplierId: 'supplier-3',
      organizerId: 'organizer-1',
      eventId: 'event-3',
      message: 'Need photographer',
      status: 'ACCEPTED' as const,
      response: 'Thank you for choosing us!',
      price: 5000,
      createdAt: '2025-01-13T10:00:00.000Z',
      supplier: {
        name: 'Photo Studio',
      },
      event: {
        title: 'Corporate Event',
      },
    },
  ];

  // Importar o mock do message após o vi.mock
  let messageSuccess: ReturnType<typeof vi.fn>;
  let messageError: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Importar dinamicamente para acessar os mocks
    const { message } = await import('antd');
    messageSuccess = message.success as ReturnType<typeof vi.fn>;
    messageError = message.error as ReturnType<typeof vi.fn>;
    
    vi.clearAllMocks();
  });

  it('should render all quotes when less than or equal to 5', () => {
    render(<QuotesSection quotes={mockQuotes} />);
    expect(screen.getByText('Need catering for 150 guests')).toBeInTheDocument();
    expect(screen.getByText('Looking for a DJ')).toBeInTheDocument();
    expect(screen.getByText('Need photographer')).toBeInTheDocument();
  });

  it('should render only first 5 quotes when more than 5', () => {
    const manyQuotes = [
      ...mockQuotes,
      { ...mockQuotes[0], id: '4', message: 'Quote 4' },
      { ...mockQuotes[0], id: '5', message: 'Quote 5' },
      { ...mockQuotes[0], id: '6', message: 'Quote 6' },
    ];
    render(<QuotesSection quotes={manyQuotes} />);
    
    expect(screen.getByText('Need catering for 150 guests')).toBeInTheDocument();
    expect(screen.getByText('Quote 5')).toBeInTheDocument();
    expect(screen.queryByText('Quote 6')).not.toBeInTheDocument();
  });

  it('should display correct status for pending quote', () => {
    const pendingQuotes = [mockQuotes[0]];
    render(<QuotesSection quotes={pendingQuotes} />);
    
    expect(screen.getByTestId('status-pendente')).toBeInTheDocument();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('should display correct status for responded quote', () => {
    const respondedQuotes = [mockQuotes[1]];
    render(<QuotesSection quotes={respondedQuotes} />);
    
    expect(screen.getByTestId('status-respondido')).toBeInTheDocument();
    expect(screen.getByText('Respondido')).toBeInTheDocument();
  });

  it('should display correct status for accepted quote', () => {
    const acceptedQuotes = [mockQuotes[2]];
    render(<QuotesSection quotes={acceptedQuotes} />);
    
    expect(screen.getByTestId('status-aceito')).toBeInTheDocument();
    expect(screen.getByText('Aceito')).toBeInTheDocument();
  });

  it('should display formatted date', () => {
    render(<QuotesSection quotes={[mockQuotes[0]]} />);
    expect(screen.getByText(/15\/01\/2025/)).toBeInTheDocument();
  });

  it('should display quote message', () => {
    render(<QuotesSection quotes={[mockQuotes[0]]} />);
    expect(screen.getByText('Need catering for 150 guests')).toBeInTheDocument();
  });

  it('should display response when quote is responded', () => {
    render(<QuotesSection quotes={[mockQuotes[1]]} />);
    expect(screen.getByText(/Available for your event/)).toBeInTheDocument();
  });

  it('should display price when quote is responded', () => {
    render(<QuotesSection quotes={[mockQuotes[1]]} />);
    expect(screen.getByText(/R\$ 3\.000/)).toBeInTheDocument();
  });

  it('should not display response section for pending quotes', () => {
    render(<QuotesSection quotes={[mockQuotes[0]]} />);
    expect(screen.queryByText(/Resposta:/)).not.toBeInTheDocument();
  });

  it('should render empty state when no quotes', () => {
    render(<QuotesSection quotes={[]} />);
    expect(screen.getByText('Nenhuma solicitação enviada ainda')).toBeInTheDocument();
  });

  it('should format price correctly in Brazilian locale', () => {
    render(<QuotesSection quotes={[mockQuotes[1]]} />);
    expect(screen.getByText(/R\$ 3\.000/)).toBeInTheDocument();
  });

  it('should render multiple quotes with different statuses', () => {
    render(<QuotesSection quotes={mockQuotes} />);
    
    expect(screen.getByTestId('status-pendente')).toBeInTheDocument();
    expect(screen.getByTestId('status-respondido')).toBeInTheDocument();
    expect(screen.getByTestId('status-aceito')).toBeInTheDocument();
  });

  it('should display supplier company name when available', () => {
    render(<QuotesSection quotes={[mockQuotes[0]]} />);
    expect(screen.getByText(/Best Catering/)).toBeInTheDocument();
  });

  it('should display supplier name when company name is not available', () => {
    render(<QuotesSection quotes={[mockQuotes[1]]} />);
    expect(screen.getByText(/DJ Services/)).toBeInTheDocument();
  });

  it('should display event title', () => {
    render(<QuotesSection quotes={[mockQuotes[0]]} />);
    expect(screen.getByText(/Wedding Event/)).toBeInTheDocument();
  });

  it('should render accept and reject buttons for responded quotes', () => {
    render(<QuotesSection quotes={[mockQuotes[1]]} />);
    
    expect(screen.getByTestId('aceitar-e-contratar')).toBeInTheDocument();
    expect(screen.getByTestId('rejeitar')).toBeInTheDocument();
  });

  it('should not render accept and reject buttons for pending quotes', () => {
    render(<QuotesSection quotes={[mockQuotes[0]]} />);
    
    expect(screen.queryByTestId('aceitar-e-contratar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('rejeitar')).not.toBeInTheDocument();
  });

  it('should not render accept and reject buttons for accepted quotes', () => {
    render(<QuotesSection quotes={[mockQuotes[2]]} />);
    
    expect(screen.queryByTestId('aceitar-e-contratar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('rejeitar')).not.toBeInTheDocument();
  });

  it('should call quoteService.updateBudget when accept button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(quoteService.updateBudget).mockResolvedValue({} as any);
    
    render(<QuotesSection quotes={[mockQuotes[1]]} />);
    
    const acceptButton = screen.getByTestId('aceitar-e-contratar');
    await user.click(acceptButton);
    
    await waitFor(() => {
      expect(quoteService.updateBudget).toHaveBeenCalledWith('2', { status: 'ACCEPTED' });
    });
  });

  it('should call quoteService.updateBudget when reject button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(quoteService.updateBudget).mockResolvedValue({} as any);
    
    render(<QuotesSection quotes={[mockQuotes[1]]} />);
    
    const rejectButton = screen.getByTestId('rejeitar');
    await user.click(rejectButton);
    
    await waitFor(() => {
      expect(quoteService.updateBudget).toHaveBeenCalledWith('2', { status: 'REJECTED' });
    });
  });

  it('should show success message when quote is accepted', async () => {
    const user = userEvent.setup();
    vi.mocked(quoteService.updateBudget).mockResolvedValue({} as any);
    
    render(<QuotesSection quotes={[mockQuotes[1]]} />);
    
    const acceptButton = screen.getByTestId('aceitar-e-contratar');
    await user.click(acceptButton);
    
    await waitFor(() => {
      expect(messageSuccess).toHaveBeenCalledWith('Orçamento aceito e fornecedor vinculado ao evento!');
    });
  });

  it('should show success message when quote is rejected', async () => {
    const user = userEvent.setup();
    vi.mocked(quoteService.updateBudget).mockResolvedValue({} as any);
    
    render(<QuotesSection quotes={[mockQuotes[1]]} />);
    
    const rejectButton = screen.getByTestId('rejeitar');
    await user.click(rejectButton);
    
    await waitFor(() => {
      expect(messageSuccess).toHaveBeenCalledWith('Orçamento rejeitado com sucesso!');
    });
  });

  it('should call onQuoteUpdate callback after successful accept', async () => {
    const user = userEvent.setup();
    const mockOnQuoteUpdate = vi.fn();
    vi.mocked(quoteService.updateBudget).mockResolvedValue({} as any);
    
    render(<QuotesSection quotes={[mockQuotes[1]]} onQuoteUpdate={mockOnQuoteUpdate} />);
    
    const acceptButton = screen.getByTestId('aceitar-e-contratar');
    await user.click(acceptButton);
    
    await waitFor(() => {
      expect(mockOnQuoteUpdate).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onQuoteUpdate callback after successful reject', async () => {
    const user = userEvent.setup();
    const mockOnQuoteUpdate = vi.fn();
    vi.mocked(quoteService.updateBudget).mockResolvedValue({} as any);
    
    render(<QuotesSection quotes={[mockQuotes[1]]} onQuoteUpdate={mockOnQuoteUpdate} />);
    
    const rejectButton = screen.getByTestId('rejeitar');
    await user.click(rejectButton);
    
    await waitFor(() => {
      expect(mockOnQuoteUpdate).toHaveBeenCalledTimes(1);
    });
  });

  it('should show error message when update fails', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(quoteService.updateBudget).mockRejectedValue(new Error('Network error'));
    
    render(<QuotesSection quotes={[mockQuotes[1]]} />);
    
    const acceptButton = screen.getByTestId('aceitar-e-contratar');
    await user.click(acceptButton);
    
    await waitFor(() => {
      expect(messageError).toHaveBeenCalledWith('Erro ao atualizar status do orçamento');
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('should disable buttons while updating', async () => {
    const user = userEvent.setup();
    vi.mocked(quoteService.updateBudget).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<QuotesSection quotes={[mockQuotes[1]]} />);
    
    const acceptButton = screen.getByTestId('aceitar-e-contratar');
    const rejectButton = screen.getByTestId('rejeitar');
    
    await user.click(acceptButton);
    
    expect(acceptButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();
    
    await waitFor(() => {
      expect(acceptButton).not.toBeDisabled();
      expect(rejectButton).not.toBeDisabled();
    });
  });

  it('should not call onQuoteUpdate when it is not provided', async () => {
    const user = userEvent.setup();
    vi.mocked(quoteService.updateBudget).mockResolvedValue({} as any);
    
    render(<QuotesSection quotes={[mockQuotes[1]]} />);
    
    const acceptButton = screen.getByTestId('aceitar-e-contratar');
    await user.click(acceptButton);
    
    await waitFor(() => {
      expect(quoteService.updateBudget).toHaveBeenCalled();
    });
    
    // Just verify it doesn't throw an error
    expect(messageSuccess).toHaveBeenCalled();
  });
});