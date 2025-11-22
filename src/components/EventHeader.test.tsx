import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventHeader } from './EventHeader';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('EventHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEvent = {
    id: '1',
    title: 'Wedding Celebration',
    type: 'WEDDING',
    date: '2024-06-15T18:00:00.000Z',
    location: 'São Paulo, SP',
    budget: 'R$ 20.000 - R$ 50.000',
    status: 'PLANNING',
  };

  const renderComponent = (event = mockEvent, completionPercentage = 60) => {
    return render(
      <BrowserRouter>
        <EventHeader event={event} completionPercentage={completionPercentage} />
      </BrowserRouter>
    );
  };

  it('should render event title', () => {
    renderComponent();

    expect(screen.getByText('Wedding Celebration')).toBeInTheDocument();
  });

  it('should render back to dashboard button', () => {
    renderComponent();

    expect(screen.getByText('Voltar ao Dashboard')).toBeInTheDocument();
  });

  it('should navigate to dashboard when back button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const backButton = screen.getByText('Voltar ao Dashboard');
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should render formatted event date', () => {
    render(<EventHeader event={mockEvent} completionPercentage={60} />);
    
    // Usar regex flexível para qualquer data no formato DD/MM/YYYY
    expect(screen.getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument();
  });

  it('should render event location', () => {
    renderComponent();

    expect(screen.getByText('São Paulo, SP')).toBeInTheDocument();
  });

  it('should render event budget', () => {
    renderComponent();

    expect(screen.getByText('R$ 20.000 - R$ 50.000')).toBeInTheDocument();
  });

  it('should render completion progress with correct percentage', () => {
    renderComponent(mockEvent, 75);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should render "Contratado" label', () => {
    renderComponent();

    expect(screen.getByText('Contratado')).toBeInTheDocument();
  });

  it('should render 0% completion', () => {
    renderComponent(mockEvent, 0);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should render 100% completion', () => {
    renderComponent(mockEvent, 100);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should render different event types', () => {
    const corporateEvent = {
      ...mockEvent,
      title: 'Annual Corporate Meeting',
      type: 'CORPORATE',
    };

    renderComponent(corporateEvent);

    expect(screen.getByText('Annual Corporate Meeting')).toBeInTheDocument();
  });

  it('should render different locations', () => {
    const eventInRio = {
      ...mockEvent,
      location: 'Rio de Janeiro, RJ',
    };

    renderComponent(eventInRio);

    expect(screen.getByText('Rio de Janeiro, RJ')).toBeInTheDocument();
  });

  it('should render different budgets', () => {
    const budgetEvent = {
      ...mockEvent,
      budget: 'R$ 5.000 - R$ 10.000',
    };

    renderComponent(budgetEvent);

    expect(screen.getByText('R$ 5.000 - R$ 10.000')).toBeInTheDocument();
  });

  it('should format date for different dates', () => {
  const eventWithDifferentDate = { ...mockEvent, date: '2025-07-15' };
  render(<EventHeader event={eventWithDifferentDate} completionPercentage={60} />);
  
  // Busca por qualquer data formatada
  expect(screen.getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument();
});

it('should render calendar icon', () => {
  renderComponent();
  expect(screen.getByLabelText('calendar')).toBeInTheDocument();
});

it('should render location icon', () => {
  renderComponent();
  expect(screen.getByLabelText('location')).toBeInTheDocument();
});

it('should render dollar icon', () => {
  renderComponent();
  expect(screen.getByLabelText('budget')).toBeInTheDocument();
});

it('should render back arrow icon', () => {
  renderComponent();
  expect(screen.getByLabelText('back-arrow')).toBeInTheDocument();
});

it('should render all event details together', () => {
  const event = {
    id: '1',
    title: 'Wedding Celebration',
    date: '2024-06-15',
    location: 'São Paulo, SP',
    budget: 'R$ 20.000 - R$ 50.000',
    type: 'WEDDING',
    status: 'active' as const,
  };

  render(<EventHeader event={event} completionPercentage={60} />);

  expect(screen.getByText('Wedding Celebration')).toBeInTheDocument();
  expect(screen.getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument();
  expect(screen.getByText('São Paulo, SP')).toBeInTheDocument();
  expect(screen.getByText(/R\$ 20\.000 - R\$ 50\.000/)).toBeInTheDocument();
  expect(screen.getByText('60%')).toBeInTheDocument();
});
});