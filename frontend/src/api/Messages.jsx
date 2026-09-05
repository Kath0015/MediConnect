// src/api/Messages.jsx
import api from './axios';

export const getConversations = async () => {
  return api.get('/api/messages/conversations');
};

export const getContacts = async () => {
  return api.get('/api/messages/contacts');
};

export const getContactsByRole = async () => {
  return api.get('/api/messages/contacts/by-role');
};

export const getSuggestedContacts = async (limit = 5) => {
  return api.get(`/api/messages/contacts/suggested?limit=${limit}`);
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

export const getMessagingStats = async () => {
  return api.get('/api/messages/stats');
};

export const markMessagesAsRead = async (userId) => {
  return api.patch(`/api/messages/${userId}/mark-read`);
};

export const hasConversation = async (userId) => {
  return api.get(`/api/messages/${userId}/has-conversation`);
};
