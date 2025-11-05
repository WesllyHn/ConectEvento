
export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold">ConectEvento</span>
            </div>
            <p className="text-gray-300 mb-4">
              Conectando organizadores de eventos aos melhores fornecedores do Brasil. 
              Sua festa perfeita está a um clique de distância.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Para Organizadores</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Encontrar Fornecedores</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Solicitar Orçamentos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Avaliar Serviços</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Para Fornecedores</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Cadastrar Empresa</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gerenciar Perfil</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Receber Solicitações</a></li>
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