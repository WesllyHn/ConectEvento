import { Card, Tag, Button, Select, Space, Typography } from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { RoadmapItem as RoadmapItemType } from '../services/roadmapService';

const { Text, Title } = Typography;
const { Option } = Select;

interface RoadmapItemProps {
  item: RoadmapItemType;
  onStatusChange: (itemId: string, newStatus: RoadmapItemType['status']) => void;
  onDelete: (itemId: string) => void;
  onSearch: () => void;
}

const statusColors = {
  PLANNING: 'default',
  SEARCHING: 'warning',
  CONTRACTED: 'success',
  COMPLETED: 'blue',
} as const;

const statusLabels = {
  PLANNING: 'Planejando',
  SEARCHING: 'Buscando',
  CONTRACTED: 'Contratado',
  COMPLETED: 'Concluído',
} as const;

export function RoadmapItemCard({ item, onStatusChange, onDelete, onSearch }: RoadmapItemProps) {
  return (
    <Card
      hoverable
      className="mb-4"
      actions={[
        <Select
          key="status"
          value={item.status}
          onChange={(value) => onStatusChange(item.id, value)}
          style={{ width: 150 }}
        >
          <Option value="PLANNING">Planejando</Option>
          <Option value="SEARCHING">Buscando</Option>
          <Option value="CONTRACTED">Contratado</Option>
          <Option value="COMPLETED">Concluído</Option>
        </Select>,
        <Button
          key="search"
          type="primary"
          icon={<SearchOutlined />}
          onClick={onSearch}
        >
          Buscar
        </Button>,
        <Button
          key="delete"
          type="text"
          danger
          aria-label="Excluir item" 
          icon={<DeleteOutlined />}
          onClick={() => onDelete(item.id)}
        />,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Tag color={statusColors[item.status]}>{statusLabels[item.status]}</Tag>
          <Tag>{item.category}</Tag>
        </Space>

        <Title level={4} style={{ margin: 0 }}>
          {item.title}
        </Title>

        {item.description && (
          <Text type="secondary">{item.description}</Text>
        )}

        {item.price && (
          <Text strong style={{ color: '#52c41a' }}>
            Preço: R$ {item.price}
          </Text>
        )}
      </Space>
    </Card>
  );
}
