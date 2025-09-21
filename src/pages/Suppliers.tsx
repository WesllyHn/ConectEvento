import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Users, Lock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockSuppliers } from '../data/mockData';


export function Suppliers() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [serviceFilter, setServiceFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState(mockSuppliers);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let filtered = mockSuppliers;

    if (searchQuery) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.services.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (location) {
      filtered = filtered.filter(supplier =>
        supplier.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (serviceFilter) {
      filtered = filtered.filter(supplier =>
        supplier.services.includes(serviceFilter)
      );
    }

    if (priceFilter) {
      // Filter by price range logic here
    }

    setFilteredSuppliers(filtered);
  }, [searchQuery, location, serviceFilter, priceFilter]);

  const handleSupplierClick = (supplierId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/supplier/${supplierId}`);
  };

  const uniqueServices = Array.from(new Set(mockSuppliers.flatMap(s => s.services)));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Fornecedores</h1>
          
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar fornecedores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Localização..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="select-small"
              >
                <option value="">Todos os serviços</option>
                {uniqueServices.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
              
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="select-small"
              >
                <option value="">Qualquer preço</option>
                <option value="budget">Econômico</option>
                <option value="mid">Intermediário</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              onClick={() => handleSupplierClick(supplier.id)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
            >
              {!user && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gray-900 bg-opacity-75 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <Lock className="w-3 h-3 mr-1" />
                    Login necessário
                  </div>
                </div>
              )}
              
              <img
                src={supplier.image}
                alt={supplier.name}
                className="w-full h-48 object-cover"
              />
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{supplier.name}</h3>
                <p className="text-gray-600 mb-3">{supplier.description}</p>
                
                <div className="flex items-center mb-3">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-700">{supplier.rating}</span>
                  <span className="ml-2 text-gray-500">({supplier.reviewCount} avaliações)</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{supplier.location}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {supplier.services.slice(0, 3).map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                  {supplier.services.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{supplier.services.length - 3} mais
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{supplier.completedEvents} eventos</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum fornecedor encontrado com os filtros aplicados.</p>
          </div>
        )}
      </div>
    </div>
  );
}