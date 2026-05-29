import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
};

export const productAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  getByCategory: (categoryId, params) => api.get(`/api/products/category/${categoryId}`, { params }),
  search: (params) => api.get('/api/products/search', { params }),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get('/api/categories'),
  getById: (id) => api.get(`/api/categories/${id}`),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

export const cartAPI = {
  get: () => api.get('/api/cart'),
  addItem: (data) => api.post('/api/cart/items', data),
  updateItem: (itemId, quantity) => api.put(`/api/cart/items/${itemId}?quantity=${quantity}`),
  removeItem: (itemId) => api.delete(`/api/cart/items/${itemId}`),
  clear: () => api.delete('/api/cart'),
};

export const orderAPI = {
  place: (data) => api.post('/api/orders', data),
  getById: (id) => api.get(`/api/orders/${id}`),
  getMyOrders: (params) => api.get('/api/orders/my-orders', { params }),
  getAllOrders: (params) => api.get('/api/orders/admin/all', { params }),
  updateStatus: (id, status) => api.patch(`/api/orders/admin/${id}/status?status=${status}`),
  cancel: (id) => api.post(`/api/orders/${id}/cancel`),
};

export const paymentAPI = {
  process: (data) => api.post('/api/payments', data),
  getByOrder: (orderId) => api.get(`/api/payments/order/${orderId}`),
};

export default api;
