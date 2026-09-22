import api from './axios';

export const getInvoices = async (params = {}) => {
  const response = await api.get('/api/invoices', { params });
  return response.data;
};

export const createInvoice = async (data) => {
  const response = await api.post('/api/invoices', data);
  return response.data;
};

export const markInvoicePaid = async (id, data = {}) => {
  const response = await api.patch(`/api/invoices/${id}/pay`, data);
  return response.data;
};

export const deleteInvoice = async (id) => {
  const response = await api.delete(`/api/invoices/${id}`);
  return response.data;
};

export default {
  getInvoices,
  createInvoice,
  markInvoicePaid,
  deleteInvoice,
};
