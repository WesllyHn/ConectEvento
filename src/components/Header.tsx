import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ConectEvento</span>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-8">
              {user?.type === 'organizer' ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/dashboard') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/suppliers"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/suppliers') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Fornecedores
                  </Link>
                  <Link
                    to="/reviews"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/reviews') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Avaliações
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/supplier-dashboard"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/supplier-dashboard') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/supplier-profile-edit"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/supplier-profile-edit') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Meu Perfil
                  </Link>
                  <Link
                    to="/supplier-reviews"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/supplier-reviews') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    Avaliações
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden md:block">{user?.name}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}