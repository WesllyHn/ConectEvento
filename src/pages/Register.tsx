import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, MapPin, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const [userType, setUserType] = useState<'organizer' | 'supplier'>('organizer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    location: '',
    cnpj: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        type: userType,
        companyName: formData.companyName,
        password: formData.password,
        location: formData.location
      });

      if (success) {
        await login(formData.email, formData.password, userType);
        navigate(userType === 'organizer' ? '/dashboard' : '/supplier-dashboard');
      }
    } catch {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      {/* Gradient blobs decorativos */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-4 border border-white/20">
            <Sparkles className="w-4 h-4" />
            Comece sua jornada
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Crie sua conta
          </h2>
          <p className="text-blue-100">
            Ou{' '}
            <Link to="/login" className="font-semibold text-yellow-300 hover:text-yellow-200 transition-colors">
              faça login se já tem uma conta
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs font-bold">!</span>
                </div>
                <span>{error}</span>
              </div>
            )}

            {/* Seletor de tipo de usuário */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Você é:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('organizer')}
                  className={`relative p-4 text-sm font-semibold rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                    userType === 'organizer'
                      ? 'border-blue-600 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {userType === 'organizer' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100"></div>
                  )}
                  <span className={`relative z-10 ${
                    userType === 'organizer' ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    Organizador
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('supplier')}
                  className={`relative p-4 text-sm font-semibold rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                    userType === 'supplier'
                      ? 'border-blue-600 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {userType === 'supplier' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100"></div>
                  )}
                  <span className={`relative z-10 ${
                    userType === 'supplier' ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    Fornecedor
                  </span>
                </button>
              </div>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {userType === 'supplier' ? 'Nome do Responsável' : 'Nome Completo'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            {/* Nome da Empresa (apenas para fornecedor) */}
            {userType === 'supplier' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome da Empresa
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nome da sua empresa"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Localização */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Localização
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Cidade, Estado"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Mínimo de 6 caracteres</p>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 group-hover:from-blue-700 group-hover:to-blue-900 transition-all duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar conta
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Links adicionais */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </div>

        {/* Informação extra */}
        <div className="mt-6 text-center">
          <p className="text-sm text-blue-100">
            Ao criar uma conta, você concorda com nossos termos de uso
          </p>
        </div>
      </div>
    </div>
  );
}