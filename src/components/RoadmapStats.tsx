import { Card, Statistic, Row, Col } from 'antd';
import { ClockCircleOutlined, SearchOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons';

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
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6} lg={4}>
        <Card
          hoverable
          onClick={() => onFilterChange('all')}
          className={activeFilter === 'all' ? 'border-2 border-blue-500' : ''}
        >
          <Statistic
            title="Total"
            value={stats.total}
            prefix={<FileTextOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
          {activeFilter === 'all' && (
            <div className="text-xs text-blue-600 font-medium mt-1">Filtro ativo</div>
          )}
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6} lg={4}>
        <Card
          hoverable
          onClick={() => onFilterChange('PLANNING')}
          className={activeFilter === 'PLANNING' ? 'border-2 border-gray-500' : ''}
        >
          <Statistic
            title="Planejando"
            value={stats.planning}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#8c8c8c' }}
          />
          {activeFilter === 'PLANNING' && (
            <div className="text-xs text-gray-600 font-medium mt-1">Filtro ativo</div>
          )}
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6} lg={4}>
        <Card
          hoverable
          onClick={() => onFilterChange('SEARCHING')}
          className={activeFilter === 'SEARCHING' ? 'border-2 border-yellow-500' : ''}
        >
          <Statistic
            title="Buscando"
            value={stats.searching}
            prefix={<SearchOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
          {activeFilter === 'SEARCHING' && (
            <div className="text-xs text-yellow-600 font-medium mt-1">Filtro ativo</div>
          )}
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6} lg={4}>
        <Card
          hoverable
          onClick={() => onFilterChange('CONTRACTED')}
          className={activeFilter === 'CONTRACTED' ? 'border-2 border-green-500' : ''}
        >
          <Statistic
            title="Contratado"
            value={stats.contracted}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
          {activeFilter === 'CONTRACTED' && (
            <div className="text-xs text-green-600 font-medium mt-1">Filtro ativo</div>
          )}
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6} lg={4}>
        <Card
          hoverable
          onClick={() => onFilterChange('COMPLETED')}
          className={activeFilter === 'COMPLETED' ? 'border-2 border-blue-500' : ''}
        >
          <Statistic
            title="Concluído"
            value={stats.completed}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
          {activeFilter === 'COMPLETED' && (
            <div className="text-xs text-blue-600 font-medium mt-1">Filtro ativo</div>
          )}
        </Card>
      </Col>
    </Row>
  );
}
