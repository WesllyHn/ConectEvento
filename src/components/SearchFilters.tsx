import { Input, Select, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface SearchFiltersProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  locationValue?: string;
  onLocationChange?: (value: string) => void;
  filters?: Array<{
    value: string;
    onChange: (value: string) => void;
    options: Array<{ label: string; value: string }>;
    placeholder: string;
  }>;
}

export function SearchFilters({
  searchValue,
  onSearchChange,
  locationValue,
  onLocationChange,
  filters = []
}: SearchFiltersProps) {
  return (
    <Card>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {onSearchChange && (
          <Input
            prefix={<SearchOutlined />}
            placeholder="Buscar..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            size="large"
          />
        )}

        {onLocationChange && (
          <Input
            placeholder="Localização..."
            value={locationValue}
            onChange={(e) => onLocationChange(e.target.value)}
            size="large"
          />
        )}

        {filters.map((filter, index) => (
          <Select
            key={index}
            value={filter.value}
            onChange={filter.onChange}
            placeholder={filter.placeholder}
            size="large"
            className="w-full"
            options={filter.options}
          />
        ))}
      </div>
    </Card>
  );
}
