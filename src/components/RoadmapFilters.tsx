import { Filter } from 'lucide-react';
import { eventTypes } from '../data/mockData';

interface RoadmapFiltersProps {
  activeStatusFilter: string;
  filterCategory: string;
  categories: string[];
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function RoadmapFilters({
  activeStatusFilter,
  filterCategory,
  categories,
  onStatusChange,
  onCategoryChange,
}: RoadmapFiltersProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2 text-gray-600">
        <Filter className="w-5 h-5" />
        <span className="font-medium">Filtros:</span>
      </div>

      <select
        value={activeStatusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      >
        <option value="all">Todos os status</option>
        <option value="PLANNING">Planejando</option>
        <option value="SEARCHING">Buscando</option>
        <option value="CONTRACTED">Contratado</option>
        <option value="COMPLETED">Concluído</option>
      </select>

      <select
        value={filterCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      >
        <option value="all">Todas as categorias</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {eventTypes.find(et => et.value === category)?.label}
          </option>
        ))}
      </select>
    </div>
  );
}
