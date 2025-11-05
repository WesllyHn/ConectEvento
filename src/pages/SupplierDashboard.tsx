import React, { useState, useEffect } from 'react';
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
  Filter,
  MapPin,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { quoteService } from '../services/quoteService';

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

  useEffect(() => {
    if (user?.id) {
      loadQuotes();
    }
  }, [user?.id]);

  const loadQuotes = async () => {
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
  };

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

  const handleRespond = async (quoteId: string) => {
    if (!responseMessage || !responsePrice) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      setSubmitting(true);

      // Converte o valor formatado para número
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

  // Adicione esta função no componente, antes do return
  const formatCurrency = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Converte para número e formata
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Fornecedor</h1>
          <p className="text-gray-600 mt-2">Bem-vindo de volta, {user?.name}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Solicitações</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Respondidas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.responded}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aceitas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
              <div className="space-y-3">
                <div className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer">
                  <Edit className="w-5 h-5 text-blue-600" />
                  <button
                    onClick={() => navigate('/supplier-profile-edit')}
                    className="text-blue-900 font-medium"
                  >
                    Editar Perfil
                  </button>
                </div>
                <div className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer">
                  <Eye className="w-5 h-5 text-green-600" />
                  <button
                    onClick={() => navigate(`/supplier/${user?.id}`)}
                    className="text-green-900 font-medium"
                  >
                    Ver Meu Perfil
                  </button>
                </div>
                <div className="w-full flex items-center space-x-3 p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer">
                  <Star className="w-5 h-5 text-purple-600" />
                  <button
                    onClick={() => navigate('/supplier-reviews')}
                    className="text-purple-900 font-medium"
                  >
                    Minhas Avaliações
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Solicitações de Orçamento</h2>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Filtrar por:</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('PENDING')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'PENDING'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Pendentes ({stats.pending})
                </button>
                <button
                  onClick={() => setActiveTab('RESPONDED')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'RESPONDED'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Respondidas ({stats.responded})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === 'all'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Todas ({stats.total})
                </button>
              </div>

              {/* Quote Requests */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
              ) : filteredQuotes.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuotes.map((quote) => (
                    <div key={quote.id} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {quote.organizer?.name || 'Cliente'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {quote.organizer?.email || ''}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${quote.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          quote.status === 'RESPONDED' ? 'bg-green-100 text-green-700' :
                            quote.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                          }`}>
                          {quote.status === 'PENDING' ? 'Pendente' :
                            quote.status === 'RESPONDED' ? 'Respondido' :
                              quote.status === 'ACCEPTED' ? 'Aceito' : 'Rejeitado'}
                        </span>
                      </div>

                      {/* Event Info */}
                      {quote.event && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <p className="font-semibold text-blue-900 mb-2 flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {quote.event.title}
                          </p>
                          <div className="space-y-1 text-sm text-blue-700">
                            <p className="flex items-center">
                              <Calendar className="w-3 h-3 mr-2" />
                              Data: {new Date(quote.event.date).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="flex items-center">
                              <MapPin className="w-3 h-3 mr-2" />
                              Local: {quote.event.location}
                            </p>
                            {quote.event.guestCount && (
                              <p className="flex items-center">
                                <Users className="w-3 h-3 mr-2" />
                                Convidados: {quote.event.guestCount}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <p className="text-gray-900 font-medium mb-2">Solicitação:</p>
                        <p className="text-gray-700">{quote.message}</p>
                      </div>

                      <p className="text-xs text-gray-500 mb-4">
                        Recebido em {new Date(quote.createdAt).toLocaleDateString('pt-BR')} às {new Date(quote.createdAt).toLocaleTimeString('pt-BR')}
                      </p>

                      {quote.response && (
                        <div className="bg-green-50 p-4 rounded-lg mb-4">
                          <p className="text-sm text-green-800 font-medium mb-1">Sua resposta:</p>
                          <p className="text-green-700">{quote.response}</p>
                          {quote.price && (
                            <p className="text-green-700 font-semibold mt-2">
                              Valor: R$ {quote.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                      )}

                      {quote.status === 'PENDING' && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setSelectedQuote(quote.id)}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Responder
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Recusar
                          </button>
                        </div>
                      )}

                      {quote.status === 'RESPONDED' && (
                        <button
                          onClick={() => {
                            setSelectedQuote(quote.id);
                            setResponseMessage(quote.response || '');
                            setResponsePrice(quote.price?.toString() || '');
                          }}
                          className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Editar Resposta
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {activeTab === 'PENDING' ? 'Nenhuma solicitação pendente' :
                      activeTab === 'RESPONDED' ? 'Nenhuma solicitação respondida' :
                        'Nenhuma solicitação recebida'}
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === 'PENDING' ? 'Novas solicitações aparecerão aqui' :
                      'Suas respostas aparecerão aqui'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Responder Solicitação</h2>
                <button
                  onClick={() => {
                    setSelectedQuote(null);
                    setResponseMessage('');
                    setResponsePrice('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor do Orçamento (R$)
                </label>
                <input
                  type="text"
                  value={responsePrice}
                  onChange={handleCurrencyChange}
                  placeholder="R$ 0,00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem de Resposta
                  </label>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    rows={4}
                    placeholder="Descreva os detalhes do seu orçamento, o que está incluído, condições de pagamento, etc..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setSelectedQuote(null);
                      setResponseMessage('');
                      setResponsePrice('');
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleRespond(selectedQuote)}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
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