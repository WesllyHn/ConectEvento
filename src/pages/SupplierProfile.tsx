import React, { useState, useEffect } from 'react';
import {
  MapPin,
  CheckCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
  Calendar
} from 'lucide-react';
import {
  Button,
  Card,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Rate,
  Empty,
  Avatar,
  Spin,
  message
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { quoteService } from '../services/quoteService';
import { eventService } from '../services/eventService';
import { uploadService } from '../services/uploadService';
import { reviewService } from '../services/reviewService';

const { TextArea } = Input;

const eventTypeMap: Record<string, string> = {
  WEDDING: 'Casamento',
  BIRTHDAY: 'Aniversário',
  CORPORATE: 'Corporativo',
  PARTY: 'Festa',
  OTHER: 'Outro'
};

export function SupplierProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  console.log("user", user)
  
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [form] = Form.useForm();
  const [events, setEvents] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (id) {
      loadSupplierData();
      loadSupplierReviews();
    }
  }, [id]);

  useEffect(() => {
    if (user?.id) {
      loadUserEvents();
    }
  }, [user?.id]);

  const loadSupplierData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const userData = await userService.getUserById(id);
      setSupplier(userData);

      // Buscar imagens do portfólio
      const images = await uploadService.getSupplierImages(id);
      const imageUrls = images.map(img => uploadService.getImageUrl(img.id));
      setPortfolioImages(imageUrls);

      // Usar a primeira imagem do portfólio como avatar
      if (imageUrls.length > 0) {
        setAvatarUrl(imageUrls[0]);
      } else if (userData.avatar) {
        setAvatarUrl(userData.avatar);
      }
    } catch (error) {
      console.error('Error loading supplier data:', error);
      message.error('Erro ao carregar dados do fornecedor');
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierReviews = async () => {
    if (!id) return;

    try {
      setLoadingReviews(true);
      const reviewsData = await reviewService.getReviewsByUserId(id, 'SUPPLIER');
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadUserEvents = async () => {
    if (!user?.id) return;

    try {
      const userEvents = await eventService.getEventsByOrganizerId(user.id);
      setEvents(userEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Empty description="Fornecedor não encontrado">
          <Button type="primary" onClick={() => navigate(user?.type === 'supplier' ? '/supplier-dashboard' : '/suppliers')}>
            {user?.type == "supplier" ? 'Voltar para dashboard' : 'Voltar para fornecedores'}
          </Button>
        </Empty>
      </div>
    );
  }

  const handleQuoteSubmit = async (values: any) => {
    if (!isAuthenticated || !user?.id || !id) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);

      await quoteService.createBudget({
        eventId: values.eventId,
        supplierId: id,
        organizerId: user.id,
        message: values.message
      });

      message.success('Solicitação de orçamento enviada com sucesso!');
      setShowQuoteModal(false);
      form.resetFields();
    } catch (error) {
      console.error('Error creating quote:', error);
      message.error('Erro ao enviar solicitação de orçamento');
    } finally {
      setSubmitting(false);
    }
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === portfolioImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? portfolioImages.length - 1 : prev - 1
    );
  };

  const services = supplier?.services?.map((s: any) => s.service) || [];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(user?.type === 'supplier' ? '/supplier-dashboard' : '/suppliers')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{user?.type == "supplier" ? 'Voltar para dashboard' : 'Voltar para fornecedores'}</span>
          </button>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card className="mb-4">
                <div className="flex items-start gap-6">
                  <Avatar
                    size={96}
                    src={avatarUrl}
                    alt={supplier.companyName}
                  />
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{supplier.companyName}</h1>
                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-5 h-5" />
                        <span>{supplier.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Rate disabled defaultValue={supplier.rating} />
                        <span className="font-semibold">{supplier.rating}</span>
                        <span>({supplier.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Tag color={supplier.availability ? 'success' : 'error'}>
                        {supplier.availability ? 'Disponível' : 'Indisponível'}
                      </Tag>
                      <Tag color={
                        supplier.priceRange === 'BUDGET' ? 'green' :
                          supplier.priceRange === 'MID' ? 'orange' : 'purple'
                      }>
                        {supplier.priceRange === 'BUDGET' ? 'Econômico' :
                          supplier.priceRange === 'MID' ? 'Intermediário' : 'Premium'}
                      </Tag>
                    </div>
                  </div>
                </div>

                <Row gutter={16} className="mt-6">
                  <Col span={8}>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{reviews.length}</div>
                      <div className="text-sm text-blue-800">Avaliações</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{supplier.rating}</div>
                      <div className="text-sm text-green-800">Nota Média</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{services.length}</div>
                      <div className="text-sm text-purple-800">Serviços</div>
                    </div>
                  </Col>
                </Row>

                <p className="text-gray-700 text-lg mt-6">{supplier.description}</p>
              </Card>


              {services.length > 0 && <Card title="Serviços Oferecidos" className="mb-4">
                <Row gutter={[8, 8]}>
                  {services.map((service: string, index: number) => (
                    <Col key={index} xs={24} sm={12} md={8}>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">{service}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>}

              {portfolioImages.length > 0 && (
                <Card title="Portfólio" className="mb-4">
                  <Row gutter={[8, 8]}>
                    {portfolioImages.map((image: string, index: number) => (
                      <Col key={index} xs={12} sm={8}>
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => openImageModal(index)}
                        >
                          <img
                            src={image}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition"
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              )}

              <Card title="Avaliações dos Clientes" className="mb-4">
                {loadingReviews ? (
                  <div className="text-center py-8">
                    <Spin />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {review.organizer?.name || 'Organizador'}
                              </p>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
                                {review.event && (
                                  <>
                                    <span>•</span>
                                    <span>{eventTypeMap[review.event.type] || review.event.type}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3">{review.comment}</p>

                        {review.response && (
                          <div className="bg-blue-50 p-3 rounded-lg mt-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-blue-900">
                                Resposta do fornecedor
                              </span>
                              <span className="text-xs text-blue-600">
                                {new Date(review.responseDate).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-blue-800 text-sm">{review.response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="Nenhuma avaliação disponível" />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Solicitar Orçamento" className="sticky top-8">
                <div className="space-y-4 mb-6">
                  <p className="text-gray-600">✓ Resposta em até 24h</p>
                  <p className="text-gray-600">✓ Orçamento gratuito</p>
                  <p className="text-gray-600">✓ Sem compromisso</p>
                </div>

                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={() => setShowQuoteModal(true)}
                  disabled={!supplier.availability}
                >
                  {supplier.availability ? 'Solicitar Orçamento' : 'Indisponível'}
                </Button>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3">Informações de Contato</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>📧 {supplier.email}</p>
                    <p>📍 {supplier.location}</p>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <Modal
        title="Solicitar Orçamento"
        open={showQuoteModal}
        onCancel={() => {
          setShowQuoteModal(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleQuoteSubmit}>
          <Form.Item
            name="eventId"
            label="Selecione o Evento"
            rules={[{ required: true, message: 'Selecione um evento' }]}
          >
            <Select
              placeholder="Selecione o evento para solicitar orçamento"
              options={events.map(event => ({
                label: `${event.title} - ${new Date(event.date).toLocaleDateString('pt-BR')}`,
                value: event.id
              }))}
            />
          </Form.Item>

          <Form.Item
            name="message"
            label="Mensagem para o Fornecedor"
            rules={[{ required: true, message: 'Digite uma mensagem' }]}
          >
            <TextArea rows={4} placeholder="Descreva o que você precisa..." />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setShowQuoteModal(false);
                  form.resetFields();
                }}
                block
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" block loading={submitting}>
                Enviar Solicitação
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={showImageModal}
        onCancel={() => setShowImageModal(false)}
        footer={null}
        width="90%"
        centered
      >
        {portfolioImages.length > 0 && (
          <div className="relative">
            <img
              src={portfolioImages[selectedImageIndex]}
              alt={`Portfolio ${selectedImageIndex + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />

            {portfolioImages.length > 1 && (
              <>
                <Button
                  icon={<ChevronLeft />}
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  shape="circle"
                  size="large"
                />
                <Button
                  icon={<ChevronRight />}
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  shape="circle"
                  size="large"
                />
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
              {selectedImageIndex + 1} de {portfolioImages.length}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
