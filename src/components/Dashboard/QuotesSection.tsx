import React from 'react';
import { Button, Empty, message } from 'antd';
import { CheckCircle, XCircle } from 'lucide-react';
import { DataCard } from '../Common';
import { quoteService } from '../../services/quoteService';

interface Quote {
  id: string;
  supplierId: string;
  organizerId: string;
  eventId?: string;
  message: string;
  status: 'PENDING' | 'RESPONDED' | 'ACCEPTED' | 'REJECTED';
  response?: string | null;
  price?: number | null;
  createdAt: string;
  event?: {
    title: string;
  };
  supplier: {
    name: string;
    companyName?: string;
  };
}

interface QuotesSectionProps {
  quotes: Quote[];
  onViewAll?: () => void;
  onQuoteUpdate?: () => void;
}

const getStatusText = (status: Quote['status']): string => {
  const statusMap: Record<Quote['status'], string> = {
    'PENDING': 'Pendente',
    'RESPONDED': 'Respondido',
    'ACCEPTED': 'Aceito',
    'REJECTED': 'Rejeitado'
  };
  return statusMap[status];
};

const getStatusColor = (status: Quote['status']): 'warning' | 'success' | 'blue' | 'error' => {
  const colorMap: Record<Quote['status'], 'warning' | 'success' | 'blue' | 'error'> = {
    'PENDING': 'warning',
    'RESPONDED': 'success',
    'ACCEPTED': 'blue',
    'REJECTED': 'error'
  };
  return colorMap[status];
};

const getStatusConfig = (status: Quote['status']) => ({
  text: getStatusText(status),
  color: getStatusColor(status)
});

export function QuotesSection({ quotes, onViewAll, onQuoteUpdate }: QuotesSectionProps) {
  console.log('QuotesSection quotes:', onViewAll);
  const [updatingQuoteId, setUpdatingQuoteId] = React.useState<string | null>(null);

  const handleUpdateStatus = async (quote: Quote, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      setUpdatingQuoteId(quote.id);
      
      await quoteService.updateBudget(quote.id, { status });
    
      message.success(
        status === 'ACCEPTED' 
          ? 'Orçamento aceito e fornecedor vinculado ao evento!' 
          : 'Orçamento rejeitado com sucesso!'
      );
      
      if (onQuoteUpdate) {
        onQuoteUpdate();
      }
    } catch (error) {
      console.error('Error updating quote status:', error);
      message.error('Erro ao atualizar status do orçamento');
    } finally {
      setUpdatingQuoteId(null);
    }
  };
  return (
    <>
      {quotes.length > 0 ? (
        <div className="space-y-4">
          {quotes.slice(0, 5).map((quote) => (
            <DataCard
              key={quote.id}
              status={getStatusConfig(quote.status)}
              title={`Fornecedor: ${quote.supplier.companyName || quote.supplier.name}`}
            >
              <div className="space-y-2">
                {quote.event && (
                  <p className="text-sm text-gray-600">
                    Evento: {quote.event.title}
                  </p>
                )}
                <span className="text-sm text-gray-500">
                  Enviado em {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <p className="text-gray-900 mt-2">{quote.message}</p>
              </div>
              
              {quote.response && (
                <div className="bg-green-50 p-3 rounded-lg mt-3">
                  <p className="text-sm text-green-800">
                    <strong>Resposta:</strong> {quote.response}
                  </p>
                  {quote.price && (
                    <p className="text-sm text-green-800 mt-1">
                      <strong>Valor:</strong> R$ {quote.price.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                  )}
                </div>
              )}

              {quote.status === 'RESPONDED' && (
                <div className="flex gap-2 mt-4">
                  <Button
                    type="primary"
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={() => handleUpdateStatus(quote, 'ACCEPTED')}
                    loading={updatingQuoteId === quote.id}
                    disabled={updatingQuoteId !== null}
                    className="flex items-center gap-2"
                  >
                    Aceitar e Contratar
                  </Button>
                  <Button
                    danger
                    icon={<XCircle className="w-4 h-4" />}
                    onClick={() => handleUpdateStatus(quote, 'REJECTED')}
                    loading={updatingQuoteId === quote.id}
                    disabled={updatingQuoteId !== null}
                    className="flex items-center gap-2"
                  >
                    Rejeitar
                  </Button>
                </div>
              )}
            </DataCard>
          ))}
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Nenhuma solicitação enviada ainda"
        />
      )}
    </>
  );
}