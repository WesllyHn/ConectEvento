import { Calendar } from 'lucide-react';
import { Button, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DataCard } from '../Common';
import { Event } from '../../types';

interface EventsListProps {
  events: Event[];
  onCreateEvent: () => void;
}

export function EventsList({ events, onCreateEvent }: EventsListProps) {
  const navigate = useNavigate();
  
  return (
    <DataCard
      title="Meus Eventos"
      // extra={<Button type="link">Ver todos</Button>}
    >
      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <DataCard
              key={event.id}
              status={{
                text: event.status === 'planning' ? 'Planejando' :
                      event.status === 'confirmed' ? 'Confirmado' : 'Completo',
                color: event.status === 'planning' ? 'warning' :
                       event.status === 'confirmed' ? 'success' : 'blue'
              }}
            >
              <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Data:</strong> {new Date(event.date).toLocaleDateString('pt-BR')}</p>
                <p><strong>Local:</strong> {event.location}</p>
                <p><strong>Orçamento:</strong> {event.budget}</p>
                <div className="flex items-center justify-between mt-3">
                  <Button
                    type="link"
                    onClick={() => navigate(`/event-roadmap/${event.id}`)}
                  >
                    Ver Roadmap
                  </Button>
                  <span className="text-xs text-gray-500">{event.type}</span>
                </div>
              </div>
            </DataCard>
          ))}
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Nenhum evento criado ainda"
        >
          <Button type="primary" onClick={onCreateEvent}>
            Criar primeiro evento
          </Button>
        </Empty>
      )}
    </DataCard>
  );
}
