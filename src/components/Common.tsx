import { Card, Tag, Statistic, Input, Select, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface DataCardProps {
  title?: string;
  children: ReactNode;
  extra?: ReactNode;
  status?: {
    text: string;
    color: string;
  };
}

export function DataCard({ title, children, extra, status }: DataCardProps) {
  return (
    <Card
      title={title}
      extra={
        <div className="flex items-center gap-2">
          {status && <Tag color={status.color}>{status.text}</Tag>}
          {extra}
        </div>
      }
    >
      {children}
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, iconColor = 'text-blue-600' }: StatCardProps) {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={<Icon className={`w-5 h-5 ${iconColor}`} />}
      />
    </Card>
  );
}

interface ActionButtonProps {
  icon?: LucideIcon;
  children: ReactNode;
  onClick?: () => void;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  danger?: boolean;
  disabled?: boolean;
  block?: boolean;
  size?: 'small' | 'middle' | 'large';
}

export function ActionButton({
  icon: Icon,
  children,
  onClick,
  type = 'default',
  danger,
  disabled,
  block,
  size = 'middle'
}: ActionButtonProps) {
  return (
    <Button
      type={type}
      danger={danger}
      disabled={disabled}
      block={block}
      size={size}
      onClick={onClick}
      icon={Icon && <Icon className="w-4 h-4" />}
    >
      {children}
    </Button>
  );
}

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
