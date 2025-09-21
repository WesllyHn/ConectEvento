import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit,
  Star,
  User,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockQuoteRequests, mockSuppliers, mockSupplierStats } from '../data/mockData';

export function SupplierDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pending' | 'responded' | 'all'>('pending');
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responsePrice, setResponsePrice] = useState('');

  // Mock data - em produção viria da API
  const supplierQuotes = mockQuoteRequests.filter(quote => quote.supplierId === user?.id);
  const supplier = mockSuppliers.find(s => s.id === user?.id);

  const filteredQuotes = supplierQuotes.filter(quote => {
    if (activeTab === 'all') return true;
    return quote.status === activeTab;
  });

  const stats = {
    total: supplierQuotes.length,
    pending: supplierQuotes.filter(q => q.status === 'pending').length,
    responded: supplierQuotes.filter(q => q.status === 'responded').length,
    accepted: supplierQuotes.filter(q => q.status === 'accepted').length
  };

  const handleRespond = (quoteId: string) => {
    // Aqui seria enviada a resposta via API
    console.log('Resposta enviada:', { quoteId, responseMessage, responsePrice });
    setSelectedQuote(null);
    setResponseMessage('');
    setResponsePrice('');
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
                <div className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Edit className="w-5 h-5 text-blue-600" />
                  <button
                    onClick={() => navigate('/supplier-profile-edit')}
                    className="text-blue-900 font-medium"
                  >
                    Editar Perfil
                  </button>
                </div>
                <div className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <Eye className="w-5 h-5 text-green-600" />
                  <button
                    onClick={() => navigate(`/supplier/${user?.id}`)}
                    className="text-green-900 font-medium"
                  >
                    Ver Meu Perfil
                  </button>
                </div>
                <div className="w-full flex items-center space-x-3 p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
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

            {/* Profile Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo do Perfil</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={supplier?.avatar || ''}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{supplier?.companyName}</p>
                    <p className="text-sm text-gray-600">{supplier?.location}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avaliação</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                    <span className="font-semibold">{supplier?.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avaliações</span>
                  <span className="font-semibold">{supplier?.reviewCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    supplier?.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {supplier?.availability ? 'Disponível' : 'Indisponível'}
                  </span>
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
                  onClick={() => setActiveTab('pending')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'pending'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pendentes ({stats.pending})
                </button>
                <button
                  onClick={() => setActiveTab('responded')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'responded'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Respondidas ({stats.responded})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'all'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Todas ({stats.total})
                </button>
              </div>

              {/* Quote Requests */}
              {filteredQuotes.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuotes.map((quote) => (
                    <div key={quote.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Cliente #{quote.organizerId}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                          quote.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          quote.status === 'responded' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {quote.status === 'pending' ? 'Pendente' :
                           quote.status === 'responded' ? 'Respondido' : 'Aceito'}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-900 font-medium mb-2">Solicitação:</p>
                        <p className="text-gray-700">{quote.message}</p>
                      </div>

                      {quote.response && (
                        <div className="bg-green-50 p-4 rounded-lg mb-4">
                          <p className="text-sm text-green-800 font-medium mb-1">Sua resposta:</p>
                          <p className="text-green-700">{quote.response}</p>
                          {quote.price && (
                            <p className="text-green-700 font-semibold mt-2">
                              Valor: R$ {quote.price.toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                      )}

                      {quote.status === 'pending' && (
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {activeTab === 'pending' ? 'Nenhuma solicitação pendente' :
                     activeTab === 'responded' ? 'Nenhuma solicitação respondida' :
                     'Nenhuma solicitação recebida'}
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === 'pending' ? 'Novas solicitações aparecerão aqui' :
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
                  onClick={() => setSelectedQuote(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor do Orçamento (R$)
                  </label>
                  <input
                    type="number"
                    value={responsePrice}
                    onChange={(e) => setResponsePrice(e.target.value)}
                    placeholder="Ex: 15000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

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
                    onClick={() => setSelectedQuote(null)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleRespond(selectedQuote)}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enviar Resposta
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