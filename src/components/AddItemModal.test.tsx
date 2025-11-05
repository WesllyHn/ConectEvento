import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddItemModal } from './AddItemModal';

describe('AddItemModal', () => {
  const mockOnCancel = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

it('should render modal when visible is true', async () => {
  render(
    <AddItemModal
      visible={true}
      onCancel={mockOnCancel}
      onSubmit={mockOnSubmit}
    />
  );

  await waitFor(() => {
    expect(screen.getByText('Adicionar Item ao Roadmap')).toBeInTheDocument();
  }, { timeout: 3000 });
}, 10000);

  it('should not render modal when visible is false', () => {
    render(
      <AddItemModal
        visible={false}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.queryByText('Adicionar Item ao Roadmap')).not.toBeInTheDocument();
  });

  it('should render all form fields', async () => {
    render(
      <AddItemModal
        visible={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Adicionar Item ao Roadmap')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/título do item/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preço/i)).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <AddItemModal
        visible={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Adicionar Item ao Roadmap')).toBeInTheDocument();
    });

    const cancelButton = await screen.findByText('Cancelar');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should validate required fields', async () => {
    render(
      <AddItemModal
        visible={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
      />
    );

    const addButton = await screen.findByText('Adicionar');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/por favor, insira o título do item/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByText(/por favor, insira a descrição/i)).toBeInTheDocument();
    expect(screen.getByText(/por favor, selecione uma categoria/i)).toBeInTheDocument();
    expect(screen.getByText(/por favor, insira o preço/i)).toBeInTheDocument();

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <AddItemModal
        visible={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
      />
    );

    const titleInput = screen.getByLabelText(/título do item/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Test Item');

    const descriptionInput = screen.getByLabelText(/descrição/i);
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Test Description');

    const priceInput = screen.getByLabelText(/preço/i);
    await user.clear(priceInput);
    await user.type(priceInput, '1000');

    const categorySelect = screen.getByLabelText(/categoria/i);
    await user.click(categorySelect);

    await waitFor(() => {
      const birthdayOption = screen.getByText('Aniversário');
      expect(birthdayOption).toBeInTheDocument();
    }, { timeout: 3000 });

    const birthdayOption = screen.getByText('Aniversário');
    await user.click(birthdayOption);

    await new Promise(resolve => setTimeout(resolve, 100));

    const addButton = await screen.findByText('Adicionar');
    await user.click(addButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Item',
        description: 'Test Description',
        category: 'BIRTHDAY',
        price: 1000,
      });
    }, { timeout: 10000 });
  }, 15000);

  it('should reset form when cancelled', async () => {
    const user = userEvent.setup({ delay: null });

    const { rerender } = render(
      <AddItemModal
        visible={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
      />
    );

    const titleInput = screen.getByLabelText(/título do item/i) as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, 'Test');

    await waitFor(() => {
      expect(titleInput.value).toBe('Test');
    });

    const cancelButton = await screen.findByText('Cancelar');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);

    rerender(
      <AddItemModal
        visible={false}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
      />
    );

    rerender(
      <AddItemModal
        visible={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
      />
    );

    await waitFor(() => {
      const newTitleInput = screen.getByLabelText(/título do item/i) as HTMLInputElement;
      expect(newTitleInput.value).toBe('');
    });
  });

  it('should show loading state when loading prop is true', async () => {
    render(
      <AddItemModal
        visible={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
        loading={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Adicionar Item ao Roadmap')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Adicionar').closest('button');
    
    expect(addButton).toHaveClass('ant-btn-loading');
  });

  it('should clear validation errors when form is cancelled and reopened', async () => {
    const user = userEvent.setup();
    
    const { rerender } = render(
      <AddItemModal
        visible={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Adicionar Item ao Roadmap')).toBeInTheDocument();
    });

    const addButton = await screen.findByText('Adicionar');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/por favor, insira o título do item/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const cancelButton = await screen.findByText('Cancelar');
    await user.click(cancelButton);

    rerender(
      <AddItemModal
        visible={false}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
      />
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    rerender(
      <AddItemModal
        visible={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/por favor, insira o título do item/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});