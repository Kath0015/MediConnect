// src/api/Messages.jsx
import api from './axios';

export const getConversations = async () => {
  return api.get('/api/messages/conversations');
};

export const getContacts = async () => {
  return api.get('/api/messages/contacts');
};

export const getMessages = async (userId) => {
  return api.get(`/api/messages/${userId}`);
};

export const sendMessage = async (data) => {
  return api.post('/api/messages', data);
};

export const getUnreadMessageCount = async () => {
  return api.get('/api/messages/unread-count');
};
