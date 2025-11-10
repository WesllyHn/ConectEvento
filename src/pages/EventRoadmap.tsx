import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { Plus } from 'lucide-react';
import { roadmapService, RoadmapItem } from '../services/roadmapService';
import { eventService, Event } from '../services/eventService';
import { EventHeader } from '../components/EventHeader';
import { RoadmapStats } from '../components/RoadmapStats';
import { RoadmapFilters } from '../components/RoadmapFilters';
import { RoadmapList } from '../components/RoadmapList';
import { AddItemModal } from '../components/AddItemModal';

export function EventRoadmap() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');

  const loadEventData = useCallback(async () => {
    if (!eventId) return;
    try {
      const eventData = await eventService.getEventById(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      message.error('Erro ao carregar dados do evento');
    }
  }, [eventId]);

  const loadRoadmapItems = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const items = await roadmapService.getRoadmapByEventId(eventId);
      setRoadmapItems(items);
    } catch (error) {
      console.error('Erro ao carregar roadmap:', error);
      message.error('Erro ao carregar roadmap');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      loadEventData();
      loadRoadmapItems();
    }
  }, [eventId, loadEventData, loadRoadmapItems]);

  const updateItemStatus = async (itemId: string, newStatus: RoadmapItem['status']) => {
    try {
      await roadmapService.updateRoadmap(itemId, { status: newStatus });
      setRoadmapItems((items) =>
        items.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
      );
      message.success('Status atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      message.error('Erro ao atualizar status');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await roadmapService.deleteRoadmap(itemId);
      setRoadmapItems((items) => items.filter((item) => item.id !== itemId));
      message.success('Item removido com sucesso');
    } catch (error) {
      console.error('Erro ao remover item:', error);
      message.error('Erro ao remover item');
    }
  };

  const addNewItem = async (values: {
    title: string;
    description: string;
    category: string;
    price: string;
  }) => {
    if (!eventId) return;

    try {
      const newItem = await roadmapService.createRoadmap({
        idEvent: eventId,
        category: values.category,
        title: values.title,
        description: values.description,
        price: values.price,
        status: 'PLANNING',
      });
      setRoadmapItems((items) => [...items, newItem]);
      setShowAddModal(false);
      message.success('Item adicionado com sucesso');
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      message.error('Erro ao adicionar item');
    }
  };

  const filteredItems = roadmapItems.filter((item) => {
    const statusMatch = activeStatusFilter === 'all' || item.status === activeStatusFilter;
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const categories = Array.from(new Set(roadmapItems.map((item) => item.category)));
  const stats = {
    total: roadmapItems.length,
    planning: roadmapItems.filter((i) => i.status === 'PLANNING').length,
    searching: roadmapItems.filter((i) => i.status === 'SEARCHING').length,
    contracted: roadmapItems.filter((i) => i.status === 'CONTRACTED').length,
    completed: roadmapItems.filter((i) => i.status === 'COMPLETED').length,
  };

  const completionPercentage = stats.total > 0
    ? Math.round((stats.contracted / stats.total) * 100)
    : 0;

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Evento não encontrado</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EventHeader event={event} completionPercentage={completionPercentage} />

        <div className="mt-8">
          <RoadmapStats
            stats={stats}
            activeFilter={activeStatusFilter}
            onFilterChange={setActiveStatusFilter}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Roadmap do Evento</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Adicionar Item
              </button>
            </div>

            <RoadmapFilters
              activeStatusFilter={activeStatusFilter}
              filterCategory={filterCategory}
              categories={categories}
              onStatusChange={setActiveStatusFilter}
              onCategoryChange={setFilterCategory}
            />

            <RoadmapList
              items={filteredItems}
              loading={loading}
              onStatusChange={updateItemStatus}
              onDelete={removeItem}
              onSearch={() => navigate('/suppliers')}
            />
          </div>
        </div>
      </div>

      <AddItemModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSubmit={addNewItem}
      />
    </div>
  );
}
