import { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  CheckCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
  Calendar,
  Award,
  MessageSquare,
  Clock
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
  
  const loadSupplierData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const userData = await userService.getUserById(id);
      setSupplier(userData);
      
      // Carrega as imagens do portfolio
      const images = await uploadService.getSupplierImages(id);
      const imageUrls = images.map(img => uploadService.getImageUrl(img.id));
      setPortfolioImages(imageUrls);
      
      // Define o avatar como a PRIMEIRA imagem do portfolio, ou o avatar do usuário como fallback
      if (imageUrls.length > 0) {
        setAvatarUrl(imageUrls[imageUrls.length - 1]); // Primeira imagem
      } else if (userData.avatar) {
        setAvatarUrl(userData.avatar);
      }
    } catch (error) {
      console.error('Error loading supplier data:', error);
      message.error('Erro ao carregar dados do fornecedor');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadSupplierReviews = useCallback(async () => {
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
  }, [id]);

  const loadUserEvents = useCallback(async () => {
    if (!user?.id) return;
    try {
      const userEvents = await eventService.getEventsByOrganizerId(user.id);
      setEvents(userEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }, [user?.id]);

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
  }, [id, loadSupplierData, loadSupplierReviews]);

  useEffect(() => {
    if (user?.id) {
      loadUserEvents();
    }
  }, [user?.id, loadUserEvents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <Empty description="Fornecedor não encontrado">
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate(user?.type === 'supplier' ? '/supplier-dashboard' : '/suppliers')}
            >
              {user?.type === "supplier" ? 'Voltar para dashboard' : 'Voltar para fornecedores'}
            </Button>
          </Empty>
        </div>
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
  const supplierName = supplier.companyName || supplier.name;
  const firstLetter = supplierName.charAt(0).toUpperCase();

  const getPriceRangeConfig = (priceRange: string) => {
    const configs: Record<string, { label: string; gradient: string }> = {
      BUDGET: { label: 'Econômico', gradient: 'from-emerald-500 to-emerald-600' },
      MID: { label: 'Intermediário', gradient: 'from-amber-500 to-amber-600' },
      PREMIUM: { label: 'Premium', gradient: 'from-purple-500 to-purple-600' }
    };
    return configs[priceRange] || configs.BUDGET;
  };

  const priceConfig = getPriceRangeConfig(supplier.priceRange);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Botão Voltar */}
          <button
            onClick={() => navigate(user?.type === 'supplier' ? '/supplier-dashboard' : '/suppliers')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">
              {user?.type === "supplier" ? 'Voltar para dashboard' : 'Voltar para fornecedores'}
            </span>
          </button>

          <Row gutter={[24, 24]}>
            {/* Coluna Principal */}
            <Col xs={24} lg={16}>
              {/* Card Principal */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                  {avatarUrl ? (
                    <Avatar
                      size={96}
                      src={avatarUrl}
                      alt={supplierName}
                      className="shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0';
                        placeholder.innerHTML = `<span class="text-4xl font-bold text-white">${firstLetter}</span>`;
                        target.parentElement!.appendChild(placeholder);
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-4xl font-bold text-white">{firstLetter}</span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">{supplierName}</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{supplier.location}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg">
                        <Rate disabled value={supplier.rating} className="text-sm" />
                        <span className="font-bold text-gray-900">{supplier.rating}</span>
                        <span className="text-gray-600">({supplier.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
                        supplier.availability 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {supplier.availability ? '✓ Disponível' : '✕ Indisponível'}
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md bg-gradient-to-r ${priceConfig.gradient}`}>
                        {priceConfig.label}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <Row gutter={16} className="mb-6">
                  <Col xs={24} sm={8}>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                      <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-700">{reviews.length}</div>
                      <div className="text-sm text-blue-800 font-medium">Avaliações</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200">
                      <Star className="w-8 h-8 text-amber-600 mx-auto mb-2 fill-amber-600" />
                      <div className="text-2xl font-bold text-amber-700">{supplier.rating}</div>
                      <div className="text-sm text-amber-800 font-medium">Nota Média</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200">
                      <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-700">{services.length}</div>
                      <div className="text-sm text-purple-800 font-medium">Serviços</div>
                    </div>
                  </Col>
                </Row>

                {/* Descrição */}
                {supplier.description && (
                  <div className="pt-6 border-t border-gray-100">
                    <p className="text-gray-700 text-base leading-relaxed">{supplier.description}</p>
                  </div>
                )}
              </div>

              {/* Serviços */}
              {services.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                    Serviços Oferecidos
                  </h2>
                  <Row gutter={[12, 12]}>
                    {services.map((service: string, index: number) => (
                      <Col key={index} xs={24} sm={12} md={8}>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <span className="font-medium text-blue-900">{service}</span>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* Portfólio */}
              {portfolioImages.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Portfólio</h2>
                  <Row gutter={[12, 12]}>
                    {portfolioImages.map((image: string, index: number) => (
                      <Col key={index} xs={12} sm={8}>
                        <div
                          className="relative group cursor-pointer rounded-xl overflow-hidden"
                          onClick={() => openImageModal(index)}
                        >
                          <img
                            src={image}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                              Ver imagem
                            </span>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* Avaliações */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  Avaliações dos Clientes
                </h2>
                {loadingReviews ? (
                  <div className="text-center py-8">
                    <Spin />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {review.organizer?.name || 'Organizador'}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
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

                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">{review.comment}</p>

                        {review.response && (
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-lg mt-3 border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-bold text-blue-900">Resposta do fornecedor</span>
                              <span className="text-xs text-blue-600">
                                {new Date(review.responseDate).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-blue-800 leading-relaxed">{review.response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="Nenhuma avaliação disponível" />
                )}
              </div>
            </Col>

            {/* Sidebar */}
            <Col xs={24} lg={8}>
              <div className="sticky top-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Solicitar Orçamento</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm">Resposta em até 24h</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm">Orçamento gratuito</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm">Sem compromisso</span>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={() => setShowQuoteModal(true)}
                    disabled={!supplier.availability || user?.type == 'supplier'}
                    className="font-semibold"
                  >
                    {supplier.availability ? 'Solicitar Orçamento' : 'Indisponível'}
                  </Button>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-3">Informações de Contato</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span>📧</span>
                        <span>{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{supplier.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Modal Orçamento */}
      <Modal
        title={<span className="text-xl font-bold">Solicitar Orçamento</span>}
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
            label={<span className="font-semibold">Selecione o Evento</span>}
            rules={[{ required: true, message: 'Selecione um evento' }]}
          >
            <Select
              placeholder="Selecione o evento para solicitar orçamento"
              size="large"
              options={events.map(event => ({
                label: `${event.title} - ${new Date(event.date).toLocaleDateString('pt-BR')}`,
                value: event.id
              }))}
            />
          </Form.Item>

          <Form.Item
            name="message"
            label={<span className="font-semibold">Mensagem para o Fornecedor</span>}
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
                size="large"
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
                Enviar Solicitação
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Imagem */}
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
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
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

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-70 px-4 py-2 rounded-full font-semibold">
              {selectedImageIndex + 1} de {portfolioImages.length}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}