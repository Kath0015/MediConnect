import api from './axios';

export const getNotifications = (params = {}) => api.get('/api/notifications', { params });
export const markNotificationRead = (id) => api.patch(`/api/notifications/${id}`, { read_at: true });
export const markAllNotificationsRead = () => api.post('/api/notifications/mark-all-read');
export const deleteNotification = (id) => api.delete(`/api/notifications/${id}`);
