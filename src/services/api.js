import axios from 'axios';

const API_BASE = 'https://api-pontuae.azurewebsites.net';

const api = axios.create({
  baseURL: `${API_BASE}`,
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
        // POST /api/token/refresh-token retorna (200 OK):
        // {
        //   "accessToken": "string",
        //   "refreshToken": "string"
        // }
        const response = await axios.post(`${API_BASE}/token/refresh-token`, {
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
        localStorage.removeItem('userEmail');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Task APIs
export const taskAPI = {
  // POST /api/task - Criar tarefa
  // Retorna 201 Created: { "id": 0, "title": "string" }
  create: (data) => api.post('/task', data),
  
  // GET /api/tasks - Listar tarefas com filtros
  // Retorna 200 OK: Array de ResponseTaskJson
  // ResponseTaskJson: { title, description, weeklyGoal, progress, category, startDate, weekOfMonth, isCompleted }
  getAll: (filters = {}) => api.get('/api/tasks', { params: filters }),
  
  // GET /api/task/{id} - Obter tarefa específica
  // Retorna 200 OK: ResponseTaskJson
  getById: (id) => api.get(`/task/${id}`),
  
  // PUT /api/task/{id} - Atualizar tarefa
  // Retorna 204 No Content (sem body)
  update: (id, data) => api.put(`/task/${id}`, data),
  
  // DELETE /api/task/{id} - Deletar tarefa
  // Retorna 204 No Content (sem body)
  delete: (id) => api.delete(`/task/${id}`),
  
  // PUT /api/task/{id}/progress - Incrementar progresso
  // Retorna 204 No Content (sem body)
  // Pode retornar 409 Conflict se já atingiu a meta
  incrementProgress: (id) => api.put(`/task/${id}/progress`),
  
  // PUT /api/task/{id}/progress/decrement - Decrementar progresso
  // Retorna 204 No Content (sem body)
  // Pode retornar 409 Conflict se progresso já está em zero
  decrementProgress: (id) => api.put(`/task/${id}/progress/decrement`),
};

// User APIs
export const userAPI = {
  // POST /api/user/register - Registrar usuário
  // Body: { "name": "string", "email": "string", "password": "string" }
  // Retorna 201 Created: { "name": "string", "email": "string" }
  register: (data) => api.post('/user', data),

  // GET /api/user - Obter dados do usuário
  // Retorna 200 OK: { "name": "string", "tokens": { "accessToken": "string", "refreshToken": "string" } }
  getProfile: () => api.get('/user'),
  
  // PUT /api/user - Atualizar dados do usuário
  // Body: { "name": "string", "email": "string" }
  // Retorna 204 No Content (sem body)
  update: (data) => api.put('/user', data),
  
  // PUT /api/user/change-password - Trocar senha
  // Body: { "password": "string", "newPassword": "string" }
  // Retorna 204 No Content (sem body)
  changePassword: (data) => api.put('/user/change-password', data),
};

export default api;