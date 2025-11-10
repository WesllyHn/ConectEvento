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
    color: 'warning' | 'success' | 'blue' | 'error';
  };
}

export function DataCard({ title, children, extra, status }: DataCardProps) {
  const statusColors = {
    warning: 'bg-amber-100 text-amber-700',
    success: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    error: 'bg-red-100 text-red-700'
  };

  return (
    <div className="border-2 border-gray-100 rounded-xl p-6 hover:border-blue-200 hover:shadow-md transition-all duration-200">
      {(title || extra || status) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
          <div className="flex items-center gap-2">
            {status && (
              <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${statusColors[status.color]}`}>
                {status.text}
              </span>
            )}
            {extra}
          </div>
        </div>
      )}
      <div>
        {children}
      </div>
    </div>
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
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
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    middle: 'px-4 py-2.5 text-base',
    large: 'px-6 py-3 text-lg'
  };

  const typeClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600',
    default: 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
    dashed: 'bg-white text-gray-700 hover:bg-gray-50 border-dashed border-gray-300',
    link: 'bg-transparent text-blue-600 hover:text-blue-700 border-transparent',
    text: 'bg-transparent text-gray-700 hover:bg-gray-100 border-transparent'
  };

  const dangerClasses = danger
    ? 'bg-red-600 text-white hover:bg-red-700 border-red-600'
    : typeClasses[type];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2 font-semibold rounded-xl
        border-2 transition-all duration-200 shadow-sm hover:shadow-md
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${dangerClasses}
        ${block ? 'w-full' : ''}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {onSearchChange && (
          <div className="relative">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              size="large"
              className="rounded-xl"
            />
          </div>
        )}

        {onLocationChange && (
          <div className="relative">
            <Input
              placeholder="Localização..."
              value={locationValue}
              onChange={(e) => onLocationChange(e.target.value)}
              size="large"
              className="rounded-xl"
            />
          </div>
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
    </div>
  );
}

interface ColoredStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient: string;
  iconText: string;
}

export function ColoredStatCard({
  title,
  value,
  icon: Icon,
  gradient,
  iconText
}: ColoredStatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 ${gradient} backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300">
            <Icon className={`w-6 h-6 text-${iconText} group-hover:scale-110 transition-transform duration-300`} />
          </div>
          <div className="text-3xl font-bold text-white">
            {value}
          </div>
        </div>
        <p className="text-white/90 font-medium text-sm">{title}</p>
      </div>
    </div>
  );
}
