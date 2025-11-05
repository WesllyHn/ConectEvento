import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Evento não encontrado</h1>
            <Button
              type="primary"
              onClick={() => navigate('/dashboard')}
              aria-label="Voltar ao Dashboard"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EventHeader event={event} completionPercentage={completionPercentage} />

        <div className="mt-8">
          <RoadmapStats
            stats={stats}
            activeFilter={activeStatusFilter}
            onFilterChange={setActiveStatusFilter}
          />
        </div>

        <Card className="mt-8">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Roadmap do Evento</h2>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowAddModal(true)}
                aria-label="Adicionar Item"
              >
                Adicionar Item
              </Button>
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
          </Space>
        </Card>
      </div>

      <AddItemModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSubmit={addNewItem}
      />
    </div>
  );
}
