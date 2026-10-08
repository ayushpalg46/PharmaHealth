import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pharma_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (username, password) => api.post('/auth/signin', { username, password }),
  register: (userData) => api.post('/auth/signup', userData),
  logout: () => {
    localStorage.removeItem('pharma_token');
    localStorage.removeItem('pharma_user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('pharma_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const medicineService = {
  getMedicines: (categoryId, search) => api.get('/public/medicines', { params: { categoryId, search } }),
  getCategories: () => api.get('/public/categories'),
  getMedicineById: (id) => api.get(`/public/medicines/${id}`),
  addMedicine: (medicine) => api.post('/medicines', medicine),
  updateMedicine: (id, medicine) => api.put(`/medicines/${id}`, medicine),
  deleteMedicine: (id) => api.delete(`/medicines/${id}`),
};

export const orderService = {
  placeOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my'),
  getAllOrders: () => api.get('/orders'),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, null, { params: { status } }),
};

export const prescriptionService = {
  uploadPrescription: (data) => api.post('/prescriptions', null, { params: data }),
  getMyPrescriptions: () => api.get('/prescriptions/my'),
  getAllPrescriptions: () => api.get('/prescriptions'),
  updateStatus: (id, status) => api.patch(`/prescriptions/${id}/status`, null, { params: { status } }),
};

export default api;
