import React, { useState, useEffect } from 'react';
import { Calendar, Search, MessageSquare, TrendingUp, Plus, Clock, CheckCircle, ChevronDown, ChevronUp, MoreVertical, Star } from 'lucide-react';
import { Modal, Form, Input, Select, Button, Row, Col, Empty, message, Collapse, Dropdown } from 'antd';
import { useAuth } from '../context/AuthContext';
import { eventTypes, budgetRanges } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { StatCard, DataCard, ActionButton } from '../components/Common';
import { eventService, Event } from '../services/eventService';
import { quoteService } from '../services/quoteService';
import { QuotesSection } from '../components/Dashboard';
import { RoadmapModal } from '../components/RoadmapModal';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

const { TextArea } = Input;
const { Panel } = Collapse;

// Componente de Stat Card customizado com cores
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
    {/* Background decorativo */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300`}>
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

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [userQuotes, setUserQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user?.id) {
      loadUserEvents();
      loadUserQuotes();
    }
  }, [user?.id]);

  const loadUserEvents = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const events = await eventService.getEventsByOrganizer(user.id);
      setUserEvents(events);
    } catch (error) {
      console.error('Error loading events:', error);
      message.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const loadUserQuotes = async () => {
    if (!user?.id) return;

    try {
      setLoadingQuotes(true);
      const quotes = await quoteService.getBudgetsByUserId(user.id);
      setUserQuotes(quotes);
    } catch (error) {
      console.error('Error loading quotes:', error);
      message.error('Erro ao carregar orçamentos');
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleCreateEvent = async (values: any) => {
    if (!user?.id) {
      message.error('Usuário não autenticado');
      return;
    }

    try {
      await eventService.createEvent({
        ...values,
        date: new Date(values.date).toISOString(),
        guestCount: Number(values.guestCount),
        organizerId: user.id,
      });
      message.success('Evento criado com sucesso!');
      setShowCreateEventModal(false);
      form.resetFields();
      await loadUserEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      message.error('Erro ao criar evento');
    }
  };

  const handleUpdateEventStatus = async (eventId: string, newStatus: 'COMPLETED' | 'CANCELLED') => {
    try {
      await eventService.updateEventStatus(eventId, newStatus);
      message.success(
        newStatus === 'COMPLETED'
          ? 'Evento marcado como completo!'
          : 'Evento cancelado!'
      );
      await loadUserEvents();
    } catch (error) {
      console.error('Error updating event status:', error);
      message.error('Erro ao atualizar status do evento');
    }
  };

  const getEventTypeLabel = (type: string) => {
    const eventType = eventTypes.find(et => et.value === type);
    return eventType ? eventType.label : type;
  };

  const getEventStatusLabel = (status: string) => {
    const statusMap: Record<string, { text: string; color: 'warning' | 'success' | 'blue' | 'error' }> = {
      PLANNING: { text: 'Planejando', color: 'warning' },
      CONFIRMED: { text: 'Confirmado', color: 'success' },
      COMPLETED: { text: 'Completo', color: 'blue' },
      CANCELLED: { text: 'Cancelado', color: 'error' }
    };
    return statusMap[status] || { text: status, color: 'warning' };
  };

  const getEventMenuItems = (event: Event) => {
    const items = [
      {
        key: 'roadmap',
        label: 'Ver Roadmap',
        onClick: () => {
          setSelectedEvent(event);
          setShowRoadmapModal(true);
        }
      },
      {
        key: 'roadmap-details',
        label: 'Detalhes do Roadmap',
        onClick: () => {
          navigate(`/event-roadmap/${event.id}`)
        }
      }
    ];

    if (event.status === 'PLANNING') {
      items.push(
        {
          key: 'complete',
          label: 'Marcar como Completo',
          onClick: () => {
            Modal.confirm({
              title: 'Marcar evento como completo?',
              content: 'Você poderá avaliar os fornecedores após marcar como completo.',
              okText: 'Sim, marcar como completo',
              cancelText: 'Cancelar',
              onOk: () => handleUpdateEventStatus(event.id, 'COMPLETED'),
            });
          }
        },
        {
          key: 'cancel',
          label: 'Cancelar Evento',
          onClick: () => {
            Modal.confirm({
              title: 'Cancelar evento?',
              content: 'Tem certeza que deseja cancelar este evento?',
              okText: 'Sim, cancelar',
              cancelText: 'Não',
              okButtonProps: { danger: true },
              onOk: () => handleUpdateEventStatus(event.id, 'CANCELLED'),
            });
          }
        }
      );
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold leading-tight bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            Dashboard do Organizador
          </h1>

          <p className="text-gray-600 mt-2 text-lg">Bem-vindo de volta, <span className="font-semibold text-blue-600">{user?.name}</span>!</p>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <ColoredStatCard
              title="Eventos Ativos"
              value={userEvents.filter(e => e.status === 'PLANNING' || e.status === 'CONFIRMED').length}
              icon={Calendar}
              gradient="bg-gradient-to-br from-blue-500 to-blue-700 backdrop-blur-sm"
              iconText="blue-600"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <ColoredStatCard
              title="Orçamentos Solicitados"
              value={userQuotes.length}
              icon={MessageSquare}
              gradient="bg-gradient-to-br from-purple-500 to-purple-700"
              iconText="purple-600"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <ColoredStatCard
              title="Respostas Recebidas"
              value={userQuotes.filter(q => q.status === 'RESPONDED').length}
              icon={CheckCircle}
              gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
              iconText="emerald-600"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <ColoredStatCard
              title="Pendentes"
              value={userQuotes.filter(q => q.status === 'PENDING').length}
              icon={Clock}
              gradient="bg-gradient-to-br from-amber-500 to-amber-700"
              iconText="orange-600"
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Ações Rápidas */}
          <Col xs={24} lg={8}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Ações Rápidas</h2>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => navigate('/suppliers')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:border-gray-300 group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                    Buscar Fornecedores
                  </span>
                </button>

                <button
                  onClick={() => navigate('/reviews')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:border-gray-300 group"
                >
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="font-semibold text-gray-700 group-hover:text-yellow-600 transition-colors">
                    Avaliar Fornecedores
                  </span>
                </button>
                
                <button
                  onClick={() => navigate('/quotes')}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:border-gray-300 group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                    Meus Orçamentos
                  </span>
                </button>

                <button
                  onClick={() => setShowCreateEventModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl group"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-white">
                    Criar Novo Evento
                  </span>
                </button>
              </div>
            </div>
          </Col>

          {/* Eventos e Orçamentos */}
          <Col xs={24} lg={16}>
            {/* Meus Eventos */}
            <Collapse
              defaultActiveKey={['events']}
              className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              expandIcon={({ isActive }) =>
                isActive ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />
              }
              bordered={false}
            >
              <Panel
                header={
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-bold text-lg text-gray-900">
                      Meus Eventos ({userEvents.length})
                    </span>
                  </div>
                }
                key="events"
                className="border-0"
              >
                <div className="max-h-[600px] overflow-y-auto pr-2">
                  {userEvents.length > 0 ? (
                    <div className="space-y-4">
                      {userEvents.map((event) => {
                        const statusInfo = getEventStatusLabel(event.status);
                        return (
                          <DataCard
                            key={event.id}
                            status={statusInfo}
                            title={event.title}
                          >
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>Data:</strong> {new Date(event.date).toLocaleDateString('pt-BR')}</p>
                              <p><strong>Local:</strong> {event.location}</p>
                              <p><strong>Orçamento:</strong> {event.budget}</p>
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-gray-500 font-bold">
                                  {getEventTypeLabel(event.type)}
                                </span>
                                <Dropdown menu={{ items: getEventMenuItems(event) }} trigger={['click']}>
                                  <Button type="text" icon={<MoreVertical className="w-4 h-4" />} />
                                </Dropdown>
                              </div>
                            </div>
                          </DataCard>
                        );
                      })}
                    </div>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Nenhum evento criado ainda"
                    >
                      <Button
                        type="primary"
                        onClick={() => setShowCreateEventModal(true)}
                      >
                        Criar primeiro evento
                      </Button>
                    </Empty>
                  )}
                </div>
              </Panel>
            </Collapse>

            {/* Solicitações de Orçamento */}
            <Collapse
              defaultActiveKey={['quotes']}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              expandIcon={({ isActive }) =>
                isActive ? <ChevronUp className="w-5 h-5 text-purple-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />
              }
              bordered={false}
            >
              <Panel
                header={
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-bold text-lg text-gray-900">
                      Solicitações de Orçamento ({userQuotes.length})
                    </span>
                  </div>
                }
                key="quotes"
                className="border-0"
              >
                <div className="max-h-[600px] overflow-y-auto pr-2">
                  <QuotesSection
                    quotes={userQuotes}
                    onQuoteUpdate={loadUserQuotes}
                  />
                </div>
              </Panel>
            </Collapse>
          </Col>
        </Row>
      </div>

      {/* Modal Criar Evento */}
      <Modal
        title={<span className="text-xl font-bold">Criar Novo Evento</span>}
        open={showCreateEventModal}
        onCancel={() => {
          setShowCreateEventModal(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateEvent}
        >
          <Form.Item
            name="title"
            label="Nome do Evento"
            rules={[{ required: true, message: 'Digite o nome do evento' }]}
          >
            <Input placeholder="Ex: Casamento da Maria e João" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Tipo de Evento"
                rules={[{ required: true, message: 'Selecione o tipo' }]}
              >
                <Select
                  placeholder="Selecione o tipo"
                  size="large"
                  options={eventTypes}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Data do Evento"
                rules={[
                  { required: true, message: 'Selecione a data' },
                  {
                    validator: (_, value) => {
                      if (!value || dayjs(value).isSameOrAfter(dayjs(), 'day')) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('A data não pode ser anterior a hoje'));
                    }
                  }
                ]}
              >
                <Input
                  type="date"
                  size="large"
                  min={dayjs().format('YYYY-MM-DD')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Local do Evento"
                rules={[{ required: true, message: 'Digite o local' }]}
              >
                <Input placeholder="Cidade, bairro ou endereço" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="guestCount" label="Número de Convidados">
                <Input type="number" placeholder="Ex: 150" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="budget"
            label="Orçamento Estimado"
            rules={[{ required: true, message: 'Selecione o orçamento' }]}
          >
            <Select
              placeholder="Selecione a faixa de orçamento"
              size="large"
              options={budgetRanges.map(range => ({ label: range, value: range }))}
            />
          </Form.Item>

          <Form.Item name="description" label="Descrição Adicional">
            <TextArea
              rows={3}
              placeholder="Descreva detalhes específicos do seu evento, preferências ou requisitos especiais..."
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex space-x-4">
              <Button
                onClick={() => {
                  setShowCreateEventModal(false);
                  form.resetFields();
                }}
                block
                size="large"
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" block size="large">
                Criar Evento
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Roadmap Modal */}
      {selectedEvent && (
        <RoadmapModal
          open={showRoadmapModal}
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
          onCancel={() => {
            setShowRoadmapModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}
