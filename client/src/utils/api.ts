// Função para obter a URL da API baseada no ambiente
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000/api' 
    : '/.netlify/functions/api';
  return `${baseUrl}${endpoint}`;
};

// Função para fazer requisições autenticadas
export const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  return fetch(getApiUrl(endpoint), {
    ...options,
    headers: defaultHeaders
  });
};
