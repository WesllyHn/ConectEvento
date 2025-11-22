import { Spin } from 'antd';
import { FileText } from 'lucide-react';
import { RoadmapItemCard } from './RoadmapItem';
import { RoadmapItem } from '../services/roadmapService';

interface RoadmapListProps {
  items: RoadmapItem[];
  loading?: boolean;
  onStatusChange: (itemId: string, newStatus: RoadmapItem['status']) => void;
  onDelete: (itemId: string) => void;
  onSearch: () => void;
}

export function RoadmapList({ items, loading, onStatusChange, onDelete, onSearch }: RoadmapListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <p className="text-gray-600 mt-4">Carregando roadmap...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum item encontrado</h3>
        <p className="text-gray-600">Adicione itens ao roadmap para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <RoadmapItemCard
          key={item.id}
          item={item}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onSearch={onSearch}
        />
      ))}
    </div>
  );
}
