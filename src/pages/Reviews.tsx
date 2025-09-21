import React, { useState } from 'react';
import { Star, Calendar, MessageSquare, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockSuppliers, mockCompletedServices } from '../data/mockData';

interface ReviewFormData {
  supplierId: string;
  rating: number;
  comment: string;
  eventId: string;
}

export function Reviews() {
  const { user } = useAuth();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    supplierId: '',
    rating: 0,
    comment: '',
    eventId: ''
  });

  // Mock data - fornecedores que o organizador já contratou
  const suppliersToReview = mockCompletedServices.filter(
    service => service.organizerId === user?.id
  );

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria enviada a avaliação via API
    console.log('Avaliação enviada:', reviewForm);
    setShowReviewModal(false);
    setReviewForm({
      supplierId: '',
      rating: 0,
      comment: '',
      eventId: ''
    });
  };

  const openReviewModal = (supplierId: string, eventId: string) => {
    setReviewForm(prev => ({
      ...prev,
      supplierId,
      eventId
    }));
    setSelectedSupplier(supplierId);
    setShowReviewModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Avaliar Fornecedores</h1>
          <p className="text-gray-600 mt-2">
            Avalie os fornecedores que prestaram serviços para seus eventos
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Serviços Contratados</p>
                <p className="text-2xl font-bold text-gray-900">{suppliersToReview.length}</p>
              </div>
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avaliações Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {suppliersToReview.filter(s => !s.hasReview).length}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Já Avaliados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {suppliersToReview.filter(s => s.hasReview).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Suppliers to Review */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Fornecedores para Avaliar</h2>
          
          {suppliersToReview.length > 0 ? (
            <div className="space-y-6">
              {suppliersToReview.map((supplier) => (
                <div key={supplier.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={supplier.avatar || ''}
                        alt={supplier.companyName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{supplier.companyName}</h3>
                        <p className="text-gray-600">{supplier.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex flex-wrap gap-2">
                            {supplier.services.slice(0, 3).map((service, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {supplier.hasReview ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 text-yellow-400"
                                fill="currentColor"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-green-600 font-medium">Avaliado</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => openReviewModal(supplier.id, supplier.eventId)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Avaliar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum fornecedor para avaliar
              </h3>
              <p className="text-gray-600">
                Quando você contratar fornecedores, eles aparecerão aqui para avaliação
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Avaliar Fornecedor</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-6">
                {/* Supplier Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={mockCompletedServices.find(s => s.supplierId === selectedSupplier)?.supplierAvatar || ''}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {mockCompletedServices.find(s => s.supplierId === selectedSupplier)?.supplierName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {mockCompletedServices.find(s => s.supplierId === selectedSupplier)?.services.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Avaliação Geral
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= reviewForm.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-300'
                          }`}
                          fill="currentColor"
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-sm text-gray-600">
                      {reviewForm.rating > 0 && (
                        <>
                          {reviewForm.rating} de 5 estrelas
                          {reviewForm.rating === 5 && ' - Excelente!'}
                          {reviewForm.rating === 4 && ' - Muito bom!'}
                          {reviewForm.rating === 3 && ' - Bom'}
                          {reviewForm.rating === 2 && ' - Regular'}
                          {reviewForm.rating === 1 && ' - Ruim'}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentário sobre o serviço
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    placeholder="Conte como foi sua experiência com este fornecedor. Sua avaliação ajuda outros organizadores a tomar melhores decisões..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Quick Rating Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Avaliação por Categoria
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Qualidade</p>
                      <div className="flex justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4 text-yellow-400"
                            fill="currentColor"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Pontualidade</p>
                      <div className="flex justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4 text-yellow-400"
                            fill="currentColor"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Atendimento</p>
                      <div className="flex justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4 text-yellow-400"
                            fill="currentColor"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={reviewForm.rating === 0}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar Avaliação
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