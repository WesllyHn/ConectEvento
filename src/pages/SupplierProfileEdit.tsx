import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Plus,
  Camera,
  Building,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  FileText,
  Tag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockSuppliers, serviceOptions } from '../data/mockData';

export function SupplierProfileEdit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const currentSupplier = mockSuppliers.find(s => s.id === user?.id);
  
  const [profileData, setProfileData] = useState({
    companyName: currentSupplier?.companyName || '',
    description: currentSupplier?.description || '',
    location: currentSupplier?.location || '',
    phone: '(11) 99999-9999',
    email: currentSupplier?.email || '',
    priceRange: currentSupplier?.priceRange || 'mid',
    services: currentSupplier?.services || [],
    availability: currentSupplier?.availability || true,
    cnpj: '',
    address: ''
  });

  const [newService, setNewService] = useState('');
  const [portfolioImages, setPortfolioImages] = useState(currentSupplier?.portfolio || []);
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Aqui seria enviado para a API
    console.log('Perfil atualizado:', profileData);
    
    setTimeout(() => {
      setIsLoading(false);
      navigate('/supplier-dashboard');
    }, 1000);
  };

  const addService = () => {
    if (newService && !profileData.services.includes(newService)) {
      setProfileData(prev => ({
        ...prev,
        services: [...prev.services, newService]
      }));
      setNewService('');
    }
  };

  const removeService = (serviceToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      services: prev.services.filter(service => service !== serviceToRemove)
    }));
  };

  const addPortfolioImage = () => {
    // Em produção, aqui seria feito upload da imagem
    const newImageUrl = 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg';
    setPortfolioImages(prev => [...prev, newImageUrl]);
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/supplier-dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Dashboard</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
          <p className="text-gray-600 mt-2">Mantenha suas informações atualizadas para atrair mais clientes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Building className="w-6 h-6 text-blue-600" />
              <span>Informações Básicas</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={profileData.companyName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome da sua empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={profileData.cnpj}
                  onChange={(e) => setProfileData(prev => ({ ...prev, cnpj: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localização *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cidade, Estado"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faixa de Preço *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={profileData.priceRange}
                    onChange={(e) => setProfileData(prev => ({ ...prev, priceRange: e.target.value as 'budget' | 'mid' | 'premium' }))}
                    required
                   className="select-custom w-full pl-10"
                  >
                    <option value="budget">Econômico</option>
                    <option value="mid">Intermediário</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço Completo
              </label>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Rua, número, bairro, CEP"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição da Empresa *
              </label>
              <textarea
                value={profileData.description}
                onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva sua empresa, experiência, diferenciais e especialidades..."
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="availability"
                  checked={profileData.availability}
                  onChange={(e) => setProfileData(prev => ({ ...prev, availability: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="availability" className="text-sm font-medium text-gray-700">
                  Disponível para novos projetos
                </label>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Tag className="w-6 h-6 text-blue-600" />
              <span>Serviços Oferecidos</span>
            </h2>

            <div className="mb-4">
              <div className="flex space-x-2">
                <select
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="select-custom flex-1"
                >
                  <option value="">Selecione um serviço</option>
                  {serviceOptions
                    .filter(service => !profileData.services.includes(service))
                    .map((service, index) => (
                      <option key={index} value={service}>{service}</option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={addService}
                  disabled={!newService}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {profileData.services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-full"
                >
                  <span className="text-sm font-medium">{service}</span>
                  <button
                    type="button"
                    onClick={() => removeService(service)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {profileData.services.length === 0 && (
              <p className="text-gray-500 text-sm">Nenhum serviço adicionado ainda</p>
            )}
          </div>

          {/* Portfolio */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Camera className="w-6 h-6 text-blue-600" />
              <span>Portfólio</span>
            </h2>

            <div className="mb-4">
              <button
                type="button"
                onClick={addPortfolioImage}
                className="flex items-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors w-full"
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Adicionar Imagem ao Portfólio</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Máximo de 15 imagens. Formatos aceitos: JPG, PNG (até 5MB cada)
              </p>
            </div>

            {portfolioImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolioImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePortfolioImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma imagem no portfólio</p>
                <p className="text-sm text-gray-500">Adicione fotos dos seus trabalhos para atrair mais clientes</p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/supplier-dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{isLoading ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}