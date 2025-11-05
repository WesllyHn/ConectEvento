import { Search, TrendingUp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataCard, ActionButton } from '../Common';

interface QuickActionsProps {
  onCreateEvent: () => void;
}

export function QuickActions({ onCreateEvent }: QuickActionsProps) {
  const navigate = useNavigate();

  return (
    <DataCard title="Ações Rápidas">
      <div className="space-y-3">
        <ActionButton
          icon={Search}
          onClick={() => navigate('/suppliers')}
          block
          size="large"
        >
          Buscar Fornecedores
        </ActionButton>
        <ActionButton
          icon={TrendingUp}
          onClick={() => navigate('/reviews')}
          block
          size="large"
        >
          Avaliar Fornecedores
        </ActionButton>
        <ActionButton
          icon={Plus}
          onClick={onCreateEvent}
          type="primary"
          block
          size="large"
        >
          Criar Novo Evento
        </ActionButton>
      </div>
    </DataCard>
  );
}
