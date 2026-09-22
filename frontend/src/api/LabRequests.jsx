import api from './axios';

export const getLabRequests = async (params = {}) => {
  const response = await api.get('/api/lab-requests', { params });
  return response.data;
};

export const getLabRequest = async (id) => {
  const response = await api.get(`/api/lab-requests/${id}`);
  return response.data;
};

export const createLabRequest = async (data) => {
  const response = await api.post('/api/lab-requests', data);
  return response.data;
};

export const updateLabRequest = async (id, data) => {
  const response = await api.put(`/api/lab-requests/${id}`, data);
  return response.data;
};

export const deleteLabRequest = async (id) => {
  const response = await api.delete(`/api/lab-requests/${id}`);
  return response.data;
};

export default {
  getLabRequests,
  getLabRequest,
  createLabRequest,
  updateLabRequest,
  deleteLabRequest,
};
