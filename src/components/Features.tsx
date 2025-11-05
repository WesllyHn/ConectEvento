import React from 'react';
import { Search, Shield, Star, MessageCircle } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Busca Inteligente',
    description: 'Encontre fornecedores por tipo de serviço, localização e orçamento com nossa busca avançada.'
  },
  {
    icon: Shield,
    title: 'Fornecedores Verificados',
    description: 'Todos os fornecedores passam por um processo de verificação para garantir qualidade e confiabilidade.'
  },
  {
    icon: Star,
    title: 'Avaliações Reais',
    description: 'Veja avaliações e comentários de clientes reais para tomar a melhor decisão.'
  },
  {
    icon: MessageCircle,
    title: 'Comunicação Direta',
    description: 'Converse diretamente com os fornecedores e receba orçamentos personalizados rapidamente.'
  }
];

export function Features() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Por que escolher o ConectEvento?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Uma plataforma completa para tornar a organização do seu evento mais fácil e eficiente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full mb-4 group-hover:shadow-lg transition-shadow">
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}