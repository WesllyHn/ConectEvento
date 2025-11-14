import { useState, useEffect } from 'react';
import { Star, MapPin, ArrowLeft } from 'lucide-react';
import { Row, Col, Empty, Spin, message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { uploadService } from '../services/uploadService';
import { SearchFilters } from '../components/Common';

interface SupplierWithImage {
  id: string;
  name: string;
  companyName: string;
  description: string;
  rating: number;
  reviewCount: number;
  location: string;
  services: Array<{ service: string }>;
  priceRange: string;
  availability: boolean;
  portfolio: Array<{ id: string }>;
  portfolioImageUrl?: string;
}

export function Suppliers() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [serviceFilter, setServiceFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [suppliers, setSuppliers] = useState<SupplierWithImage[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<SupplierWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await userService.getSuppliers();
      
      const suppliersWithImages = data.map((supplier: any) => {
        let portfolioImageUrl = null;
        
        if (supplier.portfolio && supplier.portfolio.length > 0) {
          const firstImageId = supplier.portfolio[0].id;
          portfolioImageUrl = uploadService.getImageUrl(firstImageId);
        }
        
        return {
          ...supplier,
          portfolioImageUrl
        };
      });
      
      setSuppliers(suppliersWithImages);
      setFilteredSuppliers(suppliersWithImages);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      message.error('Erro ao carregar fornecedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = suppliers;

    if (searchQuery) {
      filtered = filtered.filter(supplier => {
        const services = supplier.services?.map((s: any) => s.service) || [];
        return (
          supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          supplier.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          services.some((service: string) =>
            service.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      });
    }

    if (location) {
      filtered = filtered.filter(supplier =>
        supplier.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (serviceFilter) {
      filtered = filtered.filter(supplier => {
        const services = supplier.services?.map((s: any) => s.service) || [];
        return services.includes(serviceFilter);
      });
    }

    if (priceFilter) {
      filtered = filtered.filter(supplier => supplier.priceRange === priceFilter);
    }

    setFilteredSuppliers(filtered);
  }, [searchQuery, location, serviceFilter, priceFilter, suppliers]);

  const handleSupplierClick = (supplierId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/supplier/${supplierId}`);
  };

  const uniqueServices = Array.from(
    new Set(suppliers.flatMap(s => s.services?.map((srv: any) => srv.service) || []))
  );

  const getPriceRangeConfig = (priceRange: string) => {
    const configs: Record<string, { label: string; color: string; gradient: string }> = {
      BUDGET: { 
        label: 'Econômico', 
        color: 'emerald',
        gradient: 'from-emerald-500 to-emerald-600'
      },
      MID: { 
        label: 'Intermediário', 
        color: 'amber',
        gradient: 'from-amber-500 to-amber-600'
      },
      PREMIUM: { 
        label: 'Premium', 
        color: 'purple',
        gradient: 'from-purple-500 to-purple-600'
      }
    };
    return configs[priceRange] || configs.BUDGET;
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
        {/* Header */}
        <div className="mb-8">
          {user && <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar ao Dashboard</span>
          </button>}
          
          <h1 className="text-4xl font-bold leading-tight bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-2">
            Fornecedores
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Encontre os melhores fornecedores para seu evento
          </p>

          <SearchFilters
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            locationValue={location}
            onLocationChange={setLocation}
            filters={[
              {
                value: serviceFilter,
                onChange: setServiceFilter,
                placeholder: 'Todos os serviços',
                options: [
                  { label: 'Todos os serviços', value: '' },
                  ...uniqueServices.map(service => ({ label: service, value: service }))
                ]
              },
              {
                value: priceFilter,
                onChange: setPriceFilter,
                placeholder: 'Qualquer preço',
                options: [
                  { label: 'Qualquer preço', value: '' },
                  { label: 'Econômico', value: 'BUDGET' },
                  { label: 'Intermediário', value: 'MID' },
                  { label: 'Premium', value: 'PREMIUM' }
                ]
              }
            ]}
          />
        </div>

        {/* Contador de Resultados */}
        {filteredSuppliers.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              <span className="font-bold text-blue-600">{filteredSuppliers.length}</span> 
              {filteredSuppliers.length === 1 ? ' fornecedor encontrado' : ' fornecedores encontrados'}
            </p>
          </div>
        )}

        {filteredSuppliers.length > 0 ? (
          <Row gutter={[24, 24]}>
            {filteredSuppliers.map((supplier) => {
              const priceConfig = getPriceRangeConfig(supplier.priceRange);
              
              return (
                <Col xs={24} sm={12} lg={8} key={supplier.id}>
                  <div
                    onClick={() => handleSupplierClick(supplier.id)}
                    className="group cursor-pointer h-full"
                  >
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                      {/* Imagem de Capa */}
                      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700">
                        {supplier.portfolioImageUrl ? (
                          <img
                            src={supplier.portfolioImageUrl}
                            alt={supplier.companyName}
                            className="w-full h-full object-cover transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const name = supplier.companyName || supplier.name;
                              const firstLetter = name.charAt(0).toUpperCase();
                              const placeholder = document.createElement('div');
                              placeholder.className = 'w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center';
                              placeholder.innerHTML = `<span class="text-7xl font-bold text-white">${firstLetter}</span>`;
                              target.parentElement!.appendChild(placeholder);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                            <span className="text-7xl font-bold text-white">
                              {(supplier.companyName || supplier.name).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        {/* Badge de Disponibilidade */}
                        <div className="absolute top-3 right-3">
                          <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                            supplier.availability 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {supplier.availability ? '✓ Disponível' : '✕ Indisponível'}
                          </div>
                        </div>

                        {/* Badge de Preço */}
                        <div className="absolute bottom-3 left-3">
                          <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${priceConfig.gradient}`}>
                            {priceConfig.label}
                          </div>
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex-1 space-y-3">
                          {/* Nome */}
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {supplier.companyName || supplier.name}
                          </h3>

                          {/* Descrição */}
                          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                            {supplier.description || 'Descrição não preenchida'}
                          </p>

                          {/* Rating */}
                          <div className="flex items-center gap-2 py-2">
                            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <span className="font-bold text-gray-900">{supplier.rating || 0}</span>
                            </div>
                            <span className="text-gray-500 text-sm">
                              ({supplier.reviewCount || 0} {supplier.reviewCount === 1 ? 'avaliação' : 'avaliações'})
                            </span>
                          </div>

                          {/* Localização */}
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">{supplier.location}</span>
                          </div>

                          {/* Serviços */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {(supplier.services || []).slice(0, 3).map((service: any) => (
                              <span 
                                key={`${supplier.id}-${service.service}`}
                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold"
                              >
                                {service.service}
                              </span>
                            ))}
                            {(supplier.services || []).length > 3 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                                +{supplier.services.length - 3} mais
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Footer - Ver Perfil */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="text-center">
                            <span className="text-blue-600 font-semibold text-sm group-hover:text-blue-700 transition-colors">
                              Ver perfil completo →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="space-y-2">
                  <p className="text-gray-600 font-medium">Nenhum fornecedor encontrado</p>
                  <p className="text-gray-500 text-sm">
                    Tente ajustar os filtros ou fazer uma nova busca
                  </p>
                </div>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
