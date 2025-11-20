import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Features } from '../Features';
import * as userService from '../../services/userService';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../services/userService');
vi.mock('lucide-react', () => ({
  Search: () => <span data-testid="icon-search" />,
  Star: () => <span data-testid="icon-star" />,
  ArrowRight: () => <span data-testid="icon-arrow-right" />,
  FileText: () => <span data-testid="icon-file" />,
  Calendar: () => <span data-testid="icon-calendar" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const renderComponent = () =>
  render(
    <MemoryRouter>
      <Features />
    </MemoryRouter>
  );

describe('Features component', () => {
  it('renders static sections (steps and features)', () => {
    renderComponent();

    // títulos principais
    expect(screen.getByText('Como funciona?')).toBeInTheDocument();
    expect(screen.getByText('Por que usar o ConectEvento?')).toBeInTheDocument();

    // passos
    expect(screen.getByText('Cadastre-se')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Contrate')).toBeInTheDocument();

    // features
    expect(screen.getByText('Busca Inteligente')).toBeInTheDocument();
    expect(screen.getByText('Solicitação de Orçamentos')).toBeInTheDocument();
    expect(screen.getByText('Sistema de Avaliações')).toBeInTheDocument();
    expect(screen.getByText('Gestão de Eventos')).toBeInTheDocument();
  });

  it('calls userService.getSuppliers and displays stats after loading', async () => {
    // mock de fornecedores com rating/reviewCount
    vi.mocked(userService.userService.getSuppliers).mockResolvedValue([
      { id: 's1', rating: 4.5, reviewCount: 10 },
      { id: 's2', rating: 4.0, reviewCount: 5 },
      { id: 's3', rating: null, reviewCount: 0 },
    ] as any);

    renderComponent();

    await waitFor(() => {
      expect(userService.userService.getSuppliers).toHaveBeenCalled();
    });

    // fornecedores cadastrados (3)
    await waitFor(() => {
      expect(screen.getByText('3+')).toBeInTheDocument();
    });

    // média ponderada: (4.5*10 + 4.0*5) / 15 = 4.3 → 4.3/5
    expect(screen.getByText('4.3/5')).toBeInTheDocument();

    // eventos estimados = totalReviews / 4 => (10+5)/4 = 3.75 ≈ 4
    expect(screen.getByText('4+')).toBeInTheDocument();

    // satisfação de acordo com média (4.3 → 90%)
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('navigates when clicking call-to-action buttons', async () => {
    vi.mocked(userService.userService.getSuppliers).mockResolvedValue([] as any);

    const user = userEvent.setup();
    renderComponent();

    const criarContaBtn = await screen.findByText('Criar Conta');
    await user.click(criarContaBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/register');

    const explorarBtn = screen.getByText('Explorar Fornecedores');
    await user.click(explorarBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/suppliers');
  });
});
