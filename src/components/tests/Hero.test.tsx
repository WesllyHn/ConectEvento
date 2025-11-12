import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Hero } from '../Hero';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Hero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );
  };

  it('should render hero section with correct heading', () => {
    renderComponent();

    expect(screen.getByText(/Transforme seu evento/i)).toBeInTheDocument();
    expect(screen.getByText(/melhores profissionais/i)).toBeInTheDocument();
    expect(screen.getByText(/Conecte-se com fornecedores qualificados/i)).toBeInTheDocument();
  });

  it('should render subtitle correctly', () => {
    renderComponent();

    expect(
      screen.getByText(/Conecte-se com fornecedores qualificados/i)
    ).toBeInTheDocument();
  });

  it('should render search input with correct placeholder', () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText(/Buffet, DJ, decoração/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should render location input with correct placeholder', () => {
    renderComponent();

    const locationInput = screen.getByPlaceholderText(/Sua cidade/i);
    expect(locationInput).toBeInTheDocument();
  });

  it('should render budget select with all options', () => {
    renderComponent();

    expect(screen.getByText('Orçamento')).toBeInTheDocument();
    expect(screen.getByText(/Até R\$ 5\.000/)).toBeInTheDocument();
    expect(screen.getByText(/R\$ 5\.000 - R\$ 15\.000/)).toBeInTheDocument();
    expect(screen.getByText(/R\$ 15\.000 - R\$ 30\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Acima de R\$ 30\.000/)).toBeInTheDocument();
  });

  it('should render search button', () => {
    renderComponent();
    const searchButton = screen.getByText(/Buscar Agora/i);
    expect(searchButton).toBeInTheDocument();
  });

  it('should update search query when typing', async () => {
    const user = userEvent.setup();
    renderComponent();

    const searchInput = screen.getByPlaceholderText(/Buffet, DJ, decoração/i);
    await user.type(searchInput, 'buffet');

    expect(searchInput).toHaveValue('buffet');
  });

  it('should update location when typing', async () => {
    const user = userEvent.setup();
    renderComponent();

    const locationInput = screen.getByPlaceholderText(/Sua cidade/i);
    await user.type(locationInput, 'São Paulo');

    expect(locationInput).toHaveValue('São Paulo');
  });

  it('should navigate with search params when form is submitted', async () => {
    const user = userEvent.setup();
    renderComponent();

    const searchInput = screen.getByPlaceholderText(/Buffet, DJ, decoração/i);
    const locationInput = screen.getByPlaceholderText(/Sua cidade/i);
    const searchButton = screen.getByText(/Buscar Agora/i);

    await user.type(searchInput, 'buffet');
    await user.type(locationInput, 'São Paulo');
    await user.click(searchButton);

    expect(mockNavigate).toHaveBeenCalledWith('/suppliers?search=buffet&location=São Paulo&budget=');
  });

  it('should navigate with empty params when form is submitted without filling inputs', async () => {
    const user = userEvent.setup();
    renderComponent();

    const searchButton = screen.getByText(/Buscar Agora/i);
    await user.click(searchButton);

    expect(mockNavigate).toHaveBeenCalledWith('/suppliers?search=&location=&budget=');
  });

  it('should navigate with only search query when location is empty', async () => {
    const user = userEvent.setup();
    renderComponent();

    const searchInput = screen.getByPlaceholderText(/Buffet, DJ, decoração/i);
    const searchButton = screen.getByText(/Buscar Agora/i);

    await user.type(searchInput, 'DJ');
    await user.click(searchButton);

    expect(mockNavigate).toHaveBeenCalledWith('/suppliers?search=DJ&location=&budget=');
  });

  it('should navigate with only location when search query is empty', async () => {
    const user = userEvent.setup();
    renderComponent();

    const locationInput = screen.getByPlaceholderText(/Sua cidade/i);
    const searchButton = screen.getByText(/Buscar Agora/i);

    await user.type(locationInput, 'Rio de Janeiro');
    await user.click(searchButton);

    expect(mockNavigate).toHaveBeenCalledWith('/suppliers?search=&location=Rio de Janeiro&budget=');
  });

  it('should submit form when pressing Enter in search input', async () => {
    const user = userEvent.setup();
    renderComponent();

    const searchInput = screen.getByPlaceholderText(/Buffet, DJ, decoração/i);
    await user.type(searchInput, 'decoração{Enter}');

    expect(mockNavigate).toHaveBeenCalledWith('/suppliers?search=decoração&location=&budget=');
  });

  it('should submit form when pressing Enter in location input', async () => {
    const user = userEvent.setup();
    renderComponent();

    const locationInput = screen.getByPlaceholderText(/Sua cidade/i);
    await user.type(locationInput, 'Curitiba{Enter}');

    expect(mockNavigate).toHaveBeenCalledWith('/suppliers?search=&location=Curitiba&budget=');
  });

  it('should render icons correctly', () => {
    const { container } = renderComponent();
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });
});
