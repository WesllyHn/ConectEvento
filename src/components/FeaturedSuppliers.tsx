import React, { useEffect, useState, useCallback } from 'react';
import { Star, MapPin, ArrowRight, Award, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { uploadService } from '../services/uploadService';

type AvatarType = string | Uint8Array | null;

interface Supplier {
  id: string;
  name: string;
  companyName: string | null;
  avatar: AvatarType;
  description: string | null;
  location: string | null;
  rating: number;
  reviewCount: number;
  priceRange: string;
  createdAt: string;
  services: Array<{ service: string }>;
  portfolio: Array<{
    id: string;
    imageData: string | Uint8Array | number[];
    mimeType: string;
  }>;
  portfolioImages?: string[];
  availability: boolean
}

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
    <div className="h-48 bg-gray-200 animate-pulse" />
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-6 w-24 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
);

const getPriceRangeConfig = (priceRange: string) => {
  const configs: Record<string, { label: string; gradient: string }> = {
    BUDGET: {
      label: 'Econômico',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    MID: {
      label: 'Intermediário',
      gradient: 'from-amber-500 to-amber-600'
    },
    PREMIUM: {
      label: 'Premium',
      gradient: 'from-purple-500 to-purple-600'
    }
  };
  return configs[priceRange] || configs.BUDGET;
};

interface AvatarDisplayProps {
  portfolioImages?: string[];
  avatar: AvatarType;
  supplierName: string;
  firstLetter: string;
  getAvatarUrl: (avatar: AvatarType) => string | null;
}

const AvatarDisplay = ({ portfolioImages, avatar, supplierName, firstLetter, getAvatarUrl }: AvatarDisplayProps) => {
  if (portfolioImages && portfolioImages.length > 0) {
    return (
      <img
        src={portfolioImages[0]}
        alt={supplierName}
        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 shadow-md"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = 'none';
          const placeholder = document.createElement('div');
          placeholder.className = 'w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center ring-2 ring-gray-100 shadow-md flex-shrink-0';
          placeholder.innerHTML = `<span class="text-lg font-bold text-white">${firstLetter}</span>`;
          target.parentElement!.insertBefore(placeholder, target);
        }}
      />
    );
  }

  const avatarUrl = getAvatarUrl(avatar);
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={supplierName}
        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 shadow-md"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = 'none';
          const placeholder = document.createElement('div');
          placeholder.className = 'w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center ring-2 ring-gray-100 shadow-md flex-shrink-0';
          placeholder.innerHTML = `<span class="text-lg font-bold text-white">${firstLetter}</span>`;
          target.parentElement!.insertBefore(placeholder, target);
        }}
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center ring-2 ring-gray-100 shadow-md flex-shrink-0">
      <span className="text-lg font-bold text-white">{firstLetter}</span>
    </div>
  );
};

interface SupplierCardProps {
  supplier: Supplier;
  currentImageIndex: Record<string, number>;
  onSupplierClick: (supplierId: string) => void;
  onPrevImage: (supplierId: string, portfolioLength: number, e: React.MouseEvent) => void;
  onNextImage: (supplierId: string, portfolioLength: number, e: React.MouseEvent) => void;
  onImageIndexChange: (supplierId: string, index: number) => void;
  getAvatarUrl: (avatar: AvatarType) => string | null;
}

