import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoadmapStats } from './RoadmapStats';

describe('RoadmapStats', () => {
  const mockStats = {
    total: 10,
    planning: 3,
    searching: 2,
    contracted: 4,
    completed: 1,
  };

  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all stat cards with correct values', () => {
    render(
      <RoadmapStats
        stats={mockStats}
        activeFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Planejando')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Buscando')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Contratado')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should highlight active filter card', () => {
    const { container } = render(
      <RoadmapStats
        stats={mockStats}
        activeFilter="PLANNING"
        onFilterChange={mockOnFilterChange}
      />
    );
  // Corrigido: pega os cards por '.rounded-2xl'h
    const cards = container.querySelectorAll('.rounded-2xl');
    // Planejando é o segundo card no array
    expect(cards[1].classList.contains('scale-105')).toBe(true);
    expect(cards[1].classList.contains('border-white')).toBe(true);
  });


  it('should call onFilterChange when a card is clicked', () => {
    render(
      <RoadmapStats
        stats={mockStats}
        activeFilter="all"
        onFilterChange={mockOnFilterChange}
      />
    );
    // Busca o botão "Planejando":
    const planningCard = screen.getByText('Planejando').closest('button');
    fireEvent.click(planningCard!);
    expect(mockOnFilterChange).toHaveBeenCalledWith('PLANNING');
  });

  it('should show "Filtro ativo" text on active filter', () => {
    render(
      <RoadmapStats
        stats={mockStats}
        activeFilter="CONTRACTED"
        onFilterChange={mockOnFilterChange}
      />
    );
    // Tem ✓ Filtro ativo
    const activeTexts = screen.getAllByText(/Filtro ativo/);
    expect(activeTexts).toHaveLength(1);
    expect(activeTexts[0].textContent).toContain('✓'); // Adicional: confere o check
  });
});
