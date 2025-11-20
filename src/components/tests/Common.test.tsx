import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Star, Users, Calendar, TrendingUp } from 'lucide-react';
import {
  DataCard,
  StatCard,
  ActionButton,
  SearchFilters,
  ColoredStatCard
} from '../Common';

describe('UIComponents', () => {
  describe('DataCard', () => {
    it('should render children', () => {
      render(
        <DataCard>
          <p>Card content</p>
        </DataCard>
      );

      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(
        <DataCard title="Card Title">
          <p>Content</p>
        </DataCard>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('should render extra content when provided', () => {
      render(
        <DataCard extra={<button>Extra Button</button>}>
          <p>Content</p>
        </DataCard>
      );

      expect(screen.getByText('Extra Button')).toBeInTheDocument();
    });

    it('should render status badge with correct color - warning', () => {
      render(
        <DataCard status={{ text: 'Pending', color: 'warning' }}>
          <p>Content</p>
        </DataCard>
      );

      const statusBadge = screen.getByText('Pending');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass('bg-amber-100', 'text-amber-700');
    });

    it('should render status badge with correct color - success', () => {
      render(
        <DataCard status={{ text: 'Completed', color: 'success' }}>
          <p>Content</p>
        </DataCard>
      );

      const statusBadge = screen.getByText('Completed');
      expect(statusBadge).toHaveClass('bg-emerald-100', 'text-emerald-700');
    });

    it('should render status badge with correct color - blue', () => {
      render(
        <DataCard status={{ text: 'Active', color: 'blue' }}>
          <p>Content</p>
        </DataCard>
      );

      const statusBadge = screen.getByText('Active');
      expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('should render status badge with correct color - error', () => {
      render(
        <DataCard status={{ text: 'Failed', color: 'error' }}>
          <p>Content</p>
        </DataCard>
      );

      const statusBadge = screen.getByText('Failed');
      expect(statusBadge).toHaveClass('bg-red-100', 'text-red-700');
    });

    it('should render all props together', () => {
      render(
        <DataCard
          title="Full Card"
          extra={<span>Extra</span>}
          status={{ text: 'Active', color: 'success' }}
        >
          <p>Main content</p>
        </DataCard>
      );

      expect(screen.getByText('Full Card')).toBeInTheDocument();
      expect(screen.getByText('Extra')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toBeInTheDocument();
    });

    it('should apply hover styles', () => {
      const { container } = render(
        <DataCard>
          <p>Content</p>
        </DataCard>
      );

      const card = container.firstChild;
      expect(card).toHaveClass('hover:border-blue-200', 'hover:shadow-md');
    });
  });

  describe('StatCard', () => {
    it('should render title and value', () => {
      render(<StatCard title="Total Users" value={150} icon={Users} />);

      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should render with string value', () => {
      render(<StatCard title="Revenue" value="$1,500" icon={TrendingUp} />);

      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('$1,500')).toBeInTheDocument();
    });

    it('should render icon', () => {
      const { container } = render(
        <StatCard title="Events" value={25} icon={Calendar} />
      );

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should apply default icon color', () => {
      const { container } = render(
        <StatCard title="Rating" value={4.5} icon={Star} />
      );

      const iconContainer = container.querySelector('.text-blue-600');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply custom icon color', () => {
      const { container } = render(
        <StatCard title="Rating" value={4.5} icon={Star} iconColor="text-amber-500" />
      );

      const iconContainer = container.querySelector('.text-amber-500');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should have hover effect', () => {
      const { container } = render(
        <StatCard title="Total" value={100} icon={Users} />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('hover:shadow-xl');
    });
  });

  describe('ActionButton', () => {
    it('should render button with text', () => {
      render(<ActionButton>Click Me</ActionButton>);

      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('should render button with icon', () => {
      const { container } = render(
        <ActionButton icon={Star}>With Icon</ActionButton>
      );

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<ActionButton onClick={handleClick}>Click</ActionButton>);

      const button = screen.getByText('Click');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should apply primary type styles', () => {
      render(<ActionButton type="primary">Primary</ActionButton>);

      const button = screen.getByText('Primary');
      expect(button).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should apply default type styles', () => {
      render(<ActionButton type="default">Default</ActionButton>);

      const button = screen.getByText('Default');
      expect(button).toHaveClass('bg-white', 'text-gray-700');
    });

    it('should apply dashed type styles', () => {
      render(<ActionButton type="dashed">Dashed</ActionButton>);

      const button = screen.getByText('Dashed');
      expect(button).toHaveClass('border-dashed');
    });

    it('should apply link type styles', () => {
      render(<ActionButton type="link">Link</ActionButton>);

      const button = screen.getByText('Link');
      expect(button).toHaveClass('text-blue-600');
    });

    it('should apply text type styles', () => {
      render(<ActionButton type="text">Text</ActionButton>);

      const button = screen.getByText('Text');
      expect(button).toHaveClass('bg-transparent');
    });

    it('should apply danger styles', () => {
      render(<ActionButton danger>Danger</ActionButton>);

      const button = screen.getByText('Danger');
      expect(button).toHaveClass('bg-red-600', 'text-white');
    });

    it('should be disabled when disabled prop is true', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <ActionButton onClick={handleClick} disabled>
          Disabled
        </ActionButton>
      );

      const button = screen.getByText('Disabled');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should apply small size styles', () => {
      render(<ActionButton size="small">Small</ActionButton>);

      const button = screen.getByText('Small');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('should apply middle size styles', () => {
      render(<ActionButton size="middle">Middle</ActionButton>);

      const button = screen.getByText('Middle');
      expect(button).toHaveClass('px-4', 'py-2.5', 'text-base');
    });

    it('should apply large size styles', () => {
      render(<ActionButton size="large">Large</ActionButton>);

      const button = screen.getByText('Large');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });

    it('should apply block styles', () => {
      render(<ActionButton block>Block</ActionButton>);

      const button = screen.getByText('Block');
      expect(button).toHaveClass('w-full');
    });

    it('should combine multiple props', () => {
      render(
        <ActionButton type="primary" size="large" block icon={Star}>
          Combined
        </ActionButton>
      );

      const button = screen.getByText('Combined');
      expect(button).toHaveClass('bg-blue-600', 'px-6', 'py-3', 'w-full');
    });
  });

  describe('SearchFilters', () => {
    it('should render search input when onSearchChange is provided', () => {
      const handleSearch = vi.fn();

      render(<SearchFilters onSearchChange={handleSearch} />);

      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    });

    it('should render location input when onLocationChange is provided', () => {
      const handleLocation = vi.fn();

      render(<SearchFilters onLocationChange={handleLocation} />);

      expect(screen.getByPlaceholderText('Localização...')).toBeInTheDocument();
    });

    it('should call onSearchChange when typing in search input', async () => {
      const handleSearch = vi.fn();
      const user = userEvent.setup();

      render(<SearchFilters onSearchChange={handleSearch} />);

      const searchInput = screen.getByPlaceholderText('Buscar...');
      await user.type(searchInput, 'test');

      expect(handleSearch).toHaveBeenCalled();
    });

    it('should call onLocationChange when typing in location input', async () => {
      const handleLocation = vi.fn();
      const user = userEvent.setup();

      render(<SearchFilters onLocationChange={handleLocation} />);

      const locationInput = screen.getByPlaceholderText('Localização...');
      await user.type(locationInput, 'São Paulo');

      expect(handleLocation).toHaveBeenCalled();
    });

    it('should display search value', () => {
      render(
        <SearchFilters searchValue="existing search" onSearchChange={vi.fn()} />
      );

      const searchInput = screen.getByPlaceholderText('Buscar...') as HTMLInputElement;
      expect(searchInput.value).toBe('existing search');
    });

    it('should display location value', () => {
      render(
        <SearchFilters
          locationValue="Rio de Janeiro"
          onLocationChange={vi.fn()}
        />
      );

      const locationInput = screen.getByPlaceholderText('Localização...') as HTMLInputElement;
      expect(locationInput.value).toBe('Rio de Janeiro');
    });

    it('should render custom filters', () => {
      const filters = [
        {
          value: 'all',
          onChange: vi.fn(),
          options: [
            { label: 'Todos', value: 'all' },
            { label: 'Ativos', value: 'active' },
          ],
          placeholder: 'Filtrar por status',
        },
      ];

      const { container } = render(<SearchFilters filters={filters} />);

      // Verifica se o Select do Ant Design foi renderizado
      const select = container.querySelector('.ant-select');
      expect(select).toBeInTheDocument();
    });

    it('should render multiple filters', () => {
      const filters = [
        {
          value: 'all',
          onChange: vi.fn(),
          options: [{ label: 'Todos', value: 'all' }],
          placeholder: 'Status',
        },
        {
          value: 'any',
          onChange: vi.fn(),
          options: [{ label: 'Qualquer', value: 'any' }],
          placeholder: 'Categoria',
        },
      ];

      const { container } = render(<SearchFilters filters={filters} />);

      // Verifica se múltiplos Selects foram renderizados
      const selects = container.querySelectorAll('.ant-select');
      expect(selects.length).toBe(2);
    });

    it('should render all components together', () => {
      const filters = [
        {
          value: 'all',
          onChange: vi.fn(),
          options: [{ label: 'Todos', value: 'all' }],
          placeholder: 'Filtro',
        },
      ];

      const { container } = render(
        <SearchFilters
          searchValue="test"
          onSearchChange={vi.fn()}
          locationValue="SP"
          onLocationChange={vi.fn()}
          filters={filters}
        />
      );

      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Localização...')).toBeInTheDocument();

      // Verifica se o Select foi renderizado
      const select = container.querySelector('.ant-select');
      expect(select).toBeInTheDocument();
    });
  });

  describe('ColoredStatCard', () => {
    it('should render title and value', () => {
      render(
        <ColoredStatCard
          title="Total Sales"
          value={1500}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          iconText="blue-600"
        />
      );

      expect(screen.getByText('Total Sales')).toBeInTheDocument();
      expect(screen.getByText('1500')).toBeInTheDocument();
    });

    it('should render with string value', () => {
      render(
        <ColoredStatCard
          title="Revenue"
          value="$5,000"
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          iconText="emerald-600"
        />
      );

      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('$5,000')).toBeInTheDocument();
    });

    it('should render icon', () => {
      const { container } = render(
        <ColoredStatCard
          title="Users"
          value={250}
          icon={Users}
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
          iconText="purple-600"
        />
      );

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should apply gradient background', () => {
      const { container } = render(
        <ColoredStatCard
          title="Events"
          value={42}
          icon={Calendar}
          gradient="bg-gradient-to-br from-amber-500 to-amber-700"
          iconText="amber-600"
        />
      );

      const card = container.querySelector('.bg-gradient-to-br');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('from-amber-500', 'to-amber-700');
    });

    it('should apply icon text color', () => {
      const { container } = render(
        <ColoredStatCard
          title="Rating"
          value={4.8}
          icon={Star}
          gradient="bg-gradient-to-br from-yellow-500 to-yellow-700"
          iconText="yellow-600"
        />
      );

      const iconElement = container.querySelector('.text-yellow-600');
      expect(iconElement).toBeInTheDocument();
    });

    it('should have hover effect', () => {
      const { container } = render(
        <ColoredStatCard
          title="Total"
          value={100}
          icon={Users}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          iconText="blue-600"
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('hover:shadow-xl', 'group');
    });

    it('should render decorative background element', () => {
      const { container } = render(
        <ColoredStatCard
          title="Active"
          value={89}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-green-500 to-green-700"
          iconText="green-600"
        />
      );

      const decorativeElement = container.querySelector('.bg-white\\/10');
      expect(decorativeElement).toBeInTheDocument();
    });

    it('should render with group hover scale effect', () => {
      const { container } = render(
        <ColoredStatCard
          title="Complete"
          value={95}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
          iconText="indigo-600"
        />
      );

      const iconContainer = container.querySelector('.group-hover\\:scale-110');
      expect(iconContainer).toBeInTheDocument();
    });
  });
});