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
  User,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { quoteService } from '../services/quoteService';
import { DollarOutlined } from '@ant-design/icons';

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

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: {
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: <Clock className="w-4 h-4" />,
        text: 'Pendente'
      },
      RESPONDED: {
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: <MessageSquare className="w-4 h-4" />,
        text: 'Respondido'
      },
      ACCEPTED: {
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: <CheckCircle className="w-4 h-4" />,
        text: 'Aceito'
      },
      REJECTED: {
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: <XCircle className="w-4 h-4" />,
        text: 'Rejeitado'
      }
    };

    return configs[status as keyof typeof configs];
  };

  const isSupplier = user?.type === 'SUPPLIER';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar ao Dashboard</span>
          </button>

          <h1 className="text-4xl font-bold leading-tight bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            {isSupplier ? 'Solicitações de Orçamento' : 'Meus Orçamentos'}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            {isSupplier
              ? 'Gerencie as solicitações de orçamento recebidas'
              : 'Acompanhe suas solicitações de orçamento'}
          </p>
        </div>

        {budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const statusConfig = getStatusConfig(budget.status);

              return (
                <div key={budget.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900">
                          {isSupplier ? budget.organizer?.name : budget.supplier?.companyName}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold border ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.text}
                        </span>
                      </div>

                      <div className="space-y-2 text-gray-600 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Evento:</span>
                          <span>{budget.event?.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>{budget.event?.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span>{budget.event?.guestCount} convidados</span>
                        </div>
                      </div>
                    </div>

                    {budget.price && (
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 rounded-xl border-2 border-emerald-200">
                        <div className="flex items-center gap-2 text-emerald-700">
                          <DollarOutlined className="w-5 h-5" />
                          <span className="font-bold">
                            R$ {Number(budget.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Mensagem:</p>
                      <p className="text-gray-600">{budget.message}</p>
                    </div>

                    {budget.response && (
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Resposta do Fornecedor:</p>
                        <p className="text-gray-700">{budget.response}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    {isSupplier && budget.status === 'PENDING' && (
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => handleRespond(budget)}
                        className="font-semibold"
                      >
                        Responder Solicitação
                      </Button>
                    )}

                    {!isSupplier && budget.status === 'RESPONDED' && (
                      <>
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => handleUpdateStatus(budget.id, 'ACCEPTED')}
                          icon={<CheckCircle className="w-4 h-4" />}
                          className="font-semibold"
                        >
                          Aceitar Orçamento
                        </Button>
                        <Button
                          danger
                          size="large"
                          onClick={() => handleUpdateStatus(budget.id, 'REJECTED')}
                          icon={<XCircle className="w-4 h-4" />}
                          className="font-semibold"
                        >
                          Rejeitar
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-4">
                    Criado em {new Date(budget.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(budget.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="space-y-2">
                  <p className="text-gray-600 font-medium">
                    {isSupplier
                      ? 'Nenhuma solicitação de orçamento recebida'
                      : 'Você ainda não solicitou orçamentos'}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {isSupplier
                      ? 'As solicitações aparecerão aqui quando os organizadores entrarem em contato'
                      : 'Encontre fornecedores e solicite orçamentos para seus eventos'}
                  </p>
                </div>
              }
            >
              {!isSupplier && (
                <Button type="primary" size="large" onClick={() => navigate('/suppliers')}>
                  Buscar Fornecedores
                </Button>
              )}
            </Empty>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        title={<span className="text-xl font-bold">Responder Solicitação</span>}
        open={showResponseModal}
        onCancel={() => {
          setShowResponseModal(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedBudget && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-bold text-gray-900">{selectedBudget.organizer?.name}</h4>
            <p className="text-sm text-gray-600 mt-1">Evento: {selectedBudget.event?.title}</p>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmitResponse}>
          <Form.Item
            name="price"
            label={<span className="font-semibold">Valor do Orçamento</span>}
            rules={[{ required: true, message: 'Digite o valor' }]}
          >
            <InputNumber
              prefix="R$"
              style={{ width: '100%' }}
              size="large"
              min={0}
              step={0.01}
              placeholder="0,00"
              decimalSeparator=","
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name="response"
            label={<span className="font-semibold">Mensagem de Resposta</span>}
            rules={[{ required: true, message: 'Digite uma mensagem' }]}
          >
            <TextArea
              rows={4}
              placeholder="Descreva sua proposta e condições..."
              className="rounded-lg"
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
                size="large"
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
                Enviar Resposta
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}