import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewCard } from '../ReviewCard';

describe('ReviewCard', () => {
  const mockOnReview = vi.fn();

  const mockSupplierWithoutReview = {
    id: '1',
    companyName: 'Buffet Delícia',
    description: 'Buffet completo para eventos corporativos e festas',
    avatar: 'https://example.com/avatar.jpg',
    services: ['Buffet Completo', 'Coquetel', 'Coffee Break', 'Jantar'],
    hasReview: false,
    eventId: 'event-123',
  };

  const mockSupplierWithReview = {
    id: '2',
    companyName: 'DJ Premium Sound',
    description: 'Som profissional e iluminação',
    avatar: 'https://example.com/avatar2.jpg',
    services: ['DJ', 'Som', 'Iluminação'],
    hasReview: true,
    eventId: 'event-456',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render supplier company name', () => {
    render(
      <ReviewCard supplier={mockSupplierWithoutReview} onReview={mockOnReview} />
    );

    expect(screen.getByText('Buffet Delícia')).toBeInTheDocument();
  });

  it('should render supplier description', () => {
    render(
      <ReviewCard supplier={mockSupplierWithoutReview} onReview={mockOnReview} />
    );

    expect(
      screen.getByText('Buffet completo para eventos corporativos e festas')
    ).toBeInTheDocument();
  });

  it('should render supplier avatar', () => {
    const { container } = render(
      <ReviewCard supplier={mockSupplierWithoutReview} onReview={mockOnReview} />
    );

    const avatar = container.querySelector('.ant-avatar');
    expect(avatar).toBeInTheDocument();
    
    const avatarImg = container.querySelector('.ant-avatar img');
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('should render maximum 3 services tags', () => {
    render(
      <ReviewCard supplier={mockSupplierWithoutReview} onReview={mockOnReview} />
    );

    expect(screen.getByText('Buffet Completo')).toBeInTheDocument();
    expect(screen.getByText('Coquetel')).toBeInTheDocument();
    expect(screen.getByText('Coffee Break')).toBeInTheDocument();
    expect(screen.queryByText('Jantar')).not.toBeInTheDocument();
  });

  it('should render "Avaliar" button when supplier has no review', () => {
    render(
      <ReviewCard supplier={mockSupplierWithoutReview} onReview={mockOnReview} />
    );

    const button = screen.getByText('Avaliar');
    expect(button).toBeInTheDocument();
  });

  it('should call onReview with correct params when clicking "Avaliar" button', async () => {
    const user = userEvent.setup();
    render(
      <ReviewCard supplier={mockSupplierWithoutReview} onReview={mockOnReview} />
    );

    const button = screen.getByText('Avaliar');
    await user.click(button);

    expect(mockOnReview).toHaveBeenCalledWith('1', 'event-123');
    expect(mockOnReview).toHaveBeenCalledTimes(1);
  });

  it('should not render "Avaliar" button when supplier has review', () => {
    render(
      <ReviewCard supplier={mockSupplierWithReview} onReview={mockOnReview} />
    );

    const button = screen.queryByText('Avaliar');
    expect(button).not.toBeInTheDocument();
  });

  it('should render "Avaliado" text when supplier has review', () => {
    render(
      <ReviewCard supplier={mockSupplierWithReview} onReview={mockOnReview} />
    );

    expect(screen.getByText('Avaliado')).toBeInTheDocument();
  });

  it('should render rate component when supplier has review', () => {
    const { container } = render(
      <ReviewCard supplier={mockSupplierWithReview} onReview={mockOnReview} />
    );

    // Verifica se o componente Rate está presente (Ant Design usa classes específicas)
    const rateComponent = container.querySelector('.ant-rate');
    expect(rateComponent).toBeInTheDocument();
  });

  it('should render rate component as disabled when supplier has review', () => {
    const { container } = render(
      <ReviewCard supplier={mockSupplierWithReview} onReview={mockOnReview} />
    );

    const rateComponent = container.querySelector('.ant-rate-disabled');
    expect(rateComponent).toBeInTheDocument();
  });

  it('should render all supplier information correctly for supplier with review', () => {
    render(
      <ReviewCard supplier={mockSupplierWithReview} onReview={mockOnReview} />
    );

    expect(screen.getByText('DJ Premium Sound')).toBeInTheDocument();
    expect(screen.getByText('Som profissional e iluminação')).toBeInTheDocument();
    expect(screen.getByText('DJ')).toBeInTheDocument();
    expect(screen.getByText('Som')).toBeInTheDocument();
    expect(screen.getByText('Iluminação')).toBeInTheDocument();
  });

  it('should not call onReview when supplier already has review', async () => {
    const user = userEvent.setup();
    render(
      <ReviewCard supplier={mockSupplierWithReview} onReview={mockOnReview} />
    );

    // Tenta clicar no card (não deve haver botão de avaliar)
    const card = screen.getByText('DJ Premium Sound').closest('.ant-card');
    if (card) {
      await user.click(card);
    }

    expect(mockOnReview).not.toHaveBeenCalled();
  });

  it('should render Card component from Ant Design', () => {
    const { container } = render(
      <ReviewCard supplier={mockSupplierWithoutReview} onReview={mockOnReview} />
    );

    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should render Avatar component with correct size', () => {
    const { container } = render(
      <ReviewCard supplier={mockSupplierWithoutReview} onReview={mockOnReview} />
    );

    const avatar = container.querySelector('.ant-avatar');
    expect(avatar).toBeInTheDocument();
    
    // Verifica se tem a classe de tamanho grande ou se tem style com width/height 64px
    const hasLargeClass = avatar?.classList.contains('ant-avatar-lg');
    const hasSize64 = avatar?.getAttribute('style')?.includes('64px');
    
    expect(hasLargeClass || hasSize64).toBe(true);
  });

  it('should render Tags with blue color', () => {
    const { container } = render(
      <ReviewCard supplier={mockSupplierWithoutReview} onReview={mockOnReview} />
    );

    const blueTags = container.querySelectorAll('.ant-tag-blue');
    expect(blueTags.length).toBe(3);
  });
});