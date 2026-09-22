import api from './axios';

export const getCheckIns = async (params = {}) => {
  const response = await api.get('/api/check-ins', { params });
  return response.data;
};

export const createCheckIn = async (data) => {
  const response = await api.post('/api/check-ins', data);
  return response.data;
};

export const updateCheckInStatus = async (id, status) => {
  const response = await api.patch(`/api/check-ins/${id}/status`, { status });
  return response.data;
};

export const deleteCheckIn = async (id) => {
  const response = await api.delete(`/api/check-ins/${id}`);
  return response.data;
};

export const getVitals = async (params = {}) => {
  const response = await api.get('/api/vitals', { params });
  return response.data;
};

export const createVital = async (data) => {
  const response = await api.post('/api/vitals', data);
  return response.data;
};

export default {
  getCheckIns,
  createCheckIn,
  updateCheckInStatus,
  deleteCheckIn,
  getVitals,
  createVital,
};
