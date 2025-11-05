import React, { useState, useEffect } from 'react';
import {
  Card,
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
import { Award, Calendar, MapPin, Star, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { reviewService, CreateReviewData, UpdateReviewResponse } from '../services/reviewService';
import { StatCard } from '../components/Common';

const { TextArea } = Input;

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

  const isSupplier = user?.type === 'SUPPLIER';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
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
      }
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

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
            {isSupplier ? 'Avaliações Recebidas' : 'Avaliar Fornecedores'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isSupplier
              ? 'Visualize e responda as avaliações dos seus clientes'
              : 'Avalie os fornecedores que prestaram serviços para seus eventos'}
          </p>
        </div>

        {!isSupplier && (
          <>
            <Row gutter={[16, 16]} className="mb-8">
              <Col xs={24} sm={8}>
                <StatCard
                  title="Serviços Contratados"
                  value={suppliersToReview.length}
                  icon={Award}
                  iconColor="text-blue-600"
                />
              </Col>
              <Col xs={24} sm={8}>
                <StatCard
                  title="Avaliações Pendentes"
                  value={suppliersToReview.filter(
                    s => !isAlreadyReviewed(s.fornecedorId, s.eventoId)
                  ).length}
                  icon={Award}
                  iconColor="text-yellow-600"
                />
              </Col>
              <Col xs={24} sm={8}>
                <StatCard
                  title="Já Avaliados"
                  value={existingReviews.length}
                  icon={Award}
                  iconColor="text-green-600"
                />
              </Col>
            </Row>

            {suppliersToReview.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Fornecedores para Avaliar</h2>
                {suppliersToReview.map((supplier) => {
                  const alreadyReviewed = isAlreadyReviewed(
                    supplier.fornecedorId,
                    supplier.eventoId
                  );

                  return (
                    <Card key={`${supplier.fornecedorId}-${supplier.eventoId}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar
                            size={64}
                            src={supplier.fornecedorAvatar}
                            style={{ backgroundColor: '#1890ff' }}
                          >
                            {supplier.fornecedorNome.charAt(0)}
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">
                                {supplier.fornecedorNome}
                              </h3>
                              {alreadyReviewed && (
                                <Tag color="green">Avaliado</Tag>
                              )}
                            </div>

                            <div className="space-y-1 text-gray-600 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Evento: {supplier.eventoTitulo}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  Data: {new Date(supplier.eventoData).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                <span>Serviço: {supplier.servicoPrestado}</span>
                              </div>
                              {supplier.descricaoServico && (
                                <p className="mt-2">{supplier.descricaoServico}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {!alreadyReviewed && (
                          <Button
                            type="primary"
                            onClick={() => openReviewModal(supplier)}
                          >
                            Avaliar
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <Empty description="Nenhum fornecedor para avaliar no momento" />
              </Card>
            )}
          </>
        )}

        {existingReviews.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              {isSupplier ? 'Avaliações Recebidas' : 'Minhas Avaliações'}
            </h2>
            {existingReviews.map((review) => (
              <Card key={review.id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar
                        size={48}
                        src={
                          isSupplier
                            ? review.organizer?.avatar
                            : review.supplier?.avatar
                        }
                        style={{ backgroundColor: '#1890ff' }}
                      >
                        {isSupplier
                          ? review.organizer?.name.charAt(0)
                          : review.supplier?.companyName?.charAt(0)}
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {isSupplier
                              ? review.organizer?.name
                              : review.supplier?.companyName}
                          </h3>
                          <Rate disabled value={review.rating} />
                        </div>

                        <div className="space-y-1 text-gray-600 text-sm mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Evento: {review.event?.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{review.event?.location}</span>
                          </div>
                        </div>

                        <p className="text-gray-700">{review.comment}</p>

                        {review.response && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-blue-900">Resposta:</span>
                            </div>
                            <p className="text-gray-700">{review.response}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(review.responseDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {isSupplier && !review.response && (
                      <Button
                        type="primary"
                        onClick={() => openResponseModal(review)}
                      >
                        Responder
                      </Button>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    Avaliado em: {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        title="Avaliar Fornecedor"
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
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{selectedSupplier.fornecedorNome}</h3>
              <p className="text-gray-600">Evento: {selectedSupplier.eventoTitulo}</p>
            </div>

            <Form form={form} layout="vertical" onFinish={handleReviewSubmit}>
              <Form.Item
                name="rating"
                label="Avaliação"
                rules={[{ required: true, message: 'Selecione uma avaliação' }]}
              >
                <Rate />
              </Form.Item>

              <Form.Item
                name="comment"
                label="Comentário"
                rules={[{ required: true, message: 'Digite um comentário' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Compartilhe sua experiência com este fornecedor..."
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
                  >
                    Cancelar
                  </Button>
                  <Button type="primary" htmlType="submit" block loading={submitting}>
                    Enviar Avaliação
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      <Modal
        title="Responder Avaliação"
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
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Rate disabled value={selectedReview.rating} />
              </div>
              <p className="text-gray-700">{selectedReview.comment}</p>
            </div>

            <Form form={responseForm} layout="vertical" onFinish={handleResponseSubmit}>
              <Form.Item
                name="response"
                label="Sua Resposta"
                rules={[{ required: true, message: 'Digite uma resposta' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Responda a avaliação do cliente..."
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
                  >
                    Cancelar
                  </Button>
                  <Button type="primary" htmlType="submit" block loading={submitting}>
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
