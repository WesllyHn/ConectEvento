import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SupplierProfileEdit } from '../SupplierProfileEdit';
import * as userService from '../../services/userService';
import * as uploadService from '../../services/uploadService';

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

vi.mock('../../services/userService');
vi.mock('../../services/uploadService');
vi.mock('antd', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Spin: ({ size }: any) => <div data-testid="loading-spinner">{size}</div>,
}));

describe('SupplierProfileEdit', () => {
  const mockUserData = {
    id: 'supplier-1',
    name: 'Test Supplier',
    companyName: 'Test Company',
    description: 'Test description',
    location: 'São Paulo, SP',
    email: 'test@example.com',
    priceRange: 'MID',
    services: [{ service: 'Buffet' }, { service: 'Decoração' }],
    availability: true,
    cnpjOrCpf: '12.345.678/0001-90',
  };

  const mockImages = [
    { id: 'img-1', fileName: 'image1.jpg' },
    { id: 'img-2', fileName: 'image2.jpg' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.userService.getUserById).mockResolvedValue(mockUserData);
    vi.mocked(uploadService.uploadService.getSupplierImages).mockResolvedValue(mockImages);
    vi.mocked(uploadService.uploadService.getImageUrl).mockReturnValue('https://example.com/image.jpg');
    vi.mocked(userService.userService.updateUser).mockResolvedValue({});
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <SupplierProfileEdit />
      </MemoryRouter>
    );
  };

  it('should render page title and description', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
      expect(screen.getByText('Mantenha suas informações atualizadas para atrair mais clientes')).toBeInTheDocument();
    });
  });

  it('should load and display user data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });
  });

  it('should display services', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet')).toBeInTheDocument();
      expect(screen.getByText('Decoração')).toBeInTheDocument();
    });
  });

  it('should add new service', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Digite o nome do serviço')).toBeInTheDocument();
    });

    const serviceInput = screen.getByPlaceholderText('Digite o nome do serviço');
    await user.type(serviceInput, 'Fotografia');

    const addButton = serviceInput.nextElementSibling as HTMLButtonElement;
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Fotografia')).toBeInTheDocument();
    });
  });

  it('should remove service', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet')).toBeInTheDocument();
    });

    const buffetService = screen.getByText('Buffet');
    const removeButton = buffetService.parentElement?.querySelector('button');
    
    if (removeButton) {
      await user.click(removeButton);
    }

    await waitFor(() => {
      expect(screen.queryByText('Buffet')).not.toBeInTheDocument();
    });
  });

  it('should format CNPJ correctly', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      const cnpjInput = screen.getByPlaceholderText('000.000.000-00 ou 00.000.000/0000-00');
      expect(cnpjInput).toBeInTheDocument();
    });

    const cnpjInput = screen.getByPlaceholderText('000.000.000-00 ou 00.000.000/0000-00') as HTMLInputElement;
    
    await user.clear(cnpjInput);
    await user.type(cnpjInput, '12345678000190');

    await waitFor(() => {
      expect(cnpjInput.value).toBe('12.345.678/0001-90');
    });
  });

  it('should format CPF correctly', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      const cpfInput = screen.getByPlaceholderText('000.000.000-00 ou 00.000.000/0000-00');
      expect(cpfInput).toBeInTheDocument();
    });

    const cpfInput = screen.getByPlaceholderText('000.000.000-00 ou 00.000.000/0000-00') as HTMLInputElement;
    
    await user.clear(cpfInput);
    await user.type(cpfInput, '12345678901');

    await waitFor(() => {
      expect(cpfInput.value).toBe('123.456.789-01');
    });
  });

  it('should toggle availability checkbox', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      const checkbox = screen.getByLabelText('Disponível para novos projetos') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    const checkbox = screen.getByLabelText('Disponível para novos projetos') as HTMLInputElement;
    await user.click(checkbox);

    await waitFor(() => {
      expect(checkbox.checked).toBe(false);
    });
  });

  it('should submit form successfully', async () => {
    const user = userEvent.setup();
    const { message } = await import('antd');
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Salvar Alterações').closest('button');
    if (saveButton) {
      await user.click(saveButton);
    }

    await waitFor(() => {
      expect(userService.userService.updateUser).toHaveBeenCalledWith(
        'supplier-1',
        expect.objectContaining({
          companyName: 'Test Company',
          description: 'Test description',
        })
      );
      expect(message.success).toHaveBeenCalledWith('Perfil atualizado com sucesso!');
      expect(mockNavigate).toHaveBeenCalledWith('/supplier-dashboard');
    });
  });

  it('should navigate back to dashboard on cancel', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/supplier-dashboard');
  });

  it('should display portfolio images', async () => {
    renderComponent();

    await waitFor(() => {
      expect(uploadService.uploadService.getSupplierImages).toHaveBeenCalledWith('supplier-1');
    });

    // Verifica que as imagens foram carregadas
    expect(uploadService.uploadService.getImageUrl).toHaveBeenCalled();
  });

  it('should show loading spinner initially', () => {
    renderComponent();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should handle update error', async () => {
    const user = userEvent.setup();
    const { message } = await import('antd');
    
    vi.mocked(userService.userService.updateUser).mockRejectedValue(new Error('Update failed'));
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Salvar Alterações').closest('button');
    if (saveButton) {
      await user.click(saveButton);
    }

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('Erro ao atualizar perfil');
    });
  });

  it('should display empty portfolio state', async () => {
    vi.mocked(uploadService.uploadService.getSupplierImages).mockResolvedValue([]);
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Nenhuma imagem no portfólio')).toBeInTheDocument();
    });
  });

  it('should display empty services state', async () => {
    vi.mocked(userService.userService.getUserById).mockResolvedValue({
      ...mockUserData,
      services: [],
    });
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Nenhum serviço adicionado ainda')).toBeInTheDocument();
    });
  });
});