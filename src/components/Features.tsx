import { Search, Star, ArrowRight, FileText, Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { userService } from '../services/userService';
import { eventService } from '../services/eventService';

const features = [
  {
    icon: Search,
    title: 'Busca Inteligente',
    description: 'Filtre por categoria, localização, avaliação e faixa de preço para encontrar o fornecedor ideal.'
  },
  {
    icon: FileText,
    title: 'Solicitação de Orçamentos',
    description: 'Envie pedidos de orçamento para múltiplos fornecedores e compare propostas facilmente.'
  },
  {
    icon: Star,
    title: 'Sistema de Avaliações',
    description: 'Leia experiências reais de outros organizadores e tome decisões informadas.'
  },
  {
    icon: Calendar,
    title: 'Gestão de Eventos',
    description: 'Organize todos os detalhes do seu evento em um só lugar, do planejamento à conclusão.'
  }
];

const steps = [
  {
    number: '1',
    title: 'Cadastre-se',
    description: 'Crie sua conta em menos de 2 minutos.'
  },
  {
    number: '2',
    title: 'Explore',
    description: 'Navegue pelos perfis e compare serviços e preços.'
  },
  {
    number: '3',
    title: 'Contrate',
    description: 'Entre em contato e feche negócio com total segurança.'
  }
];

export function Features() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    suppliers: 0,
    events: 0,
    averageRating: 0,
    satisfaction: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoadingStats(true);

      const suppliersData = await userService.getSuppliers();
      const totalSuppliers = suppliersData.length;

      const totalReviews = suppliersData.reduce(
        (acc: number, s: any) => acc + (s.reviewCount || 0), 0
      );

      let totalRatingSum = 0;
      let totalWeightedReviews = 0;

      suppliersData.forEach((s: any) => {
        if (s.rating && s.reviewCount) {
          totalRatingSum += s.rating * s.reviewCount;
          totalWeightedReviews += s.reviewCount;
        }
      });

      const averageRating = totalWeightedReviews > 0
        ? totalRatingSum / totalWeightedReviews
        : 0;

      let satisfaction = 0;
      if (averageRating >= 4.5) {
        satisfaction = 95;
      } else if (averageRating >= 4) {
        satisfaction = 90;
      } else if (averageRating >= 3.5) {
        satisfaction = 80;
      } else if (averageRating >= 3) {
        satisfaction = 70;
      } else {
        satisfaction = Math.round((averageRating / 5) * 100);
      }

      const estimatedEvents = Math.round(totalReviews / 4);

      setStats({
        suppliers: totalSuppliers,
        events: estimatedEvents,
        averageRating: Number(averageRating.toFixed(1)),
        satisfaction: satisfaction
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const StatItem = ({
    value,
    label,
    suffix = '',
    prefix = ''
  }: {
    value: number | string;
    label: string;
    suffix?: string;
    prefix?: string;
  }) => (
    <div className="relative group">
      <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative">
        <div className="text-4xl md:text-5xl font-bold mb-2">
          {loadingStats ? (
            <div className="h-12 w-24 bg-white/20 rounded-lg animate-pulse mx-auto"></div>
          ) : (
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              {prefix}{value}{suffix}
            </span>
          )}
        </div>
        <div className="text-blue-200 font-medium">{label}</div>
      </div>
    </div>
  );

  return (
    <>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Como funciona?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Em 3 passos simples você encontra e contrata os melhores profissionais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto px-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5">
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-800 opacity-30"></div>
                  </div>
                )}

                <div className="relative text-center group">

                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-800 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-800 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      {step.number}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Por que usar o ConectEvento?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A plataforma mais completa para organizar seu evento com tranquilidade
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">

        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem
              value={stats.suppliers}
              label="Fornecedores Cadastrados"
              suffix="+"
            />
            <StatItem
              value={stats.events}
              label="Eventos Realizados"
              suffix="+"
            />
            <StatItem
              value={stats.averageRating || '0.0'}
              label="Avaliação Média"
              suffix="/5"
            />
            <StatItem
              value={stats.satisfaction}
              label="Taxa de Satisfação"
              suffix="%"
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </section>

      <section className="py-20 bg-white text-gray-900 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para organizar seu evento perfeito?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Cadastre-se e comece a explorar centenas de fornecedores verificados
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 px-8 py-3 rounded-lg font-bold inline-flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Criar Conta
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/suppliers')}
              className="bg-gray-100 text-gray-900 hover:bg-gray-200 px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2 transition-all border-2 border-gray-200 hover:border-gray-300"
            >
              Explorar Fornecedores
            </button>
          </div>
        </div>
      </section>
    </>
  );
}