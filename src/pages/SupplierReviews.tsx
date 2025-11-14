import React, { useState, useEffect, useCallback } from 'react';
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

// Componente de Stat Card colorido
const ColoredStatCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  iconText
}: {
  title: string;
  value: number | string;
  icon: any;
  gradient: string;
  iconText: string;
}) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 ${gradient} backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300">
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

  const loadReviews = useCallback(async () => {
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
  }, [user?.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

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

  const getStarCountKey = (stars: number): keyof typeof stats => {
    if (stars === 1) return 'oneStar';
    if (stars === 2) return 'twoStars';
    if (stars === 3) return 'threeStars';
    if (stars === 4) return 'fourStars';
    return 'fiveStars';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/supplier-dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar ao Dashboard</span>
          </button>

          <h1 className="text-4xl font-bold leading-tight bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            Minhas Avaliações
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Veja o que seus clientes estão dizendo sobre seus serviços</p>
        </div>

        {(() => {
          if (loading) {
            return (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            );
          }

          if (error) {
            return (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
                {error}
              </div>
            );
          }

          return (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <ColoredStatCard
                  title="Total de Avaliações"
                  value={stats.total}
                  icon={MessageSquare}
                  gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                  iconText="blue-600"
                />
                <ColoredStatCard
                  title="Avaliação Média"
                  value={Number.isFinite(stats?.averageRating) ? stats.averageRating.toFixed(1) : '—'}
                  icon={Award}
                  gradient="bg-gradient-to-br from-amber-500 to-amber-700"
                  iconText="amber-600"
                />
                <ColoredStatCard
                  title="5 Estrelas"
                  value={stats.fiveStars}
                  icon={TrendingUp}
                  gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                  iconText="emerald-600"
                />
                <ColoredStatCard
                  title="Com Resposta"
                  value={stats.withResponse}
                  icon={Reply}
                  gradient="bg-gradient-to-br from-purple-500 to-purple-700"
                  iconText="purple-600"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rating Distribution */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <span>Distribuição de Notas</span>
                  </h2>

                  <div className="space-y-4">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = stats[getStarCountKey(stars)];
                      const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 w-16">
                            <span className="text-sm font-bold text-gray-700">{stars}</span>
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-400 to-amber-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-12 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Avaliações Recebidas</h2>

                    {supplierReviews.length > 0 ? (
                      <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2">
                        {supplierReviews.map((review) => (
                          <div key={review.id} className="border-b-2 border-gray-100 pb-6 last:border-b-0">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{review.organizerName}</p>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
                                    <span>•</span>
                                    <span>{review.eventType}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                                {[1, 2, 3, 4, 5].map((starNumber) => (
                                  <Star
                                    key={`${review.id}-star-${starNumber}`}
                                    className={`w-4 h-4 ${
                                      starNumber <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg mb-4">
                              {review.comment}
                            </p>

                            {review.response ? (
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Reply className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-bold text-blue-900">Sua resposta</span>
                                  <span className="text-xs text-blue-600">
                                    {new Date(review.responseDate!).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                                <p className="text-blue-800 leading-relaxed">{review.response}</p>
                              </div>
                            ) : (
                              <button
                                onClick={() => openResponseModal(review.id)}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg"
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
          );
        })()}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Responder Avaliação</h2>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Review Preview */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 rounded-xl mb-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                    {[1, 2, 3, 4, 5].map((starNumber) => {
                      const review = supplierReviews.find(r => r.id === selectedReview);
                      return (
                        <Star
                          key={`${selectedReview}-modal-star-${starNumber}`}
                          className={`w-4 h-4 ${
                            starNumber <= (review?.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {supplierReviews.find(r => r.id === selectedReview)?.organizerName}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {supplierReviews.find(r => r.id === selectedReview)?.comment}
                </p>
              </div>

              <form onSubmit={handleResponseSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Sua Resposta
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    required
                    placeholder="Agradeça pelo feedback e responda de forma profissional..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span>💡</span>
                    <span>Seja profissional e cordial. Sua resposta será pública.</span>
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowResponseModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !responseText.trim()}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
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