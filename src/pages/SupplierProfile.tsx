import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock,
  MessageSquare,
  ArrowLeft,
  Send,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { mockSuppliers, mockDetailedReviews, eventTypes, budgetRanges } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';


export function SupplierProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Verificar se o usuário está logado para acessar o perfil
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quoteMessage, setQuoteMessage] = useState('');
  const [eventDetails, setEventDetails] = useState({
    eventType: '',
    date: '',
    location: '',
    budget: '',
    guestCount: '',
    description: ''
  });

  const supplier = mockSuppliers.find(s => s.id === id);

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2"> </h1>
          <button 
            onClick={() => navigate('/suppliers')}
            className="text-blue-600 hover:text-blue-700"
          >
            Voltar para fornecedores
          </button>
        </div>
      </div>
    );
  }

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Aqui seria enviada a solicitação via API
    console.log('Solicitação enviada:', { supplierId: id, quoteMessage, eventDetails });
    setShowQuoteModal(false);
    setQuoteMessage('');
    setEventDetails({
      eventType: '',
      date: '',
      location: '',
      budget: '',
      guestCount: '',
      description: ''
    });
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === supplier.portfolio.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? supplier.portfolio.length - 1 : prev - 1
    );
  };

  // Mock reviews data
  const reviews = mockDetailedReviews.filter(review => review.supplierId === supplier.id);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/suppliers')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar para fornecedores</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-6">
                    <img
                      src={supplier.avatar || ''}
                      alt={supplier.companyName}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{supplier.companyName}</h1>
                      <div className="flex items-center space-x-4 text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-5 h-5" />
                          <span>{supplier.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                          <span className="font-semibold">{supplier.rating}</span>
                          <span>({supplier.reviewCount} avaliações)</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          supplier.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {supplier.availability ? '● Disponível' : '● Indisponível'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          supplier.priceRange === 'budget' ? 'bg-green-100 text-green-700' :
                          supplier.priceRange === 'mid' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {supplier.priceRange === 'budget' ? 'Econômico' :
                           supplier.priceRange === 'mid' ? 'Intermediário' : 'Premium'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{supplier.reviewCount}</div>
                    <div className="text-sm text-blue-800">Avaliações</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{supplier.rating}</div>
                    <div className="text-sm text-green-800">Nota Média</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{supplier.services.length}</div>
                    <div className="text-sm text-purple-800">Serviços</div>
                  </div>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed">{supplier.description}</p>
              </div>

              {/* Services */}
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Serviços Oferecidos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {supplier.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio */}
              {supplier.portfolio.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfólio</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {supplier.portfolio.map((image, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => openImageModal(index)}
                      >
                        <img
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Avaliações dos Clientes</h2>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {review.organizerName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{review.organizerName}</p>
                              <p className="text-sm text-gray-600">{review.eventType} • {new Date(review.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Ainda não há avaliações para este fornecedor.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Solicitar Orçamento</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span>Resposta em até 24h</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <span>Orçamento gratuito</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>Sem compromisso</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowQuoteModal(true)}
                  disabled={!supplier.availability}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {supplier.availability ? 'Solicitar Orçamento' : 'Indisponível'}
                </button>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Informações de Contato</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{supplier.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{supplier.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Solicitar Orçamento</h2>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleQuoteSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Evento
                    </label>
                    <select
                      value={eventDetails.eventType}
                      onChange={(e) => setEventDetails(prev => ({ ...prev, eventType: e.target.value }))}
                      required
                     className="select-custom w-full"
                    >
                      <option value="">Selecione o tipo</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data do Evento
                    </label>
                    <input
                      type="date"
                      value={eventDetails.date}
                      onChange={(e) => setEventDetails(prev => ({ ...prev, date: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Local do Evento
                    </label>
                    <input
                      type="text"
                      value={eventDetails.location}
                      onChange={(e) => setEventDetails(prev => ({ ...prev, location: e.target.value }))}
                      required
                      placeholder="Cidade ou endereço"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Convidados
                    </label>
                    <input
                      type="number"
                      value={eventDetails.guestCount}
                      onChange={(e) => setEventDetails(prev => ({ ...prev, guestCount: e.target.value }))}
                      placeholder="Ex: 150"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orçamento Estimado
                  </label>
                  <select
                    value={eventDetails.budget}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, budget: e.target.value }))}
                    required
                    className="select-custom w-full"
                  >
                    <option value="">Selecione a faixa</option>
                    <option value="Até R$ 5.000">Até R$ 5.000</option>
                    {budgetRanges.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detalhes Adicionais
                  </label>
                  <textarea
                    value={eventDetails.description}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Descreva detalhes específicos do seu evento..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem para o Fornecedor
                  </label>
                  <textarea
                    value={quoteMessage}
                    onChange={(e) => setQuoteMessage(e.target.value)}
                    rows={4}
                    required
                    placeholder="Descreva o que você precisa e suas expectativas..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowQuoteModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Solicitação</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            
            <img
              src={supplier.portfolio[selectedImageIndex]}
              alt={`Portfolio ${selectedImageIndex + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            
            {supplier.portfolio.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {selectedImageIndex + 1} de {supplier.portfolio.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}