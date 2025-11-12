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
  Mail,
  DollarSign,
  Tag,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { uploadService, UploadedImage } from '../services/uploadService';
import { message, Spin } from 'antd';
import { CityAutocomplete } from '../components/CityAutocomplete';

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

  // Função para aplicar máscara de CPF/CNPJ
  const formatCnpjCpf = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');

    // CPF: 000.000.000-00
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }

    // CNPJ: 00.000.000/0000-00
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCnpjCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCnpjCpf(e.target.value);
    setProfileData(prev => ({ ...prev, cnpjOrCpf: formatted }));
  };

  const validateCnpjCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');

    // Se está vazio, é válido (campo opcional)
    if (numbers.length === 0) return true;

    // Se tem até 11 dígitos, valida como CPF (mínimo 11)
    if (numbers.length <= 11) {
      return numbers.length === 11;
    }

    // Se tem mais de 11 dígitos, valida como CNPJ (deve ter 14)
    return numbers.length === 14;
  };

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
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id, loadUserData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    // Validação do CNPJ/CPF
    if (profileData.cnpjOrCpf && !validateCnpjCpf(profileData.cnpjOrCpf)) {
      const numbers = profileData.cnpjOrCpf.replace(/\D/g, '');
      if (numbers.length > 0 && numbers.length < 11) {
        message.error('CPF deve ter 11 dígitos');
        return;
      }
      if (numbers.length > 11 && numbers.length < 14) {
        message.error('CNPJ deve ter 14 dígitos');
        return;
      }
    }

    console.log("profileData", profileData)

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
        cnpjOrCpf: profileData.cnpjOrCpf,
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

    const maxSize = 5 * 1024 * 1024;
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
      setPortfolioImages(prev => prev.filter(img => img.id !== imageId));
      message.success('Imagem removida');
    } catch (error) {
      console.error('Error removing image:', error);
      message.error('Erro ao remover imagem');
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/supplier-dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar ao Dashboard</span>
          </button>

          <h1 className="text-4xl font-bold leading-tight bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            Editar Perfil
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Mantenha suas informações atualizadas para atrair mais clientes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <span>Informações Básicas</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={profileData.companyName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Nome da sua empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  CNPJ/CPF
                </label>
                <input
                  type="text"
                  value={profileData.cnpjOrCpf}
                  onChange={handleCnpjCpfChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${profileData.cnpjOrCpf && !validateCnpjCpf(profileData.cnpjOrCpf)
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                    }`}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  maxLength={18}
                />
                {profileData.cnpjOrCpf && !validateCnpjCpf(profileData.cnpjOrCpf) && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>
                      {profileData.cnpjOrCpf.replace(/\D/g, '').length <= 11
                        ? 'CPF deve ter 11 dígitos'
                        : 'CNPJ deve ter 14 dígitos'}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>

              <CityAutocomplete
                value={profileData.location}
                onChange={(city) => setProfileData(prev => ({ ...prev, location: city }))}
                required
                placeholder="Cidade, Estado"
                label="Localização"
              />

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Faixa de Preço *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={profileData.priceRange}
                    onChange={(e) => setProfileData(prev => ({ ...prev, priceRange: e.target.value as 'BUDGET' | 'MID' | 'PREMIUM' }))}
                    required
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="BUDGET">Econômico</option>
                    <option value="MID">Intermediário</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Descrição da Empresa *
              </label>
              <textarea
                value={profileData.description}
                onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Descreva sua empresa, experiência, diferenciais e especialidades..."
              />
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  id="availability"
                  checked={profileData.availability}
                  onChange={(e) => setProfileData(prev => ({ ...prev, availability: e.target.checked }))}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-5 h-5 ${profileData.availability ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-bold text-gray-700">
                    Disponível para novos projetos
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
              <span>Serviços Oferecidos</span>
            </h2>

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                  placeholder="Digite o nome do serviço"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={addService}
                  disabled={!newService.trim()}
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {profileData.services.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileData.services.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                  >
                    <span className="text-sm font-semibold">{service}</span>
                    <button
                      type="button"
                      onClick={() => removeService(service)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Nenhum serviço adicionado ainda</p>
                <p className="text-sm text-gray-500">Digite um serviço e clique em + para adicionar</p>
              </div>
            )}
          </div>

          {/* Portfolio */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-emerald-600" />
              </div>
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
                className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                <span className="text-gray-600 font-semibold group-hover:text-blue-600 transition-colors">
                  {uploadingImage ? 'Enviando...' : 'Adicionar Imagem ao Portfólio'}
                </span>
              </button>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span>💡</span>
                <span>Máximo de 15 imagens. Formatos aceitos: JPG, PNG (até 5MB cada)</span>
              </p>
            </div>

            {portfolioImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolioImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={uploadService.getImageUrl(image.id)}
                      alt={image.fileName}
                      className="w-full h-32 object-cover rounded-xl border-2 border-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => removePortfolioImage(image.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-semibold mb-1">Nenhuma imagem no portfólio</p>
                <p className="text-sm text-gray-500">Adicione fotos dos seus trabalhos para atrair mais clientes</p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/supplier-dashboard')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
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
