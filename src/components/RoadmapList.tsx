import { Empty, Spin } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { RoadmapItemCard } from './RoadmapItem';
import { RoadmapItem } from '../../services/roadmapService';

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
        <Spin size="large" tip="Carregando roadmap..." />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Empty
        image={<InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
        description="Nenhum item encontrado"
      />
    );
  }

  return (
    <div>
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
