import React from 'react';
import { Calendar, Search, MessageSquare, TrendingUp, Plus, Clock, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockQuoteRequests, eventTypes, budgetRanges } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { eventService, CreateEventData } from '../services/eventService';
import { OrganizerEventsPayload  } from '../types/eventsType'; // Importe o tipo Event

export function Dashboard() {
  const { user } = useAuth();  
  const [userEvents, setUserEvents] = React.useState<OrganizerEventsPayload[]>([]);
  const navigate = useNavigate();
  const [showCreateEventModal, setShowCreateEventModal] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState({
    title: '',
    type: '',
    date: '',
    location: '',
    budget: '',
    description: '',
    guestCount: '',
    organizerId: user?.id
  });

  // Use useEffect para carregar os eventos
 React.useEffect(() => {
  const loadEvents = async () => {
    if (user?.id) {
      const events = await eventService.getEventsByOrganizer(user.id);
      console.log('Eventos carregados:', events);
      setUserEvents(events.data.events);
    }
  };
  
  loadEvents();
}, [user?.id]);

  const userQuotes = mockQuoteRequests.filter(quote => quote.organizerId === user?.id);

const eventTypeMapping = {
  'Casamento': 'WEDDING',
  'Aniversário': 'BIRTHDAY', 
  'Corporativo': 'CORPORATE',
  'Formatura': 'GRADUATION',
  'Batizado': 'BAPTISM',
  'Chá de Bebê': 'BABY_SHOWER',
  'Chá de Panela': 'BRIDAL_SHOWER',
  'Noivado': 'ENGAGEMENT',
  'Festa Infantil': 'KIDS_PARTY',
  'Outro': 'OTHER'
};

const handleCreateEvent = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const mappedType = eventTypeMapping[newEvent.type as keyof typeof eventTypeMapping];
  const isoDate = new Date(newEvent.date + 'T18:00:00').toISOString();
  const countGuest = parseInt(newEvent.guestCount);
  
  if (!mappedType) {
    console.error('Tipo de evento inválido');
    return;
  }
  
  const eventData: CreateEventData = {
    ...newEvent,
    type: mappedType as 'WEDDING' | 'BIRTHDAY' | 'CORPORATE' | 'GRADUATION' | 'BAPTISM' | 'BABY_SHOWER' | 'BRIDAL_SHOWER' | 'ENGAGEMENT' | 'KIDS_PARTY' | 'OTHER',
    date: isoDate,
    guestCount: countGuest,
    organizerId: user?.id || ''
  };
  
  await eventService.createEvent(eventData);
  console.log('Evento criado:', newEvent);
  setShowCreateEventModal(false);
  setNewEvent({
    title: '',
    type: '',
    date: '',
    location: '',
    budget: '',
    description: '',
    guestCount: '',
    organizerId: user?.id
  });
  
  if (user?.id) {
    const events = await eventService.getEventsByOrganizer(user.id);
    setUserEvents(events);
  }
};
  console.log('Eventos carregados:', userEvents);
  return (
    <>
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Organizador</h1>
          <p className="text-gray-600 mt-2">Bem-vindo de volta, {user?.name}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{userEvents.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orçamentos Solicitados</p>
                <p className="text-2xl font-bold text-gray-900">{userQuotes.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Respostas Recebidas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userQuotes.filter(q => q.status === 'responded').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userQuotes.filter(q => q.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/suppliers')}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-900 font-medium">Buscar Fornecedores</span>
                </button>
                <button 
                  onClick={() => navigate('/reviews')}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                >
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-900 font-medium">Avaliar Fornecedores</span>
                </button>
                <button 
                  onClick={() => setShowCreateEventModal(true)}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-green-600" />
                  <span className="text-green-900 font-medium">Criar Novo Evento</span>
                </button>
              </div>
            </div>

            {/* Roadmap */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Roadmap do Evento</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Buffet - Confirmado</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Decoração - Pendente</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-700">DJ - Não iniciado</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-700">Fotógrafo - Não iniciado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Events */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Meus Eventos</h2>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Ver todos
                </button>
              </div>
              
              {userEvents.length > 0 ? (
                <div className="space-y-4">
                  {userEvents.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.status === 'planning' ? 'bg-yellow-100 text-yellow-700' :
                          event.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {event.status === 'planning' ? 'Planejando' :
                           event.status === 'confirmed' ? 'Confirmado' : 'Completo'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Data:</strong> {new Date(event.date).toLocaleDateString('pt-BR')}</p>
                        <p><strong>Local:</strong> {event.location}</p>
                        <p><strong>Orçamento:</strong> {event.budget}</p>
                        <div className="flex items-center justify-between mt-3">
                          <button
                            onClick={() => navigate(`/event-roadmap/${event.id}`)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Ver Roadmap
                          </button>
                          <span className="text-xs text-gray-500">
                            {event.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum evento criado ainda</p>
                  <button 
                    onClick={() => setShowCreateEventModal(true)}
                    className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Criar primeiro evento
                  </button>
                </div>
              )}
            </div>

            {/* Quote Requests */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Solicitações de Orçamento</h2>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Ver todas
                </button>
              </div>
              
              {userQuotes.length > 0 ? (
                <div className="space-y-4">
                  {userQuotes.map((quote) => (
                    <div key={quote.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Enviado em {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          quote.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          quote.status === 'responded' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {quote.status === 'pending' ? 'Pendente' :
                           quote.status === 'responded' ? 'Respondido' : 'Aceito'}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium mb-2">{quote.message}</p>
                      {quote.response && (
                        <div className="bg-green-50 p-3 rounded-lg mt-3">
                          <p className="text-sm text-green-800"><strong>Resposta:</strong> {quote.response}</p>
                          {quote.price && (
                            <p className="text-sm text-green-800 mt-1">
                              <strong>Valor:</strong> R$ {quote.price.toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma solicitação enviada ainda</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Create Event Modal */}
      {showCreateEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Criar Novo Evento</h2>
                <button
                  onClick={() => setShowCreateEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Evento
                    </label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      required
                      placeholder="Ex: Casamento da Maria e João"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Evento
                    </label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
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
                      value={newEvent.location}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                      required
                      placeholder="Cidade, bairro ou endereço"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Convidados
                    </label>
                    <input
                      type="number"
                      value={newEvent.guestCount}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, guestCount: e.target.value }))}
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
                    value={newEvent.budget}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, budget: e.target.value }))}
                    required
                    className="select-custom w-full"
                  >
                    <option value="">Selecione a faixa de orçamento</option>
                    {budgetRanges.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição Adicional
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Descreva detalhes específicos do seu evento, preferências ou requisitos especiais..."
                    className="select-custom w-full"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateEventModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Criar Evento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}