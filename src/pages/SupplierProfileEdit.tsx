import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Mail,
  DollarSign,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { uploadService, UploadedImage } from '../services/uploadService';
import { message, Spin } from 'antd';

export function SupplierProfileEdit() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: '',
    companyName: '',
    description: '',
    location: '',
    email: '',
    priceRange: 'MID' as 'BUDGET' | 'MID' | 'PREMIUM',
    services: [] as string[],
    availability: true,
    cnpjOrCpf: ''
  });

  const [newService, setNewService] = useState('');
  const [portfolioImages, setPortfolioImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadUserData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const userData = await userService.getUserById(user.id);

      setProfileData({
        name: userData.name || '',
        companyName: userData.companyName || '',
        description: userData.description || '',
        location: userData.location || '',
        email: userData.email || '',
        priceRange: userData.priceRange || 'MID',
        services: userData.services?.map((s: any) => s.service) || [],
        availability: userData.availability ?? true,
        cnpjOrCpf: userData.cnpjOrCpf || ''
      });

      const images = await uploadService.getSupplierImages(user.id);
      setPortfolioImages(images);
    } catch (error) {
      console.error('Error loading user data:', error);
      message.error('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Apenas user?.id, não inclua serviços

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id, loadUserData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);

    try {
      const updateData = {
        name: profileData.name,
        companyName: profileData.companyName,
        description: profileData.description,
        location: profileData.location,
        priceRange: profileData.priceRange,
        availability: profileData.availability,
        services: profileData.services.map(service => ({ service })),
        cnpjOrCpf: profileData.cnpjOrCpf
      };

      await userService.updateUser(user.id, updateData);
      message.success('Perfil atualizado com sucesso!');
      navigate('/supplier-dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
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

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user?.id) return;

    const file = files[0];

    // Validações
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      message.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      message.error('Formato não aceito. Use JPG ou PNG.');
      return;
    }

    if (portfolioImages.length >= 15) {
      message.error('Máximo de 15 imagens no portfólio.');
      return;
    }

    try {
      setUploadingImage(true);
      const uploadedImage = await uploadService.uploadImageBase64(user.id, file);

      setPortfolioImages(prev => [...prev, uploadedImage]);
      message.success('Imagem adicionada com sucesso!');

      // Limpa o input para permitir upload do mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const removePortfolioImage = async (imageId: string) => {
    try {
      // Aqui você pode adicionar uma chamada para deletar a imagem do backend
      // await uploadService.deleteImage(imageId);

      setPortfolioImages(prev => prev.filter(img => img.id !== imageId));
      message.success('Imagem removida');
    } catch (error) {
      console.error('Error removing image:', error);
      message.error('Erro ao remover imagem');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  CNPJ/CPF
                </label>
                <input
                  type="text"
                  value={profileData.cnpjOrCpf}
                  onChange={(e) => setProfileData(prev => ({ ...prev, cnpjOrCpf: e.target.value }))}
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
                    onChange={(e) => setProfileData(prev => ({ ...prev, priceRange: e.target.value as 'BUDGET' | 'MID' | 'PREMIUM' }))}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="BUDGET">Econômico</option>
                    <option value="MID">Intermediário</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>
              </div>
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
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Digite o nome do serviço"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addService}
                  disabled={!newService.trim()}
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mb-4">
              <button
                type="button"
                onClick={handleFileSelect}
                disabled={uploadingImage || portfolioImages.length >= 15}
                className="flex items-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">
                  {uploadingImage ? 'Enviando...' : 'Adicionar Imagem ao Portfólio'}
                </span>
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Máximo de 15 imagens. Formatos aceitos: JPG, PNG (até 5MB cada)
              </p>
            </div>

            {portfolioImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolioImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={uploadService.getImageUrl(image.id)}
                      alt={image.fileName}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePortfolioImage(image.id)}
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