import { FileText, Clock, Search, CheckCircle, CheckCheck } from 'lucide-react';

interface RoadmapStatsProps {
  stats: {
    total: number;
    planning: number;
    searching: number;
    contracted: number;
    completed: number;
  };
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function RoadmapStats({ stats, activeFilter, onFilterChange }: RoadmapStatsProps) {
  const statCards = [
    { key: 'all', label: 'Total', value: stats.total, icon: FileText, gradient: 'from-blue-500 to-blue-600',textColor: 'blue' },
    { key: 'PLANNING', label: 'Planejando', value: stats.planning, icon: Clock, gradient: 'from-gray-500 to-gray-600', textColor: 'gray' },
    { key: 'SEARCHING', label: 'Buscando', value: stats.searching, icon: Search, gradient: 'from-amber-500 to-amber-600', textColor: 'orange' },
    { key: 'CONTRACTED', label: 'Contratado', value: stats.contracted, icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600', textColor: 'emerald' },
    { key: 'COMPLETED', label: 'Concluído', value: stats.completed, icon: CheckCheck, gradient: 'from-blue-500 to-blue-600', textColor: 'blue' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statCards.map(({ key, label, value, icon: Icon, gradient, textColor }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${gradient} backdrop-blur-sm border-2 ${
            activeFilter === key ? 'border-white shadow-xl scale-105' : 'border-white/20 shadow-lg'
          } hover:shadow-xl transition-all duration-300 group`}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl transform translate-x-6 -translate-y-6"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center">
                <Icon className={`w-5 h-5 text-${textColor}-700 group-hover:scale-110 transition-transform`} />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
            </div>
            <p className="text-white/90 font-medium text-sm">{label}</p>
            {activeFilter === key && (
              <p className="text-xs text-white/80 mt-1 font-semibold">✓ Filtro ativo</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
