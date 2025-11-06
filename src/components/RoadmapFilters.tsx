import { Select, Space } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { Option } = Select;

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
    <Space size="middle" wrap>
      <Space>
        <FilterOutlined />
        <span className="text-gray-600">Filtros:</span>
      </Space>

      <Select
        value={activeStatusFilter}
        onChange={onStatusChange}
        style={{ width: 200 }}
        placeholder="Filtrar por status"
      >
        <Option value="all">Todos os status</Option>
        <Option value="PLANNING">Planejando</Option>
        <Option value="SEARCHING">Buscando</Option>
        <Option value="CONTRACTED">Contratado</Option>
        <Option value="COMPLETED">Concluído</Option>
      </Select>

      <Select
        value={filterCategory}
        onChange={onCategoryChange}
        style={{ width: 200 }}
        placeholder="Filtrar por categoria"
      >
        <Option value="all">Todas as categorias</Option>
        {categories.map((category) => (
          <Option key={category} value={category}>
            {category}
          </Option>
        ))}
      </Select>
    </Space>
  );
}
