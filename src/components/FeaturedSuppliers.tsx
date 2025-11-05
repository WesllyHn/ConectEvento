import React from 'react';
import { Star, MapPin, ArrowRight, Lock } from 'lucide-react';
import { mockSuppliers } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function FeaturedSuppliers() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const featuredSuppliers = mockSuppliers.slice(0, 3);

  const handleSupplierClick = (supplierId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/supplier/${supplierId}`);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Fornecedores em Destaque
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Profissionais com as melhores avaliações e maior experiência no mercado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {featuredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              onClick={() => handleSupplierClick(supplier.id)}
            >
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={supplier.avatar || ''}
                    alt={supplier.companyName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{supplier.companyName}</h3>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{supplier.location}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{supplier.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {supplier.services.slice(0, 3).map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                    <span className="font-semibold text-gray-900">{supplier.rating}</span>
                    <span className="text-sm text-gray-600">({supplier.reviewCount} avaliações)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      supplier.priceRange === 'budget' ? 'bg-green-100 text-green-700' :
                      supplier.priceRange === 'mid' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {supplier.priceRange === 'budget' ? 'Econômico' :
                       supplier.priceRange === 'mid' ? 'Intermediário' : 'Premium'}
                    </span>
                    {!isAuthenticated && (
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Lock className="w-4 h-4" />
                        <span className="text-xs">Login</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-4 border-t border-gray-100">
                {supplier.portfolio.slice(0, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt="Portfolio"
                    className="w-full h-20 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/suppliers')}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <span>Ver Todos os Fornecedores</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}