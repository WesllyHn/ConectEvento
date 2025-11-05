import { Card, Button, Typography, Space, Progress } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, EnvironmentOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface Event {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  budget: string;
  status: string;
}

interface EventHeaderProps {
  event: Event;
  completionPercentage: number;
}

export function EventHeader({ event, completionPercentage }: EventHeaderProps) {
  const navigate = useNavigate();

  return (
    <>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/dashboard')}
        className="mb-4"
      >
        Voltar ao Dashboard
      </Button>

      <Card>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Title level={2} style={{ margin: 0 }}>
              {event.title}
            </Title>

            <Space size="large" className="mt-4">
              <Space>
                <CalendarOutlined />
                <Text>{new Date(event.date).toLocaleDateString('pt-BR')}</Text>
              </Space>

              <Space>
                <EnvironmentOutlined />
                <Text>{event.location}</Text>
              </Space>

              <Space>
                <DollarOutlined />
                <Text>{event.budget}</Text>
              </Space>
            </Space>
          </div>

          <div className="text-right" style={{ minWidth: 120 }}>
            <Progress
              type="circle"
              percent={completionPercentage}
              format={(percent) => `${percent}%`}
              size={80}
            />
            <div className="text-sm text-gray-600 mt-2">Contratado</div>
          </div>
        </div>
      </Card>
    </>
  );
}
