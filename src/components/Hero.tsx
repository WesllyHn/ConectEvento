import React, { useState } from 'react';
import { Search, MapPin, DollarSign, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/suppliers?search=${searchQuery}&location=${location}&budget=${budget}`);
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
        <div className="relative w-full h-full" style={{
          clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)',
          filter: 'blur(0.5px)',
          transform: 'translateZ(0)',
        }}>
          <img
            src="https://www.sp.senac.br/documents/portlet_file_entry/51828463/dicas+para+um+evento+de+sucesso.webp/0453a6e1-5c79-ba90-d46d-009062d3ad4d?w=1200"
            alt="Evento"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-blue-900"></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6 border border-white/20">
            <Sparkles className="w-4 h-4" />
            Menos estresse, mais experiências incríveis
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
            Transforme seu evento em realidade com os{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
              melhores profissionais
            </span>
          </h1>

          <p className="text-xl text-blue-100 mb-8 max-w-xl">
            Conecte-se com fornecedores qualificados. Importe seus planos, compare orçamentos e tenha tudo organizado em um só lugar.
          </p>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buffet, DJ, decoração..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Sua cidade"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    title={budget ? `R$ ${budget.replace('-', ' - R$ ').replace('+', '+')}` : 'Selecione um orçamento'}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white cursor-pointer hover:border-gray-400 transition-colors truncate"
                  >
                    <option value="">Orçamento</option>
                    <option value="0-5000">Até R$ 5.000</option>
                    <option value="5000-15000">R$ 5.000 - R$ 15.000</option>
                    <option value="15000-30000">R$ 15.000 - R$ 30.000</option>
                    <option value="30000+">Acima de R$ 30.000</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Buscar Agora
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-6 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-yellow-300" />
              <span>Cadastro gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-yellow-300" />
              <span>Profissionais verificados</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-yellow-300" />
              <span>Compare orçamentos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}