const SupplierCard = ({
  supplier,
  currentImageIndex,
  onSupplierClick,
  onPrevImage,
  onNextImage,
  onImageIndexChange,
  getAvatarUrl
}: SupplierCardProps) => {
  const priceConfig = getPriceRangeConfig(supplier.priceRange);
  const supplierName = supplier.companyName || supplier.name;
  const firstLetter = supplierName.charAt(0).toUpperCase();
  const currentIndex = currentImageIndex[supplier.id] || 0;

  return (
    <div
      className="group cursor-pointer"
      onClick={() => onSupplierClick(supplier.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSupplierClick(supplier.id);
        }
      }}
      aria-label={`Ver perfil de ${supplierName}`}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-700">
          {supplier.portfolioImages && supplier.portfolioImages.length > 0 ? (
            <>
              <img
                src={supplier.portfolioImages[currentIndex]}
                alt={`Portfolio ${currentIndex + 1} de ${supplierName}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const placeholder = document.createElement('div');
                  placeholder.className = 'w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center';
                  placeholder.innerHTML = `<span class="text-7xl font-bold text-white">${firstLetter}</span>`;
                  target.parentElement!.appendChild(placeholder);
                }}
              />

              {supplier.portfolioImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => onPrevImage(supplier.id, supplier.portfolioImages!.length, e)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-800" />
                  </button>
                  <button
                    onClick={(e) => onNextImage(supplier.id, supplier.portfolioImages!.length, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-800" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {supplier.portfolioImages.map((imageUrl, index) => (
                      <button
                        key={`${supplier.id}-image-${imageUrl}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageIndexChange(supplier.id, index);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                            ? 'bg-white w-6'
                            : 'bg-white/60 hover:bg-white/80'
                          }`}
                        aria-label={`Ir para imagem ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-7xl font-bold text-white">{firstLetter}</span>
            </div>
          )}

          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white shadow-lg">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-bold text-gray-900">
                {supplier.rating ? supplier.rating.toFixed(1) : '0.0'}
              </span>
            </div>
          </div>

          <div className="absolute bottom-3 right-3">
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${priceConfig.gradient}`}>
              {priceConfig.label}
            </div>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <AvatarDisplay
                portfolioImages={supplier.portfolioImages}
                avatar={supplier.avatar}
                supplierName={supplierName}
                firstLetter={firstLetter}
                getAvatarUrl={getAvatarUrl}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {supplierName}
                </h3>
                {supplier.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-600" />
                    <span className="truncate">{supplier.location}</span>
                  </div>
                )}
              </div>
            </div>

            {supplier.description && (
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                {supplier.description}
              </p>
            )}

            {supplier.services && supplier.services.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {supplier.services.slice(0, 2).map((serviceObj) => (
                  <span
                    key={`${supplier.id}-service-${serviceObj.service}`}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full"
                  >
                    {serviceObj.service}
                  </span>
                ))}
                {supplier.services.length > 2 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                    +{supplier.services.length - 2} mais
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {supplier.reviewCount || 0} {supplier.reviewCount === 1 ? 'avaliação' : 'avaliações'}
              </span>
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                <span>Ver perfil</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function FeaturedSuppliers() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});

  console.log("suppliers", suppliers)
  useEffect(() => {
    loadFeaturedSuppliers();
  }, []);

  const loadFeaturedSuppliers = useCallback(async (currentRetry = 0) => {
    try {
      setLoading(true);
      setError(null);

      const data = await userService.getSuppliers();

      const suppliersWithImages = data.map((supplier: Supplier) => {
        const portfolioImages: string[] = [];

        if (supplier.portfolio && supplier.portfolio.length > 0) {
          supplier.portfolio.forEach((image) => {
            const imageUrl = uploadService.getImageUrl(image.id);
            if (imageUrl) {
              portfolioImages.push(imageUrl);
            }
          });
        }

        return {
          ...supplier,
          portfolioImages
        };
      });

      const topSuppliers = suppliersWithImages
        .filter((s: Supplier) => s.rating !== null && s.rating >= 0)
        .sort((a: Supplier, b: Supplier) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3);

      setSuppliers(topSuppliers);

      const initialIndices: Record<string, number> = {};
      topSuppliers.forEach((supplier: Supplier) => {
        initialIndices[supplier.id] = 0;
      });
      setCurrentImageIndex(initialIndices);

      setRetryCount(0);
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err);

      if (currentRetry < 3) {
        const delay = 1000 * Math.pow(2, currentRetry);
        setTimeout(() => {
          setRetryCount(currentRetry + 1);
          loadFeaturedSuppliers(currentRetry + 1);
        }, delay);
      } else {
        setError('Não foi possível carregar os fornecedores em destaque.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSupplierClick = useCallback((supplierId: string) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/supplier/${supplierId}` } });
      return;
    }
    navigate(`/supplier/${supplierId}`);
  }, [isAuthenticated, navigate]);

  const getAvatarUrl = useCallback((avatar: AvatarType) => {
    if (!avatar) return null;

    try {
      if (typeof avatar === 'string' && avatar.startsWith('http')) {
        return avatar;
      }

      if (avatar instanceof Uint8Array || Array.isArray(avatar)) {
        const base64 = btoa(
          Array.from(avatar as Uint8Array)
            .map(byte => String.fromCharCode(byte))
            .join('')
        );
        return `data:image/jpeg;base64,${base64}`;
      }

      if (typeof avatar === 'string') {
        return `data:image/jpeg;base64,${avatar}`;
      }
    } catch (error) {
      console.error('Erro ao processar avatar:', error);
    }

    return null;
  }, []);

  const handlePrevImage = useCallback((supplierId: string, portfolioLength: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [supplierId]: prev[supplierId] === 0 ? portfolioLength - 1 : prev[supplierId] - 1
    }));
  }, []);

  const handleNextImage = useCallback((supplierId: string, portfolioLength: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [supplierId]: prev[supplierId] === portfolioLength - 1 ? 0 : prev[supplierId] + 1
    }));
  }, []);

  const handleImageIndexChange = useCallback((supplierId: string, index: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [supplierId]: index
    }));
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 w-48 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-10 w-96 max-w-full bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-full max-w-2xl bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          {retryCount > 0 && (
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                Tentando reconectar... (tentativa {retryCount}/3)
              </p>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <RefreshCw className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ops! Algo deu errado
            </h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => loadFeaturedSuppliers(0)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (suppliers.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum fornecedor em destaque
            </h3>
            <p className="text-gray-600">
              Aguarde novos fornecedores cadastrados na plataforma.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Destaques do ConectEvento
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Profissionais em Destaque
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conheça os fornecedores mais bem avaliados e contratados da plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              currentImageIndex={currentImageIndex}
              onSupplierClick={handleSupplierClick}
              onPrevImage={handlePrevImage}
              onNextImage={handleNextImage}
              onImageIndexChange={handleImageIndexChange}
              getAvatarUrl={getAvatarUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}