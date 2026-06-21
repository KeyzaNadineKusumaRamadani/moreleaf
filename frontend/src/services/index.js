import api from './api';

export const cartService = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  remove: (id) => api.delete(`/cart/${id}`),
  validateVoucher: (data) => api.post('/cart/voucher', data),
};

export const orderService = {
  create: (formData) => api.post('/orders', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadPaymentProof: (id, formData) =>
    api.post(`/orders/${id}/payment-proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getStats: () => api.get('/orders/stats'),
  getInvoiceUrl: (id) => `${api.defaults.baseURL}/orders/${id}/invoice`,
};

export const reviewService = {
  getAll: (params) => api.get('/reviews', { params }),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const wishlistService = {
  getAll: () => api.get('/wishlist'),
  add: (product_id) => api.post('/wishlist', { product_id }),
  remove: (id) => api.delete(`/wishlist/${id}`),
};

export const contactService = {
  send: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
  reply: (id, admin_reply) => api.put(`/contact/${id}/reply`, { admin_reply }),
  delete: (id) => api.delete(`/contact/${id}`),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/read/${id}`),
};

export const userService = {
  getAll: () => api.get('/users'),
  block: (id, is_blocked) => api.put(`/users/${id}/block`, { is_blocked }),
  delete: (id) => api.delete(`/users/${id}`),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
};

export const exportService = {
  ordersUrl: () => `${api.defaults.baseURL}/export/orders`,
  productsUrl: () => `${api.defaults.baseURL}/export/products`,
};