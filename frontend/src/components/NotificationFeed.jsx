import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import NotificationItem from './NotificationItem';
import { deleteNotification, getNotifications, markAllNotificationsRead, markNotificationRead } from '../api/Notifications';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationFeed = ({ colorClass = 'bg-slate-100', icon: Icon = Bell }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { updateUnreadCount } = useNotifications();
  const unread = notifications.filter((notification) => !notification.read_at).length;

  const loadNotifications = () => {
    setLoading(true);
    getNotifications({ per_page: 100 })
      .then(({ data }) => setNotifications(data.data || []))
      .catch(() => toast.error('Failed to load notifications.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    updateUnreadCount(unread);
  }, [unread, updateUnreadCount]);

  const formatNotification = (notification) => ({
    ...notification,
    title: notification.subject,
    read: Boolean(notification.read_at),
    date: notification.created_at ? new Date(notification.created_at).toLocaleDateString() : '',
    time: notification.created_at ? new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
  });

  const markRead = (id) => {
    markNotificationRead(id)
      .then(() => setNotifications((current) => current.map((item) => item.id === id ? { ...item, read_at: new Date().toISOString() } : item)))
      .catch(() => toast.error('Failed to mark notification as read.'));
  };

  const markAllRead = () => {
    markAllNotificationsRead()
      .then(() => setNotifications((current) => current.map((item) => ({ ...item, read_at: new Date().toISOString() }))))
      .then(() => toast.success('All marked as read'))
      .catch(() => toast.error('Failed to mark notifications as read.'));
  };

  const dismiss = (id) => {
    deleteNotification(id)
      .then(() => setNotifications((current) => current.filter((item) => item.id !== id)))
      .catch(() => toast.error('Failed to dismiss notification.'));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notifications
          {unread > 0 && <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{unread}</span>}
        </h1>
        {unread > 0 && <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg px-3 py-1.5"><CheckCheck className="w-3 h-3" /> Mark all</button>}
      </div>
      <div className="space-y-2">
        {loading ? <div className="text-center py-8 text-slate-400">Loading notifications...</div> : notifications.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-slate-100 text-slate-400"><Bell className="w-8 h-8 mx-auto mb-2 opacity-20" /><p className="text-sm font-medium">No notifications</p></div>
        ) : notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={formatNotification(notification)} onMarkRead={markRead} onDismiss={dismiss} icon={Icon} colorClass={colorClass} />
        ))}
      </div>
    </div>
  );
};

export default NotificationFeed;
