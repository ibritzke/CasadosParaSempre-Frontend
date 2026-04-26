// src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
})

// Inject token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cps_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cps_token')
      window.location.href = '/auth'
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth ──────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; role: string; spouseName?: string; coupleCode?: string }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  googleAuth: (accessToken: string) =>
    api.post('/auth/google', { accessToken }),
  completeGoogleProfile: (data: object) =>
    api.post('/auth/google/complete', data),
  me: () => api.get('/auth/me'),
}

// ── Pills ──────────────────────────────────────────
export const pillApi = {
  getAll: () => api.get('/pills'),
  draw: () => api.post('/pills/draw'),
  getCurrent: () => api.get('/pills/current'),
  cancel: (drawId: string) => api.patch(`/pills/draw/${drawId}/cancel`),
  getHistory: () => api.get('/pills/history'),
  createRecord: (data: { drawId: string; what: string; when: string; how?: string }) =>
    api.post('/pills/records', data),
  updateRecord: (id: string, data: { what: string; when: string; how?: string }) =>
    api.put(`/pills/records/${id}`, data),
  deleteRecord: (id: string) => api.delete(`/pills/records/${id}`),
}

// ── Calendar ──────────────────────────────────────────
export const calendarApi = {
  getEvents: (month: number, year: number) =>
    api.get('/calendar', { params: { month, year } }),
  createEvent: (data: { type: string; date: string; note?: string }) =>
    api.post('/calendar', data),
  updateEvent: (id: string, data: object) => api.patch(`/calendar/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/calendar/${id}`),
}

// ── Admin ──────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: { page?: number; search?: string }) =>
    api.get('/admin/users', { params }),
  getPillStats: () => api.get('/admin/pill-stats'),
  toggleAdmin: (id: string) => api.patch(`/admin/users/${id}/admin`),
  toggleActive: (id: string) => api.patch(`/admin/users/${id}/active`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  
}
