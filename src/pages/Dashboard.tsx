import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Search, MessageSquare, TrendingUp, Plus, Clock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Modal, Form, Input, Select, Button, Row, Col, Empty, message, Collapse } from 'antd';
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
  console.log(loading, loadingQuotes);

  const loadUserEvents = useCallback(async () => {
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
  }, [user?.id]); // Inclua dependências internas

  const loadUserQuotes = useCallback(async () => {
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
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadUserEvents();
      loadUserQuotes();
    }
  }, [user?.id, loadUserEvents, loadUserQuotes]);


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

  const getEventTypeLabel = (type: string) => {
    const eventType = eventTypes.find(et => et.value === type);
    return eventType ? eventType.label : type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Organizador</h1>
          <p className="text-gray-600 mt-2">Bem-vindo de volta, {user?.name}!</p>
        </div>

        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Eventos Ativos"
              value={userEvents.length}
              icon={Calendar}
              iconColor="text-blue-600"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Orçamentos Solicitados"
              value={userQuotes.length}
              icon={MessageSquare}
              iconColor="text-green-600"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Respostas Recebidas"
              value={userQuotes.filter(q => q.status === 'RESPONDED').length}
              icon={CheckCircle}
              iconColor="text-emerald-600"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Pendentes"
              value={userQuotes.filter(q => q.status === 'PENDING').length}
              icon={Clock}
              iconColor="text-yellow-600"
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <DataCard title="Ações Rápidas">
              <div className="space-y-3">
                <ActionButton
                  icon={Search}
                  onClick={() => navigate('/suppliers')}
                  block
                  size="large"
                >
                  Buscar Fornecedores
                </ActionButton>
                <ActionButton
                  icon={TrendingUp}
                  onClick={() => navigate('/reviews')}
                  block
                  size="large"
                >
                  Avaliar Fornecedores
                </ActionButton>
                <ActionButton
                  icon={Plus}
                  onClick={() => setShowCreateEventModal(true)}
                  type="primary"
                  block
                  size="large"
                >
                  Criar Novo Evento
                </ActionButton>
              </div>
            </DataCard>
          </Col>

          <Col xs={24} lg={16}>
            {/* Meus Eventos com Collapse */}
            <Collapse
              defaultActiveKey={['events']}
              className="mb-6"
              expandIcon={({ isActive }) => 
                isActive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />
              }
            >
              <Panel 
                header={
                  <span className="font-semibold text-lg">
                    Meus Eventos ({userEvents.length})
                  </span>
                } 
                key="events"
              >
                <div className="max-h-[600px] overflow-y-auto pr-2">
                  {userEvents.length > 0 ? (
                    <div className="space-y-4">
                      {userEvents.map((event) => (
                        <DataCard
                          key={event.id}
                          status={{
                            text: event.status === 'PLANNING' ? 'Planejando' :
                              event.status === 'CONFIRMED' ? 'Confirmado' : 'Completo',
                            color: event.status === 'PLANNING' ? 'warning' :
                              event.status === 'CONFIRMED' ? 'success' : 'blue'
                          }}
                          title={event.title}
                        >
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Data:</strong> {new Date(event.date).toLocaleDateString('pt-BR')}</p>
                            <p><strong>Local:</strong> {event.location}</p>
                            <p><strong>Orçamento:</strong> {event.budget}</p>
                            <div className="flex items-center justify-between mt-3">
                              <Button
                                type="link"
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setShowRoadmapModal(true);
                                }}
                              >
                                Ver Roadmap
                              </Button>
                              <span className="text-xs text-gray-500 font-bold">{getEventTypeLabel(event.type)}</span>
                            </div>
                          </div>
                        </DataCard>
                      ))}
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

            {/* Solicitações de Orçamento com Collapse */}
            <Collapse
              defaultActiveKey={['quotes']}
              expandIcon={({ isActive }) => 
                isActive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />
              }
            >
              <Panel 
                header={
                  <span className="font-semibold text-lg">
                    Solicitações de Orçamento ({userQuotes.length})
                  </span>
                } 
                key="quotes"
              >
                <div className="max-h-[600px] overflow-y-auto pr-2">
                  <QuotesSection quotes={userQuotes} />
                </div>
              </Panel>
            </Collapse>
          </Col>
        </Row>
      </div>

      <Modal
        title="Criar Novo Evento"
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
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" block>
                Criar Evento
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

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