// Configuração da API para desenvolvimento e produção
const isDevelopment = process.env.NODE_ENV === 'development';

// URL base da API
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001/api'  // Desenvolvimento local
  : '/.netlify/functions/api';    // Produção no Netlify

// Configuração do Axios
export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Função para obter a URL completa da API
export const getApiUrl = (endpoint: string): string => {
  // Remove barra inicial se existir
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Configuração de interceptors para logs em desenvolvimento
export const setupAxiosInterceptors = (axios: any) => {
  if (isDevelopment) {
    // Log de requisições (apenas em desenvolvimento)
    axios.interceptors.request.use(
      (config: any) => {
        // Log removido para evitar problemas de ESLint em produção
        return config;
      },
      (error: any) => {
        // Log removido para evitar problemas de ESLint em produção
        return Promise.reject(error);
      }
    );

    // Log de respostas (apenas em desenvolvimento)
    axios.interceptors.response.use(
      (response: any) => {
        // Log removido para evitar problemas de ESLint em produção
        return response;
      },
      (error: any) => {
        // Log removido para evitar problemas de ESLint em produção
        return Promise.reject(error);
      }
    );
  }
};

// Configuração de ambiente
export const environment = {
  isDevelopment,
  isProduction: !isDevelopment,
  apiUrl: API_BASE_URL,
  netlifyUrl: process.env.REACT_APP_NETLIFY_URL || 'https://your-app.netlify.app',
};

// Configuração de CORS para desenvolvimento
export const corsConfig = {
  credentials: isDevelopment ? 'include' : 'omit',
  mode: isDevelopment ? 'cors' : 'same-origin',
};
