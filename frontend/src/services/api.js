import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
let API_BASE_URL = 'http://localhost:8080/api';
if (rawUrl) {
  API_BASE_URL = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  if (!API_BASE_URL.endsWith('/api')) {
    API_BASE_URL = `${API_BASE_URL}/api`;
  }
}

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

export const userService = {
  getMyProfile: () => api.get('/users/me'),
  updateProfile: (params) => api.put('/users/profile', null, { params }),
  getActiveCustomers: () => api.get('/users/customers'),
  getStaffMembers: () => api.get('/users/staff'),
  createAdminUser: (userData) => api.post('/users/create-admin', userData),
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
  trackDelivery: (trackingNumber) => api.get(`/orders/track/${trackingNumber}`),
  updateStatus: (id, status, deliveryNotes) => api.patch(`/orders/${id}/status`, null, { params: { status, deliveryNotes } }),
};

export const billService = {
  getAllBills: () => api.get('/bills'),
  getMyBills: () => api.get('/bills/my'),
  updateBillStatus: (id, status) => api.patch(`/bills/${id}/status`, null, { params: { status } }),
};

export const supportService = {
  getAllTickets: () => api.get('/support'),
  getMyTickets: () => api.get('/support/my'),
  createTicket: (subject, category, message) => api.post('/support', null, { params: { subject, category, message } }),
  respondToTicket: (id, response, status) => api.patch(`/support/${id}/respond`, null, { params: { response, status } }),
};

export const prescriptionService = {
  uploadPrescription: (data) => api.post('/prescriptions', null, { params: data }),
  getMyPrescriptions: () => api.get('/prescriptions/my'),
  getAllPrescriptions: () => api.get('/prescriptions'),
  updateStatus: (id, status) => api.patch(`/prescriptions/${id}/status`, null, { params: { status } }),
};

export default api;
