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
    // Log de requisições
    axios.interceptors.request.use(
      (config: any) => {
        console.log('🚀 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });
        return config;
      },
      (error: any) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Log de respostas
    axios.interceptors.response.use(
      (response: any) => {
        console.log('✅ API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
        return response;
      },
      (error: any) => {
        console.error('❌ API Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.response?.data?.error || error.message,
        });
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
