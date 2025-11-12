import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../Login';

// Mock mutável do login
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

// Mock do AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock do react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLogin.mockClear();
  });

  it('deve renderizar o formulário de login corretamente', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });

  it('deve fazer login com sucesso e navegar para o dashboard', async () => {
    mockLogin.mockResolvedValue(true);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Senha/i);
    
    await user.type(emailInput, 'maria@email.com');
    await user.type(passwordInput, 'senha');

    const loginButton = screen.getByText('Entrar');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('maria@email.com', 'senha', 'organizer');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('deve exibir mensagem de erro quando o login falhar', async () => {
    mockLogin.mockResolvedValue(false);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Email/i), 'teste@invalido.com');
    await user.type(screen.getByLabelText(/Senha/i), 'errada');

    const loginButton = screen.getByText('Entrar');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Email ou senha incorretos/i)).toBeInTheDocument();
    });
  });
it('deve alternar entre organizador e fornecedor', async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  const fornecedorButton = screen.getByText('Fornecedor');
  await user.click(fornecedorButton);

  expect(fornecedorButton).toHaveClass('border-blue-600');
  expect(fornecedorButton).toHaveClass('shadow-lg');
});


  it('deve alternar visibilidade da senha', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/Senha/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    // Clica no botão de mostrar senha (ícone de olho)
    const toggleButton = screen.getByRole('button', { hidden: true, name: '' });
    await user.click(toggleButton);

    expect(passwordInput.type).toBe('text');
  });
});