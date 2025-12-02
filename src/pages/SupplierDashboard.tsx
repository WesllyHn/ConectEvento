import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
  Edit,
  Star,
  User,
  MapPin,
  Users,
  DollarSign,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { quoteService } from '../services/quoteService';

interface QuoteCardProps {
  quote: any;
  onSelectQuote: (id: string) => void;
  onEditResponse: (id: string, response: string, price: string) => void;
  getStatusBadgeClass: (status: string) => string;
  getStatusText: (status: string) => string;
}

const QuoteCard = ({
  quote,
  onSelectQuote,
  onEditResponse,
  getStatusBadgeClass,
  getStatusText
}: QuoteCardProps) => {
  return (
    <div
      className="border-2 border-gray-100 rounded-xl p-6 hover:border-blue-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">
              {quote.organizer?.name || 'Cliente'}
            </p>
            <p className="text-sm text-gray-600">
              {quote.organizer?.email || ''}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1.5 text-xs font-bold rounded-full ${getStatusBadgeClass(quote.status)}`}
        >
          {getStatusText(quote.status)}
        </span>
      </div>

      {quote.event && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl mb-4 border border-blue-200">
          <p className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {quote.event.title}
          </p>
          <div className="space-y-2 text-sm text-blue-700">
            <p className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Data: {new Date(quote.event.date).toLocaleDateString('pt-BR')}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              Local: {quote.event.location}
            </p>
            {quote.event.guestCount && (
              <p className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Convidados: {quote.event.guestCount}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-900 font-bold mb-2">Solicitação:</p>
        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg leading-relaxed">
          {quote.message}
        </p>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Recebido em {new Date(quote.createdAt).toLocaleDateString('pt-BR')} às{' '}
        {new Date(quote.createdAt).toLocaleTimeString('pt-BR')}
      </p>

      {quote.response && (
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-xl mb-4 border border-emerald-200">
          <p className="text-sm text-emerald-800 font-bold mb-2">Sua resposta:</p>
          <p className="text-emerald-700 leading-relaxed">{quote.response}</p>
          {quote.price && (
            <p className="text-emerald-700 font-bold mt-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Valor: R$ {quote.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
      )}

      {quote.status === 'PENDING' && (
        <div className="flex gap-3">
          <button
            onClick={() => onSelectQuote(quote.id)}
            className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
          >
            Responder
          </button>
          <button className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold">
            Recusar
          </button>
        </div>
      )}

      {quote.status === 'RESPONDED' && (
        <button
          onClick={() => onEditResponse(quote.id, quote.response || '', quote.price?.toString() || '')}
          className="w-full py-2.5 px-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold"
        >
          Editar Resposta
        </button>
      )}
    </div>
  );
};

const ColoredStatCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  iconText
}: {
  title: string;
  value: number;
  icon: any;
  gradient: string;
  iconText: string;
}) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 ${gradient} backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300">
          <Icon className={`w-6 h-6 text-${iconText} group-hover:scale-110 transition-transform duration-300`} />
        </div>
        <div className="text-3xl font-bold text-white">
          {value}
        </div>
      </div>
      <p className="text-white/90 font-medium text-sm">{title}</p>
    </div>
  </div>
);

export function SupplierDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'RESPONDED' | 'all'>('PENDING');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responsePrice, setResponsePrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadQuotes = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await quoteService.getBudgetsByUserId(user.id);
      setQuotes(data);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadQuotes();
    }
  }, [user?.id, loadQuotes]);

  const filteredQuotes = quotes.filter(quote => {
    if (activeTab === 'all') return true;
    return quote.status === activeTab;
  });

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'PENDING').length,
    responded: quotes.filter(q => q.status === 'RESPONDED').length,
    accepted: quotes.filter(q => q.status === 'ACCEPTED').length
  };

  const getStatusBadgeClass = (status: string): string => {
    if (status === 'PENDING') return 'bg-amber-100 text-amber-700';
    if (status === 'RESPONDED') return 'bg-emerald-100 text-emerald-700';
    if (status === 'ACCEPTED') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status: string): string => {
    if (status === 'PENDING') return 'Pendente';
    if (status === 'RESPONDED') return 'Respondido';
    if (status === 'ACCEPTED') return 'Aceito';
    return 'Rejeitado';
  };

  const getEmptyMessage = (tab: string): { title: string; description: string } => {
    if (tab === 'PENDING') {
      return {
        title: 'Nenhuma solicitação pendente',
        description: 'Novas solicitações aparecerão aqui'
      };
    }
    if (tab === 'RESPONDED') {
      return {
        title: 'Nenhuma solicitação respondida',
        description: 'Suas respostas aparecerão aqui'
      };
    }
    return {
      title: 'Nenhuma solicitação recebida',
      description: 'Suas respostas aparecerão aqui'
    };
  };

  const handleRespond = async (quoteId: string) => {
    if (!responseMessage || !responsePrice) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      setSubmitting(true);

      const valorNumerico = parseFloat(
        responsePrice
          .replace('R$', '')
          .replace(/\s/g, '')
          .replace(/\./g, '')
          .replace(',', '.')
      ) || 0;

      await quoteService.updateBudget(quoteId, {
        status: 'RESPONDED',
        response: responseMessage,
        price: valorNumerico
      });

      setSelectedQuote(null);
      setResponseMessage('');
      setResponsePrice('');
      await loadQuotes();
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Erro ao enviar resposta');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = Number(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setResponsePrice(formatted);
  };

  const renderQuotesContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      );
    }

    if (filteredQuotes.length > 0) {
      return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredQuotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onSelectQuote={setSelectedQuote}
              onEditResponse={(id, response, price) => {
                setSelectedQuote(id);
                setResponseMessage(response);
                setResponsePrice(price);
              }}
              getStatusBadgeClass={getStatusBadgeClass}
              getStatusText={getStatusText}
            />
          ))}
        </div>
      );
    }

    const emptyMsg = getEmptyMessage(activeTab);
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {emptyMsg.title}
        </h3>
        <p className="text-gray-600">
          {emptyMsg.description}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold leading-tight bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            Dashboard do Fornecedor
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Bem-vindo de volta, <span className="font-semibold text-blue-600">{user?.name}</span>!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ColoredStatCard
            title="Total de Solicitações"
            value={stats.total}
            icon={MessageSquare}
            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
            iconText="blue-600"
          />
          <ColoredStatCard
            title="Pendentes"
            value={stats.pending}
            icon={Clock}
            gradient="bg-gradient-to-br from-amber-500 to-amber-700"
            iconText="amber-600"
          />
          <ColoredStatCard
            title="Respondidas"
            value={stats.responded}
            icon={CheckCircle}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
            iconText="emerald-600"
          />
          <ColoredStatCard
            title="Aceitas"
            value={stats.accepted}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-purple-500 to-purple-700"
            iconText="purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Ações Rápidas</h2>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => navigate('/supplier-profile-edit')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:border-gray-300 group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Edit className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                    Editar Perfil
                  </span>
                </button>

                <button
                  onClick={() => navigate(`/supplier/${user?.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:border-gray-300 group"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Eye className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-gray-700 group-hover:text-emerald-600 transition-colors">
                    Ver Meu Perfil
                  </span>
                </button>

                <button
                  onClick={() => navigate('/supplier-reviews')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:border-gray-300 group"
                >
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="font-semibold text-gray-700 group-hover:text-yellow-600 transition-colors">
                    Minhas Avaliações
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Solicitações de Orçamento</h2>

                <div className="flex space-x-2 bg-gray-100 p-1.5 rounded-xl">
                  <button
                    onClick={() => setActiveTab('PENDING')}
                    className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      activeTab === 'PENDING'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Pendentes ({stats.pending})
                  </button>
                  <button
                    onClick={() => setActiveTab('RESPONDED')}
                    className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      activeTab === 'RESPONDED'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Respondidas ({stats.responded})
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      activeTab === 'all'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Todas ({stats.total})
                  </button>
                </div>
              </div>

              {renderQuotesContent()}
            </div>
          </div>
        </div>
      </div>

      {selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Responder Solicitação</h2>
                <button
                  onClick={() => {
                    setSelectedQuote(null);
                    setResponseMessage('');
                    setResponsePrice('');
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Valor do Orçamento (R$)
                  </label>
                  <input
                    type="text"
                    value={responsePrice}
                    onChange={handleCurrencyChange}
                    placeholder="R$ 0,00"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Mensagem de Resposta
                  </label>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    rows={4}
                    placeholder="Descreva os detalhes do seu orçamento, o que está incluído, condições de pagamento, etc..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setSelectedQuote(null);
                      setResponseMessage('');
                      setResponsePrice('');
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleRespond(selectedQuote)}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-400 font-semibold"
                    disabled={submitting}
                  >
                    {submitting ? 'Enviando...' : 'Enviar Resposta'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
