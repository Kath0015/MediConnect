import api from './axios';

export const getPrescriptions = async (params = {}) => {
  const response = await api.get('/api/prescriptions', { params });
  return response.data;
};

export const getPrescription = async (id) => {
  const response = await api.get(`/api/prescriptions/${id}`);
  return response.data;
};

export const createPrescription = async (data) => {
  const response = await api.post('/api/prescriptions', data);
  return response.data;
};

export const updatePrescription = async (id, data) => {
  const response = await api.put(`/api/prescriptions/${id}`, data);
  return response.data;
};

export const deletePrescription = async (id) => {
  const response = await api.delete(`/api/prescriptions/${id}`);
  return response.data;
};

export default {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
};
