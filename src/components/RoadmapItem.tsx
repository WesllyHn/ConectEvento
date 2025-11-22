import { Button, Select, Tooltip } from 'antd';
import { DeleteOutlined, SearchOutlined, DollarOutlined, FileTextOutlined } from '@ant-design/icons';
import { RoadmapItem as RoadmapItemType } from '../services/roadmapService';
import { eventTypes } from '../data/mockData';

const { Option } = Select;

interface RoadmapItemProps {
  item: RoadmapItemType;
  onStatusChange: (itemId: string, newStatus: RoadmapItemType['status']) => void;
  onDelete: (itemId: string) => void;
  onSearch: () => void;
}

const statusConfig = {
  PLANNING: { 
    label: 'Planejando',
    color: 'bg-gray-100 text-gray-700 border-gray-200'
  },
  SEARCHING: { 
    label: 'Buscando',
    color: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  CONTRACTED: { 
    label: 'Contratado',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
  COMPLETED: { 
    label: 'Concluído',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
} as const;

// Normaliza o status para o formato correto
const normalizeStatus = (status: string): keyof typeof statusConfig => {
  const statusMap: Record<string, keyof typeof statusConfig> = {
    'Planejando': 'PLANNING',
    'Buscando': 'SEARCHING', 
    'Contratado': 'CONTRACTED',
    'Concluído': 'COMPLETED',
    'PLANNING': 'PLANNING',
    'SEARCHING': 'SEARCHING',
    'CONTRACTED': 'CONTRACTED',
    'COMPLETED': 'COMPLETED'
  };
  
  return statusMap[status] || 'PLANNING';
};

export function RoadmapItemCard({ item, onStatusChange, onDelete, onSearch }: RoadmapItemProps) {
  const normalizedStatus = normalizeStatus(item.status);
  const config = statusConfig[normalizedStatus];
  console.log("item", item)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold border ${config.color}`}>
            {config.label}
          </span>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
            {eventTypes.find(et => et.value === item.category)?.label}
          </span>
        </div>
        
        <Tooltip title="Excluir">
          <button
            onClick={() => onDelete(item.id)}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            aria-label="Excluir item"
          >
            <DeleteOutlined />
          </button>
        </Tooltip>
      </div>

      {/* Título */}
      <h3 className="text-lg font-bold text-gray-900 mb-3">
        {item.title}
      </h3>

      {/* Descrição */}
      {item.description && (
        <div className="flex gap-2 mb-3 text-gray-600 text-sm">
          <FileTextOutlined className="text-blue-500 mt-0.5" />
          <p>{item.description}</p>
        </div>
      )}

      {/* Preço */}
      {item.price != null && (
        <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 mb-4">
          <DollarOutlined className="text-emerald-600" />
          <span className="font-bold text-emerald-700">
            R$ {Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <Select
          value={normalizedStatus}
          onChange={(value) => onStatusChange(item.id, value)}
          className="flex-1"
          size="large"
        >
          <Option value="PLANNING">Planejando</Option>
          <Option value="SEARCHING">Buscando</Option>
          <Option value="CONTRACTED">Contratado</Option>
          <Option value="COMPLETED">Concluído</Option>
        </Select>

        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={onSearch}
          size="large"
        >
          Buscar
        </Button>
      </div>
    </div>
  );
}
