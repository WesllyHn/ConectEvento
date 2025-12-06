import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, Menu, X, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Dropdown } from 'antd';
import logo3 from '../assets/logo3.png';
export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const userMenuItems = [
    {
      key: 'logout',
      label: (
        <div className="flex items-center space-x-2 text-red-600">
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </div>
      ),
      onClick: logout,
    },
  ];

  const navigationLinks = user?.type === 'organizer'
    ? [
      { path: '/dashboard', label: 'Dashboard', icon: Calendar },
      { path: '/suppliers', label: 'Fornecedores' },
      { path: '/reviews', label: 'Avaliações' },
    ]
    : [
      { path: '/supplier-dashboard', label: 'Dashboard', icon: Calendar },
      { path: '/supplier-profile-edit', label: 'Meu Perfil' },
      { path: '/supplier-reviews', label: 'Avaliações' },
    ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="relative w-11 h-11 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                <img src={logo3} className="rounded-lg"/>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                ConectEvento
              </span>
              <span className="text-xs text-gray-500 leading-tight hidden sm:block font-medium">
                Conectando eventos e fornecedores
              </span>
            </div>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${isActive(link.path)
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 transition-colors hover:text-blue-600'
                      }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="hidden md:block">
                  <Dropdown
                    menu={{ items: userMenuItems }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <button 
                      type="button"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user?.name || 'Avatar do usuário'}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {user?.type === 'organizer' ? 'Organizador' : 'Fornecedor'}
                        </span>
                      </div>
                    </button>
                  </Dropdown>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6 text-gray-700" />
                  ) : (
                    <Menu className="w-6 h-6 text-gray-700" />
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>

        {isAuthenticated && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-1">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${isActive(link.path)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 transition-colors'
                      }`}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-gray-200 my-2"></div>
              <div className="px-4 py-2">
                <div className="flex items-center space-x-3 mb-3">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || 'Avatar do usuário'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user?.type === 'organizer' ? 'Organizador' : 'Fornecedor'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}