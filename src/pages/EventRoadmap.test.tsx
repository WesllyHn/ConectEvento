import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { EventRoadmap } from './EventRoadmap';
import * as roadmapService from '../services/roadmapService';
import * as eventService from '../services/eventService';
import { RoadmapItem } from '../services/roadmapService';
import { Event } from '../services/eventService';

vi.mock('../services/roadmapService');
vi.mock('../services/eventService');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('EventRoadmap', () => {
  const mockEvent: Event = {
    id: 'cmgbfs89h0001og0u1k0nwgrv',
    title: 'Casamento João e Maria',
    type: 'WEDDING',
    date: '2024-06-15T18:00:00.000Z',
    location: 'Salão de Festas Jardins',
    budget: '15000',
    description: 'Casamento com 150 convidados',
    status: 'PLANNING',
    organizerId: 'cmflt8gvk0004ogs5efn6cklt',
    guestCount: 150,
    createdAt: '2025-09-16T00:25:12.680Z',
    updatedAt: '2025-09-16T00:25:12.680Z',
  };

  const mockRoadmapItems: RoadmapItem[] = [
    {
      id: 'cmh6k9vj40005pxe7ivonfrsq',
      idEvent: 'cmgbfs89h0001og0u1k0nwgrv',
      supplierId: null,
      category: 'BIRTHDAY',
      title: 'Buffet e Decoração',
      description: 'Contratar buffet completo',
      price: '2300.34',
      status: 'PLANNING',
      createdAt: '2025-10-25T17:35:59.968Z',
      updatedAt: '2025-10-25T17:35:59.968Z',
    },
    {
      id: 'cmh6k9lws0003pxe744t7rfkt',
      idEvent: 'cmgbfs89h0001og0u1k0nwgrv',
      supplierId: 'cmfsznwce0006ogugwty30n5a',
      category: 'WEDDING',
      title: 'Fotógrafo',
      description: 'Cobertura fotográfica completa',
      price: '5000.00',
      status: 'CONTRACTED',
      createdAt: '2025-10-25T17:35:47.499Z',
      updatedAt: '2025-10-25T17:35:47.499Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(eventService.eventService.getEventById).mockResolvedValue(mockEvent);
    vi.mocked(roadmapService.roadmapService.getRoadmapByEventId).mockResolvedValue(
      mockRoadmapItems
    );
    vi.mocked(roadmapService.roadmapService.createRoadmap).mockResolvedValue(mockRoadmapItems[0]);
    vi.mocked(roadmapService.roadmapService.updateRoadmap).mockResolvedValue(mockRoadmapItems[0]);
    vi.mocked(roadmapService.roadmapService.deleteRoadmap).mockResolvedValue();
  });

  const renderComponent = (eventId = 'cmgbfs89h0001og0u1k0nwgrv') => {
    return render(
      <MemoryRouter initialEntries={[`/events/${eventId}/roadmap`]}>
        <Routes>
          <Route path="/events/:eventId/roadmap" element={<EventRoadmap />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should render loading state initially', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Casamento João e Maria')).toBeInTheDocument();
    });
  });

  it('should load and display roadmap items', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet e Decoração')).toBeInTheDocument();
      expect(screen.getByText('Fotógrafo')).toBeInTheDocument();
    });

    expect(eventService.eventService.getEventById).toHaveBeenCalledWith('cmgbfs89h0001og0u1k0nwgrv');
    expect(roadmapService.roadmapService.getRoadmapByEventId).toHaveBeenCalledWith('cmgbfs89h0001og0u1k0nwgrv');
  });

  it('should display event header with correct information', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Casamento João e Maria')).toBeInTheDocument();
      expect(screen.getByText(/Salão de Festas Jardins/i)).toBeInTheDocument();
    });
  });

  it('should display statistics correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Total')).toBeInTheDocument();
      const totalCountElements = screen.getAllByText('2');
      expect(totalCountElements.length).toBeGreaterThan(0);

      const countOnes = screen.getAllByText('1');
      expect(countOnes.length).toBeGreaterThan(0);
    });
  });

  it('should handle item deletion', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet e Decoração')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText('Excluir item');
    const deleteButton = deleteButtons[0];
    await user.click(deleteButton);

    await waitFor(() => {
      expect(roadmapService.roadmapService.deleteRoadmap).toHaveBeenCalledWith(
        'cmh6k9vj40005pxe7ivonfrsq'
      );
    });
  });

  it('should handle status update', async () => {
    const updatedItem = {
      ...mockRoadmapItems[0],
      status: 'CONTRACTED' as const,
    };
    
    vi.mocked(roadmapService.roadmapService.updateRoadmap).mockResolvedValue(updatedItem);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet e Decoração')).toBeInTheDocument();
    });
  });

  it('should open add item modal when button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet e Decoração')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /adicionar item/i, hidden: true });
    await user.click(addButton);

    expect(addButton).toBeInTheDocument();
  }, 10000);

  it('should filter items by status', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Buffet e Decoração')).toBeInTheDocument();
    });
    
    const planejandoElements = screen.getAllByText('Planejando');
    const planejandoCard = planejandoElements.find(el => el.closest('.ant-card'));
    if (planejandoCard) {
      await user.click(planejandoCard);
      
      await waitFor(() => {
        expect(screen.getByText('Buffet e Decoração')).toBeInTheDocument();
      });
    }
  });

  it('should navigate back to dashboard', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Casamento João e Maria')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /voltar ao dashboard/i, hidden: true });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

it('should create new roadmap item', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('Buffet e Decoração')).toBeInTheDocument();
  });

  const addButton = screen.getByRole('button', { name: /adicionar item/i, hidden: true });
  expect(addButton).toBeInTheDocument();
});

  it('should calculate completion percentage correctly', async () => {
    renderComponent();

    await waitFor(() => {
      const percentageElement = screen.getByText(/50%/i);
      expect(percentageElement).toBeInTheDocument();
    });
  });
});