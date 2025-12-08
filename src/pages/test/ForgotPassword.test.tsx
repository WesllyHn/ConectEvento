import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ForgotPassword } from '../ForgotPassword';
import * as userService from '../../services/userService';

vi.mock('../../services/userService', () => ({
  userService: {
    requestPasswordReset: vi.fn(),
  },
}));

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário de recuperação de senha corretamente', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    expect(screen.getByText('Esqueceu sua senha?')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText('Enviar instruções')).toBeInTheDocument();
    expect(screen.getByText(/Lembrou sua senha/i)).toBeInTheDocument();
  });

  it('deve solicitar recuperação de senha com sucesso', async () => {
    const mockRequestPasswordReset = vi.mocked(userService.userService.requestPasswordReset);
    mockRequestPasswordReset.mockResolvedValue({
      success: true,
      message: 'Email de recuperação enviado com sucesso',
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'usuario@example.com');

    const submitButton = screen.getByText('Enviar instruções');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith('usuario@example.com');
      expect(screen.getByText('Email enviado com sucesso!')).toBeInTheDocument();
      expect(screen.getByText(/Enviamos um email para/i)).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de erro quando a solicitação falhar', async () => {
    const mockRequestPasswordReset = vi.mocked(userService.userService.requestPasswordReset);
    mockRequestPasswordReset.mockResolvedValue({
      success: false,
      message: 'Email não encontrado',
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'email@inexistente.com');

    const submitButton = screen.getByText('Enviar instruções');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email não encontrado')).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de erro genérica quando ocorrer exceção', async () => {
    const mockRequestPasswordReset = vi.mocked(userService.userService.requestPasswordReset);
    mockRequestPasswordReset.mockRejectedValue(new Error('Erro de rede'));

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'usuario@example.com');

    const submitButton = screen.getByText('Enviar instruções');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Erro de rede')).toBeInTheDocument();
    });
  });

  it('deve validar que o email é obrigatório', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const submitButton = screen.getByText('Enviar instruções');
    await user.click(submitButton);

    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    expect(emailInput.validity.valueMissing).toBe(true);
  });

  it('deve mostrar estado de carregamento durante o envio', async () => {
    const mockRequestPasswordReset = vi.mocked(userService.userService.requestPasswordReset);
    mockRequestPasswordReset.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Sucesso' }), 100))
    );

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'usuario@example.com');

    const submitButton = screen.getByText('Enviar instruções');
    await user.click(submitButton);

    expect(screen.getByText('Enviando...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Enviando...')).not.toBeInTheDocument();
    });
  });

  it('deve exibir link para voltar ao login após sucesso', async () => {
    const mockRequestPasswordReset = vi.mocked(userService.userService.requestPasswordReset);
    mockRequestPasswordReset.mockResolvedValue({
      success: true,
      message: 'Email enviado',
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'usuario@example.com');

    const submitButton = screen.getByText('Enviar instruções');
    await user.click(submitButton);

    await waitFor(() => {
      const backLink = screen.getByText(/Voltar para o login/i);
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/login');
    });
  });
});

