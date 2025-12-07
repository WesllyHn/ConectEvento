const API_BASE_URL = import.meta.env.VITE_API_URL;

// Função para obter o token do localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Função para limpar autenticação e redirecionar para login
const handleUnauthorized = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redirecionar para login apenas se não estiver já na página de login ou registro
  const currentPath = window.location.pathname;
  if (currentPath !== '/login' && currentPath !== '/register' && !currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
    // Usar setTimeout para evitar problemas com navegação durante renderização
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Obter token do localStorage
  const token = getToken();
  
  // Preparar headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  // Adicionar token no header Authorization se existir
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Tratar erro de autenticação (401)
    if (response.status === 401) {
      handleUnauthorized();
      const errorData = await response.json().catch(() => ({ message: 'Não autenticado' }));
      throw new Error(errorData.message || 'Token inválido ou expirado');
    }
    
    // Tratar outros erros HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }
    
    const data = await response.json();
    
    // Verificar se a resposta tem success: false mesmo com status HTTP ok
    if (data.success === false && data.message) {
      const error = new Error(data.message);
      (error as any).status = response.status;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export { apiRequest, API_BASE_URL, getToken, handleUnauthorized };