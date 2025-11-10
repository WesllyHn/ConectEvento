import { Calendar } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Footer() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => handleNavigation('/')}>
              <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">ConectEvento</span>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Conectando organizadores de eventos aos melhores fornecedores do Brasil. 
              Sua festa perfeita está a um clique de distância.
            </p>
          </div>
          
          {isAuthenticated && user?.type === 'organizer' && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Para Organizadores</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <button 
                    onClick={() => handleNavigation('/suppliers')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Encontrar Fornecedores
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/dashboard')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Meus Eventos
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/reviews')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Avaliar Fornecedores
                  </button>
                </li>
              </ul>
            </div>
          )}
          
          {isAuthenticated && user?.type === 'supplier' && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Para Fornecedores</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <button 
                    onClick={() => handleNavigation('/supplier-dashboard')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Meu Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/supplier-profile-edit')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Gerenciar Perfil
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/reviews')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Minhas Avaliações
                  </button>
                </li>
              </ul>
            </div>
          )}

          {!isAuthenticated && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Plataforma</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <button 
                    onClick={() => handleNavigation('/login')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Entrar
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/register')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Cadastrar-se
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/suppliers')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Ver Fornecedores
                  </button>
                </li>
              </ul>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a 
                  href="mailto:contato@conectevento.com.br"
                  className="hover:text-white transition-colors"
                >
                  contato@conectevento.com.br
                </a>
              </li>
              <li>
                <a 
                  href="tel:+5547996381263"
                  className="hover:text-white transition-colors"
                >
                  (47) 99638-1263
                </a>
              </li>
              <li className="text-gray-400 text-sm pt-2">
                Segunda a Sexta<br />
                09:00 - 18:00
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2025 ConectEvento. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}