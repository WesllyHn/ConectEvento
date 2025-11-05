import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it, describe, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// IMPORTANTE: Mocks devem vir ANTES de importar o componente Home
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Ajustando o caminho - provavelmente os componentes estão em src/components
vi.mock('../../components/Hero', () => ({
  Hero: () => <div data-testid="hero-component">Hero Component</div>,
}));

vi.mock('../../components/FeaturedSuppliers', () => ({
  FeaturedSuppliers: () => <div data-testid="featured-suppliers-component">Featured Suppliers Component</div>,
}));

vi.mock('../../components/Features', () => ({
  Features: () => <div data-testid="features-component">Features Component</div>,
}));

// AGORA importa o Home DEPOIS dos mocks
import { Home } from '../Home';

describe('Home', () => {
  it('should render Hero, FeaturedSuppliers and Features components', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByTestId('hero-component')).toBeInTheDocument();
    expect(screen.getByTestId('featured-suppliers-component')).toBeInTheDocument();
    expect(screen.getByTestId('features-component')).toBeInTheDocument();
  });
});