import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Check, 
  Clock, 
  X, 
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockEvents, mockEventRoadmaps } from '../data/mockData';

interface RoadmapItem {
  id: string;
  category: string;
  name: string;
  status: 'not_started' | 'searching' | 'contracted' | 'completed';
  supplierId?: string;
  supplierName?: string;
  priority: 'high' | 'medium' | 'low';
  estimatedCost?: string;
  finalCost?: number;
}

const eventTypeRoadmaps: Record<string, RoadmapItem[]> = {
  'Casamento': [
    { id: '1', category: 'Alimentação', name: 'Buffet', status: 'not_started', priority: 'high', estimatedCost: 'R$ 15.000 - R$ 30.000' },
    { id: '2', category: 'Decoração', name: 'Decoração Floral', status: 'not_started', priority: 'high', estimatedCost: 'R$ 3.000 - R$ 8.000' },
    { id: '3', category: 'Entretenimento', name: 'DJ/Banda', status: 'not_started', priority: 'high', estimatedCost: 'R$ 2.000 - R$ 5.000' },
    { id: '4', category: 'Fotografia', name: 'Fotógrafo', status: 'not_started', priority: 'high', estimatedCost: 'R$ 2.500 - R$ 6.000' },
    { id: '5', category: 'Transporte', name: 'Carro dos Noivos', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 500 - R$ 1.500' },
    { id: '6', category: 'Beleza', name: 'Maquiagem e Cabelo', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 800 - R$ 2.000' },
    { id: '7', category: 'Cerimônia', name: 'Celebrante', status: 'not_started', priority: 'high', estimatedCost: 'R$ 800 - R$ 2.500' },
    { id: '8', category: 'Doces', name: 'Bem Casados', status: 'not_started', priority: 'low', estimatedCost: 'R$ 300 - R$ 800' }
  ],
  'Aniversário': [
    { id: '1', category: 'Alimentação', name: 'Buffet/Catering', status: 'not_started', priority: 'high', estimatedCost: 'R$ 3.000 - R$ 10.000' },
    { id: '2', category: 'Decoração', name: 'Decoração Temática', status: 'not_started', priority: 'high', estimatedCost: 'R$ 1.500 - R$ 4.000' },
    { id: '3', category: 'Entretenimento', name: 'DJ/Animação', status: 'not_started', priority: 'high', estimatedCost: 'R$ 800 - R$ 2.500' },
    { id: '4', category: 'Doces', name: 'Bolo Personalizado', status: 'not_started', priority: 'high', estimatedCost: 'R$ 200 - R$ 800' },
    { id: '5', category: 'Fotografia', name: 'Fotógrafo', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 800 - R$ 2.500' },
    { id: '6', category: 'Entretenimento', name: 'Recreação Infantil', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 400 - R$ 1.200' }
  ],
  'Corporativo': [
    { id: '1', category: 'Alimentação', name: 'Coffee Break', status: 'not_started', priority: 'high', estimatedCost: 'R$ 1.000 - R$ 3.000' },
    { id: '2', category: 'Tecnologia', name: 'Som e Projeção', status: 'not_started', priority: 'high', estimatedCost: 'R$ 1.500 - R$ 4.000' },
    { id: '3', category: 'Local', name: 'Auditório/Sala', status: 'not_started', priority: 'high', estimatedCost: 'R$ 2.000 - R$ 8.000' },
    { id: '4', category: 'Materiais', name: 'Material Gráfico', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 500 - R$ 1.500' },
    { id: '5', category: 'Fotografia', name: 'Cobertura Fotográfica', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 800 - R$ 2.000' }
  ],
  'Formatura': [
    { id: '1', category: 'Alimentação', name: 'Jantar de Formatura', status: 'not_started', priority: 'high', estimatedCost: 'R$ 8.000 - R$ 20.000' },
    { id: '2', category: 'Entretenimento', name: 'Banda/DJ', status: 'not_started', priority: 'high', estimatedCost: 'R$ 2.000 - R$ 6.000' },
    { id: '3', category: 'Fotografia', name: 'Fotógrafo', status: 'not_started', priority: 'high', estimatedCost: 'R$ 1.500 - R$ 4.000' },
    { id: '4', category: 'Decoração', name: 'Decoração do Salão', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 2.000 - R$ 5.000' },
    { id: '5', category: 'Cerimônia', name: 'Mestre de Cerimônias', status: 'not_started', priority: 'medium', estimatedCost: 'R$ 800 - R$ 2.000' }
  ]
};

export function EventRoadmap() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [contractData, setContractData] = useState({
    supplierName: '',
    finalCost: ''
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');

  const event = mockEvents.find(e => e.id === eventId);

  React.useEffect(() => {
    if (event) {
      const defaultRoadmap = mockEventRoadmaps[event.type as keyof typeof mockEventRoadmaps] || [];
      setRoadmapItems(defaultRoadmap);
    }
  }, [event]);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Evento não encontrado</h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const updateItemStatus = (itemId: string, newStatus: RoadmapItem['status']) => {
    if (newStatus === 'contracted') {
      setSelectedItemId(itemId);
      setShowContractModal(true);
      return;
    }
    
    setRoadmapItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setRoadmapItems(items => items.filter(item => item.id !== itemId));
  };

  const addNewItem = () => {
    if (newItemName && newItemCategory && newItemCost) {
      const newItem: RoadmapItem = {
        id: Date.now().toString(),
        category: newItemCategory,
        name: newItemName,
        status: 'not_started',
        priority: 'medium',
        estimatedCost: newItemCost
      };
      setRoadmapItems(items => [...items, newItem]);
      setNewItemName('');
      setNewItemCategory('');
      setNewItemCost('');
      setShowAddModal(false);
    }
  };

  const handleContractItem = () => {
    if (selectedItemId && contractData.supplierName && contractData.finalCost) {
      setRoadmapItems(items => 
        items.map(item => 
          item.id === selectedItemId ? { 
            ...item, 
            status: 'contracted',
            supplierName: contractData.supplierName,
            finalCost: parseFloat(contractData.finalCost)
          } : item
        )
      );
      setShowContractModal(false);
      setSelectedItemId(null);
      setContractData({ supplierName: '', finalCost: '' });
    }
  };

  const filteredItems = roadmapItems.filter(item => {
    const statusMatch = activeStatusFilter === 'all' || item.status === activeStatusFilter;
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const handleStatusCardClick = (status: string) => {
    if (activeStatusFilter === status) {
      setActiveStatusFilter('all');
    } else {
      setActiveStatusFilter(status);
    }
  };

  const getStatusColor = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-700';
      case 'searching': return 'bg-yellow-100 text-yellow-700';
      case 'contracted': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'not_started': return <Clock className="w-4 h-4" />;
      case 'searching': return <Search className="w-4 h-4" />;
      case 'contracted': return <Check className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const categories = Array.from(new Set(roadmapItems.map(item => item.category)));
  const stats = {
    total: roadmapItems.length,
    notStarted: roadmapItems.filter(i => i.status === 'not_started').length,
    searching: roadmapItems.filter(i => i.status === 'searching').length,
    contracted: roadmapItems.filter(i => i.status === 'contracted').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Dashboard</span>
          </button>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className="flex items-center space-x-6 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span>{event.budget}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((stats.contracted / stats.total) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Contratado</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div 
            onClick={() => handleStatusCardClick('all')}
            className={`bg-white rounded-xl shadow-sm p-4 text-center cursor-pointer transition-all hover:shadow-md transform hover:scale-105 ${
              activeStatusFilter === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
          >
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
            {activeStatusFilter === 'all' && (
              <div className="text-xs text-blue-600 font-medium mt-1">Filtro ativo</div>
            )}
          </div>
          <div 
            onClick={() => handleStatusCardClick('not_started')}
            className={`bg-white rounded-xl shadow-sm p-4 text-center cursor-pointer transition-all hover:shadow-md transform hover:scale-105 ${
              activeStatusFilter === 'not_started' ? 'ring-2 ring-gray-500 bg-gray-50' : ''
            }`}
          >
            <div className="text-2xl font-bold text-gray-500">{stats.notStarted}</div>
            <div className="text-sm text-gray-600">Não Iniciado</div>
            {activeStatusFilter === 'not_started' && (
              <div className="text-xs text-gray-600 font-medium mt-1">Filtro ativo</div>
            )}
          </div>
          <div 
            onClick={() => handleStatusCardClick('searching')}
            className={`bg-white rounded-xl shadow-sm p-4 text-center cursor-pointer transition-all hover:shadow-md transform hover:scale-105 ${
              activeStatusFilter === 'searching' ? 'ring-2 ring-yellow-500 bg-yellow-50' : ''
            }`}
          >
            <div className="text-2xl font-bold text-yellow-600">{stats.searching}</div>
            <div className="text-sm text-gray-600">Buscando</div>
            {activeStatusFilter === 'searching' && (
              <div className="text-xs text-yellow-600 font-medium mt-1">Filtro ativo</div>
            )}
          </div>
          <div 
            onClick={() => handleStatusCardClick('contracted')}
            className={`bg-white rounded-xl shadow-sm p-4 text-center cursor-pointer transition-all hover:shadow-md transform hover:scale-105 ${
              activeStatusFilter === 'contracted' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
          >
            <div className="text-2xl font-bold text-blue-600">{stats.contracted}</div>
            <div className="text-sm text-gray-600">Contratado</div>
            {activeStatusFilter === 'contracted' && (
              <div className="text-xs text-blue-600 font-medium mt-1">Filtro ativo</div>
            )}
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Roadmap do Evento</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Item</span>
            </button>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Filtros:</span>
            </div>
            
            <select
              value={activeStatusFilter}
              onChange={(e) => setActiveStatusFilter(e.target.value)}
             className="select-small"
            >
              <option value="all">Todos os status</option>
              <option value="not_started">Não iniciado</option>
              <option value="searching">Buscando</option>
              <option value="contracted">Contratado</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
             className="select-small"
            >
              <option value="all">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Roadmap Items */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span>
                          {item.status === 'not_started' ? 'Não iniciado' :
                           item.status === 'searching' ? 'Buscando' :
                           'Contratado'}
                        </span>
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded-full">{item.category}</span>
                          {item.finalCost && (
                            <span className="text-green-600 font-medium">
                              Valor final: R$ {item.finalCost.toLocaleString('pt-BR')}
                            </span>
                          )}
                          {item.supplierName && (
                            <span className="text-blue-600 font-medium">
                              Fornecedor: {item.supplierName}
                            </span>
                          )}
                        {item.estimatedCost && <span>{item.estimatedCost}</span>}
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.priority === 'high' ? 'bg-red-100 text-red-700' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {item.priority === 'high' ? 'Alta' :
                           item.priority === 'medium' ? 'Média' : 'Baixa'} prioridade
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={item.status}
                      onChange={(e) => updateItemStatus(item.id, e.target.value as RoadmapItem['status'])}
                     className="select-small px-3 py-1"
                    >
                      <option value="not_started">Não iniciado</option>
                        <option value="contracted">Contratar</option>
                      <option value="completed">Concluído</option>
                    </select>
                    
                    <button
                      onClick={() => navigate('/suppliers')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Buscar
                    </button>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-600">
                <p className="mb-2">Nenhum item encontrado com os filtros selecionados</p>
                {activeStatusFilter !== 'all' && (
                  <button
                    onClick={() => setActiveStatusFilter('all')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Adicionar Item ao Roadmap</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Item
                  </label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Ex: Fotógrafo, Decoração..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                   className="select-custom w-full"
                  >
                    <option value="">Selecione uma categoria</option>
                    {['Alimentação', 'Decoração', 'Entretenimento', 'Fotografia', 'Transporte', 'Beleza', 'Cerimônia', 'Tecnologia', 'Outros'].map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faixa de Valor Estimado
                  </label>
                  <input
                    type="text"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    placeholder="Ex: R$ 2.000 - R$ 5.000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={addNewItem}
                    disabled={!newItemName || !newItemCategory || !newItemCost}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Modal */}
      {showContractModal && selectedItemId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Contratar Fornecedor</h2>
                <button
                  onClick={() => {
                    setShowContractModal(false);
                    setSelectedItemId(null);
                    setContractData({ supplierName: '', finalCost: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Item:</strong> {roadmapItems.find(item => item.id === selectedItemId)?.name}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Categoria:</strong> {roadmapItems.find(item => item.id === selectedItemId)?.category}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Fornecedor *
                  </label>
                  <input
                    type="text"
                    value={contractData.supplierName}
                    onChange={(e) => setContractData(prev => ({ ...prev, supplierName: e.target.value }))}
                    placeholder="Nome da empresa ou fornecedor"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Final (R$) *
                  </label>
                  <input
                    type="number"
                    value={contractData.finalCost}
                    onChange={(e) => setContractData(prev => ({ ...prev, finalCost: e.target.value }))}
                    placeholder="Ex: 15000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowContractModal(false);
                      setSelectedItemId(null);
                      setContractData({ supplierName: '', finalCost: '' });
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleContractItem}
                    disabled={!contractData.supplierName || !contractData.finalCost}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Contratar
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