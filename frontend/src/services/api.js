import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE}/api/token/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Task APIs
export const taskAPI = {
  // Criar tarefa
  create: (data) => api.post('/task', data),
  
  // Listar tarefas com filtros
  getAll: (filters = {}) => api.get('/tasks', { params: filters }),
  
  // Obter tarefa específica
  getById: (id) => api.get(`/task/${id}`),
  
  // Atualizar tarefa
  update: (id, data) => api.put(`/task/${id}`, data),
  
  // Deletar tarefa
  delete: (id) => api.delete(`/task/${id}`),
  
  // Incrementar progresso
  incrementProgress: (id) => api.put(`/task/${id}/progress`),
  
  // Decrementar progresso
  decrementProgress: (id) => api.put(`/task/${id}/progress/decrement`),
};

// User APIs
export const userAPI = {
  // Obter dados do usuário
  getProfile: () => api.get('/user'),
  
  // Atualizar dados do usuário
  update: (data) => api.put('/user', data),
  
  // Trocar senha
  changePassword: (data) => api.put('/user/change-password', data),
};

export default api;