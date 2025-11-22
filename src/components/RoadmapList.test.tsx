import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoadmapList } from './RoadmapList';
import { RoadmapItem } from '../services';

describe('RoadmapList', () => {
  const mockItems: RoadmapItem[] = [
    {
      id: '1',
      idEvent: 'event-1',
      category: 'BIRTHDAY',
      title: 'Item 1',
      description: 'Description 1',
      price: '1000',
      status: 'PLANNING',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      idEvent: 'event-1',
      category: 'WEDDING',
      title: 'Item 2',
      description: 'Description 2',
      price: '2000',
      status: 'CONTRACTED',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ];

  const mockOnStatusChange = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSearch = vi.fn();

it('should display loading state', () => {
  const { container } = render(
    <RoadmapList 
      items={[]} 
      loading={true} 
      onStatusChange={vi.fn()} 
      onDelete={vi.fn()} 
      onSearch={vi.fn()} 
    />
  );

  const spinner = container.querySelector('.ant-spin-spinning');
  expect(spinner).toBeInTheDocument();
  
  const loadingElement = container.querySelector('[aria-busy="true"]');
  expect(loadingElement).toBeInTheDocument();
});

  it('should display empty state when no items', () => {
    render(
      <RoadmapList
        items={[]}
        loading={false}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        onSearch={mockOnSearch}
      />
    );

    expect(screen.getByText(/nenhum item encontrado/i)).toBeInTheDocument();
  });

  it('should render all items', () => {
    render(
      <RoadmapList
        items={mockItems}
        loading={false}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        onSearch={mockOnSearch}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('should pass callbacks to RoadmapItemCard', () => {
    const { container } = render(
      <RoadmapList
        items={mockItems}
        loading={false}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        onSearch={mockOnSearch}
      />
    );
    const cards = container.querySelectorAll('.rounded-xl');
    expect(cards.length).toBe(2);

  });

});
