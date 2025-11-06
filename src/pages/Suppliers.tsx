import { useState, useEffect } from 'react';
import { Star, MapPin } from 'lucide-react';
import { Row, Col, Card, Tag, Empty, Spin, message } from 'antd';
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
      
      // Adicionar URL da primeira imagem do portfólio para cada fornecedor
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Fornecedores</h1>

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

        {filteredSuppliers.length > 0 ? (
          <Row gutter={[16, 16]}>
            {filteredSuppliers.map((supplier) => (
              <Col xs={24} sm={12} lg={8} key={supplier.id} className="flex">
                <Card
                  hoverable
                  onClick={() => handleSupplierClick(supplier.id)}
                  className="w-full flex flex-col"
                  cover={
                    supplier.portfolioImageUrl ? (
                      <img
                        src={supplier.portfolioImageUrl}
                        alt={supplier.companyName}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const name = supplier.companyName || supplier.name;
                          const firstLetter = name.charAt(0).toUpperCase();
                          const placeholder = document.createElement('div');
                          placeholder.className = 'w-full h-48 bg-blue-500 flex items-center justify-center';
                          placeholder.innerHTML = `<span class="text-6xl font-bold text-white">${firstLetter}</span>`;
                          target.parentElement!.appendChild(placeholder);
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      </div>
                    )
                  }
                  styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
                >
                  <div className="min-h-full flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-gray-900">{supplier.companyName || supplier.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{supplier.description}</p>

                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-medium">{supplier.rating || 0}</span>
                        <span className="text-gray-500 text-sm">({supplier.reviewCount || 0})</span>
                      </div>

                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{supplier.location}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(supplier.services || []).slice(0, 3).map((service: any, index: number) => (
                          <Tag key={index} color="blue">{service.service}</Tag>
                        ))}
                        {(supplier.services || []).length > 3 && (
                          <Tag>+{supplier.services.length - 3}</Tag>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Tag color={
                          supplier.priceRange === 'BUDGET' ? 'green' :
                          supplier.priceRange === 'MID' ? 'orange' : 'purple'
                        }>
                          {supplier.priceRange === 'BUDGET' ? 'Econômico' :
                          supplier.priceRange === 'MID' ? 'Intermediário' : 'Premium'}
                        </Tag>
                        <Tag color={supplier.availability ? 'success' : 'error'}>
                          {supplier.availability ? 'Disponível' : 'Indisponível'}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            description="Nenhum fornecedor encontrado"
            style={{ marginTop: 60 }}
          />
        )}
      </div>
    </div>
  );
}