import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Row,
  Col,
  Rate,
  Modal,
  Form,
  Input,
  Tag,
  Empty,
  Spin,
  message,
  Avatar
} from 'antd';
import { ArrowLeft, Award, Calendar, CheckCheck, MapPin, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { reviewService, CreateReviewData, UpdateReviewResponse } from '../services/reviewService';
import { uploadService } from '../services/uploadService';
import { eventTypes } from '../data/mockData';

const { TextArea } = Input;

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

export function Reviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [suppliersToReview, setSuppliersToReview] = useState<any[]>([]);
  const [existingReviews, setExistingReviews] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [form] = Form.useForm();
  const [responseForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [supplierAvatars, setSupplierAvatars] = useState<Record<string, string>>({});

  const isSupplier = user?.type === 'SUPPLIER';

  const loadSupplierAvatars = useCallback(async (supplierIds: string[]) => {
    const avatars: Record<string, string> = {};

    await Promise.all(
      supplierIds.map(async (supplierId) => {
        try {
          const images = await uploadService.getSupplierImages(supplierId);
          if (images && images.length > 0) {
            const firstImageUrl = uploadService.getImageUrl(images[images.length - 1].id);
            if (firstImageUrl) {
              avatars[supplierId] = firstImageUrl;
            }
          }
        } catch (error) {
          console.error(`Error loading avatar for supplier ${supplierId}:`, error);
        }
      })
    );

    setSupplierAvatars(prev => ({ ...prev, ...avatars }));
  }, []);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      if (isSupplier) {
        const reviews = await reviewService.getReviewsByUserId(user.id, 'SUPPLIER');
        setExistingReviews(reviews);
      } else {
        const [suppliers, reviews] = await Promise.all([
          reviewService.getSuppliersToReview(user.id),
          reviewService.getReviewsByUserId(user.id, 'ORGANIZER')
        ]);
        setSuppliersToReview(suppliers);
        setExistingReviews(reviews);

        const supplierIds = [
          ...new Set([
            ...suppliers.map((s: any) => s.fornecedorId),
            ...reviews.map((r: any) => r.supplierId)
          ])
        ];
        await loadSupplierAvatars(supplierIds);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [user?.id, isSupplier, loadSupplierAvatars]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate, loadData]);

  const openReviewModal = (supplier: any) => {
    setSelectedSupplier(supplier);
    form.setFieldsValue({
      rating: 5
    });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (values: any) => {
    if (!selectedSupplier || !user?.id) return;

    try {
      setSubmitting(true);

      const reviewData: CreateReviewData = {
        eventId: selectedSupplier.eventoId,
        supplierId: selectedSupplier.fornecedorId,
        organizerId: user.id,
        rating: values.rating,
        comment: values.comment
      };

      await reviewService.createReview(reviewData);
      message.success('Avaliação enviada com sucesso!');
      setShowReviewModal(false);
      form.resetFields();
      loadData();
    } catch (error) {
      console.error('Error creating review:', error);
      message.error('Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const openResponseModal = (review: any) => {
    setSelectedReview(review);
    responseForm.setFieldsValue({
      response: review.response || ''
    });
    setShowResponseModal(true);
  };

  const handleResponseSubmit = async (values: any) => {
    if (!selectedReview) return;

    try {
      setSubmitting(true);

      const responseData: UpdateReviewResponse = {
        response: values.response,
        responseDate: new Date().toISOString()
      };

      await reviewService.respondToReview(selectedReview.id, responseData);
      message.success('Resposta enviada com sucesso!');
      setShowResponseModal(false);
      responseForm.resetFields();
      loadData();
    } catch (error) {
      console.error('Error responding to review:', error);
      message.error('Erro ao enviar resposta');
    } finally {
      setSubmitting(false);
    }
  };

  const isAlreadyReviewed = (fornecedorId: string, eventoId: string) => {
    return existingReviews.some(
      review => review.supplierId === fornecedorId && review.eventId === eventoId
    );
  };

  const getSupplierAvatar = (supplierId: string, fallbackAvatar: string | null) => {
    const portfolioAvatar = supplierAvatars[supplierId];
    if (portfolioAvatar) return portfolioAvatar;
    if (fallbackAvatar) return fallbackAvatar;
    return null;
  };

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

        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar ao Dashboard</span>
          </button>

          <h1 className="text-4xl font-bold leading-tight bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            {isSupplier ? 'Avaliações Recebidas' : 'Avaliar Fornecedores'}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            {isSupplier
              ? 'Visualize e responda as avaliações dos seus clientes'
              : 'Avalie os fornecedores que prestaram serviços para seus eventos'}
          </p>
        </div>

        {!isSupplier && (
          <Row gutter={[16, 16]} className="mb-8">
            <Col xs={24} sm={8}>
              <ColoredStatCard
                title="Serviços Contratados"
                value={suppliersToReview.length}
                icon={Award}
                gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                iconText="blue-600"
              />
            </Col>
            <Col xs={24} sm={8}>
              <ColoredStatCard
                title="Avaliações Pendentes"
                value={suppliersToReview.filter(
                  s => !isAlreadyReviewed(s.fornecedorId, s.eventoId)
                ).length}
                icon={CheckCheck}
                gradient="bg-gradient-to-br from-amber-500 to-amber-700"
                iconText="orange-600"
              />
            </Col>
            <Col xs={24} sm={8}>
              <ColoredStatCard
                title="Já Avaliados"
                value={existingReviews.length}
                icon={Award}
                gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                iconText="emerald-600"
              />
            </Col>
          </Row>
        )}

        {!isSupplier && (
          <>
            {suppliersToReview.length > 0 ? (
              <div className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Fornecedores para Avaliar
                </h2>
                {suppliersToReview.map((supplier) => {
                  const alreadyReviewed = isAlreadyReviewed(
                    supplier.fornecedorId,
                    supplier.eventoId
                  );
                  const avatarUrl = getSupplierAvatar(
                    supplier.fornecedorId,
                    supplier.fornecedorAvatar,
                  );

                  return (
                    <div
                      key={`${supplier.fornecedorId}-${supplier.eventoId}`}
                      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {avatarUrl ? (
                            <Avatar
                              size={64}
                              src={avatarUrl}
                              className="shadow-md"
                            />
                          ) : (
                            <Avatar
                              size={64}
                              className="shadow-md"
                              style={{ backgroundColor: '#1890ff' }}
                            >
                              {supplier.fornecedorNome.charAt(0)}
                            </Avatar>
                          )}

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-bold text-gray-900">
                                {supplier.fornecedorNome}
                              </h3>
                              {alreadyReviewed && (
                                <Tag color="success" className="rounded-full px-3">
                                  ✓ Avaliado
                                </Tag>
                              )}
                            </div>

                            <div className="space-y-2 text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">Evento:</span>
                                <span>{supplier.eventoTitulo}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">Data:</span>
                                <span>
                                  {new Date(supplier.eventoData).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-purple-600" />
                                <span className="font-medium">Serviço:</span>
                                <span>
                                  {eventTypes.find(et => et.value === supplier.servicoPrestado)?.label}
                                </span>
                              </div>

                              {supplier.descricaoServico && (
                                <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                                  {supplier.descricaoServico}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {!alreadyReviewed && (
                          <Button
                            type="primary"
                            size="large"
                            onClick={() => openReviewModal(supplier)}
                            className="min-w-[120px]"
                          >
                            Avaliar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Nenhum fornecedor para avaliar no momento"
                />
              </div>
            )}
          </>
        )}

        {existingReviews.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isSupplier ? 'Avaliações Recebidas' : 'Minhas Avaliações'}
            </h2>
            {existingReviews.map((review) => {
              const avatarUrl = isSupplier
                ? review.organizer?.avatar
                : getSupplierAvatar(
                  review.supplierId,
                  review.supplier?.avatar,
                );

              return (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {avatarUrl ? (
                          <Avatar
                            size={56}
                            src={avatarUrl}
                            className="shadow-md"
                          />
                        ) : (
                          <Avatar
                            size={56}
                            className="shadow-md"
                            style={{ backgroundColor: '#1890ff' }}
                          >
                            {isSupplier
                              ? review.organizer?.name.charAt(0)
                              : review.supplier?.companyName?.charAt(0)}
                          </Avatar>
                        )}

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-gray-900">
                              {isSupplier
                                ? review.organizer?.name
                                : review.supplier?.companyName}
                            </h3>
                            <Rate disabled value={review.rating} className="text-lg" />
                          </div>

                          <div className="space-y-2 text-gray-600 text-sm mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">Evento:</span>
                              <span>{review.event?.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span>{review.event?.location}</span>
                            </div>
                          </div>

                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">
                            {review.comment}
                          </p>

                          {review.response && (
                            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                <span className="font-bold text-blue-900">Resposta do Fornecedor:</span>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{review.response}</p>
                              <p className="text-xs text-gray-500 mt-3">
                                {new Date(review.responseDate).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {isSupplier && !review.response && (
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => openResponseModal(review)}
                          className="min-w-[120px]"
                        >
                          Responder
                        </Button>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 pt-3 border-t border-gray-100">
                      Avaliado em: {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isSupplier && existingReviews.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Você ainda não recebeu avaliações"
            />
          </div>
        )}
      </div>

      <Modal
        title={<span className="text-xl font-bold">Avaliar Fornecedor</span>}
        open={showReviewModal}
        onCancel={() => {
          setShowReviewModal(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedSupplier && (
          <>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-lg text-gray-900">{selectedSupplier.fornecedorNome}</h3>
              <p className="text-gray-600 mt-1">Evento: {selectedSupplier.eventoTitulo}</p>
            </div>

            <Form form={form} layout="vertical" onFinish={handleReviewSubmit}>
              <Form.Item
                name="rating"
                label={<span className="font-semibold">Avaliação</span>}
                rules={[{ required: true, message: 'Selecione uma avaliação' }]}
              >
                <Rate className="text-2xl" />
              </Form.Item>

              <Form.Item
                name="comment"
                label={<span className="font-semibold">Comentário</span>}
                rules={[{ required: true, message: 'Digite um comentário' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Compartilhe sua experiência com este fornecedor..."
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setShowReviewModal(false);
                      form.resetFields();
                    }}
                    block
                    size="large"
                  >
                    Cancelar
                  </Button>
                  <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
                    Enviar Avaliação
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      <Modal
        title={<span className="text-xl font-bold">Responder Avaliação</span>}
        open={showResponseModal}
        onCancel={() => {
          setShowResponseModal(false);
          responseForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedReview && (
          <>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Rate disabled value={selectedReview.rating} />
              </div>
              <p className="text-gray-700 leading-relaxed">{selectedReview.comment}</p>
            </div>

            <Form form={responseForm} layout="vertical" onFinish={handleResponseSubmit}>
              <Form.Item
                name="response"
                label={<span className="font-semibold">Sua Resposta</span>}
                rules={[{ required: true, message: 'Digite uma resposta' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Responda a avaliação do cliente..."
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setShowResponseModal(false);
                      responseForm.resetFields();
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
          </>
        )}
      </Modal>
    </div>
  );
}