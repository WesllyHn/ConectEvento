import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  MessageSquare,
  Calendar,
  User,
  TrendingUp,
  Award,
  BarChart3,
  Reply,
  X,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reviewService } from '../services/reviewService';

interface ReviewWithResponse {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  organizerName: string;
  eventType: string;
  response?: string;
  responseDate?: string;
}

const eventTypeMap: Record<string, string> = {
  WEDDING: 'Casamento',
  BIRTHDAY: 'Aniversário',
  CORPORATE: 'Corporativo',
  PARTY: 'Festa',
  OTHER: 'Outro'
};

export function SupplierReviews() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [supplierReviews, setSupplierReviews] = useState<ReviewWithResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [user?.id]);

  const loadReviews = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await reviewService.getReviewsByUserId(user.id, 'SUPPLIER');
      
      const formattedReviews: ReviewWithResponse[] = response.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        organizerName: review.organizer?.name || 'Organizador',
        eventType: eventTypeMap[review.event?.type] || review.event?.type || 'Evento',
        response: review.response,
        responseDate: review.responseDate
      }));

      setSupplierReviews(formattedReviews);
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err);
      setError('Não foi possível carregar as avaliações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: supplierReviews.length,
    averageRating: supplierReviews.reduce((acc, review) => acc + review.rating, 0) / supplierReviews.length,
    fiveStars: supplierReviews.filter(r => r.rating === 5).length,
    fourStars: supplierReviews.filter(r => r.rating === 4).length,
    threeStars: supplierReviews.filter(r => r.rating === 3).length,
    twoStars: supplierReviews.filter(r => r.rating === 2).length,
    oneStar: supplierReviews.filter(r => r.rating === 1).length,
    withResponse: supplierReviews.filter(r => r.response).length
  };

  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview || !responseText.trim()) return;

    try {
      setSubmitting(true);
      await reviewService.respondToReview(selectedReview, {
        response: responseText.trim(),
        responseDate: new Date().toISOString()
      });

      // Atualizar a lista de avaliações
      await loadReviews();

      setShowResponseModal(false);
      setSelectedReview(null);
      setResponseText('');
    } catch (err) {
      console.error('Erro ao enviar resposta:', err);
      alert('Não foi possível enviar a resposta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const openResponseModal = (reviewId: string) => {
    setSelectedReview(reviewId);
    setShowResponseModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/supplier-dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Dashboard</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Minhas Avaliações</h1>
          <p className="text-gray-600 mt-2">Veja o que seus clientes estão dizendo sobre seus serviços</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Avaliações</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {Number.isFinite(stats?.averageRating)
                          ? stats.averageRating.toFixed(1)
                          : '—'}
                      </p>

                      <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                    </div>
                  </div>
                  <Award className="w-8 h-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">5 Estrelas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.fiveStars}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Com Resposta</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.withResponse}</p>
                  </div>
                  <Reply className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Rating Distribution */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <span>Distribuição</span>
                </h2>

                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = stats[`${stars === 1 ? 'oneStar' : stars === 2 ? 'twoStars' : stars === 3 ? 'threeStars' : stars === 4 ? 'fourStars' : 'fiveStars'}` as keyof typeof stats] as number;
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                    return (
                      <div key={stars} className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 w-16">
                          <span className="text-sm font-medium text-gray-700">{stars}</span>
                          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Avaliações Recebidas</h2>

                  {supplierReviews.length > 0 ? (
                    <div className="space-y-6">
                      {supplierReviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{review.organizerName}</p>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
                                  <span>•</span>
                                  <span>{review.eventType}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  fill="currentColor"
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">{review.comment}</p>

                          {review.response ? (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <Reply className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">Sua resposta</span>
                                <span className="text-xs text-blue-600">
                                  {new Date(review.responseDate!).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-blue-800">{review.response}</p>
                            </div>
                          ) : (
                            <button
                              onClick={() => openResponseModal(review.id)}
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              <Reply className="w-4 h-4" />
                              <span>Responder avaliação</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Sem avaliações</h3>
                      <p className="text-gray-600">
                        Quando você receber avaliações dos clientes, elas aparecerão aqui
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Responder Avaliação</h2>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Review Preview */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => {
                      const review = supplierReviews.find(r => r.id === selectedReview);
                      return (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < (review?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          fill="currentColor"
                        />
                      );
                    })}
                  </div>
                  <span className="text-sm text-gray-600">
                    {supplierReviews.find(r => r.id === selectedReview)?.organizerName}
                  </span>
                </div>
                <p className="text-gray-700">
                  {supplierReviews.find(r => r.id === selectedReview)?.comment}
                </p>
              </div>

              <form onSubmit={handleResponseSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sua Resposta
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    required
                    placeholder="Agradeça pelo feedback e responda de forma profissional..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Seja profissional e cordial. Sua resposta será pública.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowResponseModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !responseText.trim()}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <span>Enviar Resposta</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}