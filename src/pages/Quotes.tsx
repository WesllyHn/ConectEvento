import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Tag,
  Button,
  Empty,
  Spin,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
} from 'antd';
import {
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  DollarSign,
  Calendar,
  MapPin,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { quoteService } from '../services/quoteService';

const { TextArea } = Input;

export function Quotes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const loadBudgets = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await quoteService.getBudgetsByUserId(user.id);
      setBudgets(data);
    } catch (error) {
      console.error('Error loading budgets:', error);
      message.error('Erro ao carregar orçamentos');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadBudgets();
  }, [user, navigate, loadBudgets]);

  const handleRespond = (budget: any) => {
    setSelectedBudget(budget);
    form.setFieldsValue({
      response: '',
      price: null
    });
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async (values: any) => {
    if (!selectedBudget) return;

    try {
      setSubmitting(true);
      await quoteService.updateBudget(selectedBudget.id, {
        status: 'RESPONDED',
        response: values.response,
        price: values.price
      });

      message.success('Resposta enviada com sucesso!');
      setShowResponseModal(false);
      form.resetFields();
      loadBudgets();
    } catch (error) {
      console.error('Error responding to budget:', error);
      message.error('Erro ao enviar resposta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (budgetId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await quoteService.updateBudget(budgetId, { status });
      message.success(`Orçamento ${status === 'ACCEPTED' ? 'aceito' : 'rejeitado'} com sucesso!`);
      loadBudgets();
    } catch (error) {
      console.error('Error updating budget status:', error);
      message.error('Erro ao atualizar status');
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'orange', icon: <Clock className="w-4 h-4" />, text: 'Pendente' },
      RESPONDED: { color: 'blue', icon: <MessageSquare className="w-4 h-4" />, text: 'Respondido' },
      ACCEPTED: { color: 'green', icon: <CheckCircle className="w-4 h-4" />, text: 'Aceito' },
      REJECTED: { color: 'red', icon: <XCircle className="w-4 h-4" />, text: 'Rejeitado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Tag color={config.color} className="flex items-center gap-1">
        {config.icon}
        <span>{config.text}</span>
      </Tag>
    );
  };

  const isSupplier = user?.type === 'SUPPLIER';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isSupplier ? 'Solicitações de Orçamento' : 'Meus Orçamentos'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isSupplier
              ? 'Gerencie as solicitações de orçamento recebidas'
              : 'Acompanhe suas solicitações de orçamento'}
          </p>
        </div>

        {budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <Card key={budget.id} className="hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">
                        {isSupplier ? budget.organizer?.name : budget.supplier?.companyName}
                      </h3>
                      {getStatusTag(budget.status)}
                    </div>

                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Evento: {budget.event?.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{budget.event?.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{budget.event?.guestCount} convidados</span>
                      </div>
                    </div>
                  </div>

                  {budget.price && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-600 font-bold text-2xl">
                        <DollarSign className="w-6 h-6" />
                        <span>R$ {budget.price.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="text-gray-700 mb-2">
                    <strong>Mensagem:</strong> {budget.message}
                  </p>

                  {budget.response && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-gray-700">
                        <strong>Resposta:</strong> {budget.response}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  {isSupplier && budget.status === 'PENDING' && (
                    <Button
                      type="primary"
                      onClick={() => handleRespond(budget)}
                    >
                      Responder
                    </Button>
                  )}

                  {!isSupplier && budget.status === 'RESPONDED' && (
                    <>
                      <Button
                        type="primary"
                        onClick={() => handleUpdateStatus(budget.id, 'ACCEPTED')}
                        icon={<CheckCircle className="w-4 h-4" />}
                      >
                        Aceitar
                      </Button>
                      <Button
                        danger
                        onClick={() => handleUpdateStatus(budget.id, 'REJECTED')}
                        icon={<XCircle className="w-4 h-4" />}
                      >
                        Rejeitar
                      </Button>
                    </>
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-4">
                  Criado em: {new Date(budget.createdAt).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(budget.createdAt).toLocaleTimeString('pt-BR')}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Empty
              description={
                isSupplier
                  ? 'Nenhuma solicitação de orçamento recebida'
                  : 'Você ainda não solicitou orçamentos'
              }
            >
              {!isSupplier && (
                <Button type="primary" onClick={() => navigate('/suppliers')}>
                  Buscar Fornecedores
                </Button>
              )}
            </Empty>
          </Card>
        )}
      </div>

      <Modal
        title="Responder Solicitação"
        open={showResponseModal}
        onCancel={() => {
          setShowResponseModal(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitResponse}>
          <Form.Item
            name="price"
            label="Valor do Orçamento"
            rules={[{ required: true, message: 'Digite o valor' }]}
          >
            <InputNumber
              prefix="R$"
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item
            name="response"
            label="Mensagem de Resposta"
            rules={[{ required: true, message: 'Digite uma mensagem' }]}
          >
            <TextArea
              rows={4}
              placeholder="Descreva sua proposta e condições..."
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setShowResponseModal(false);
                  form.resetFields();
                }}
                block
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" block loading={submitting}>
                Enviar Resposta
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
