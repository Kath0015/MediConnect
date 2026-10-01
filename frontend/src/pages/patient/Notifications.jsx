import React, { useState, useEffect } from 'react';
import { Bell, Calendar, FileText, CheckCircle, AlertCircle, Info, Check } from 'lucide-react';
import NotificationItem from '../../components/NotificationItem';
import { useNotifications } from '../../contexts/NotificationContext';

const mockNotifications = [
  { id: 1, type: 'appointment', title: 'Appointment Confirmed', message: 'Your appointment with Dr. Santos on Aug 20, 2026 at 10:00 AM has been confirmed.', date: '2026-08-18', time: '09:00 AM', read: false },
  { id: 2, type: 'lab', title: 'Lab Results Available', message: 'Your CBC results from Aug 12 are now available. Please log in to view them.', date: '2026-08-17', time: '02:30 PM', read: false },
  { id: 3, type: 'reminder', title: 'Appointment Reminder', message: 'You have an upcoming appointment tomorrow, Aug 19, at 2:00 PM with Dr. Reyes.', date: '2026-08-18', time: '08:00 AM', read: true },
  { id: 4, type: 'info', title: 'Medical Certificate Ready', message: 'Your requested Medical Certificate is now ready for pickup or download.', date: '2026-08-15', time: '11:00 AM', read: true },
  { id: 5, type: 'alert', title: 'Appointment Rescheduled', message: 'Your appointment on Aug 16 has been rescheduled to Aug 22, 2026 at 3:00 PM.', date: '2026-08-14', time: '04:00 PM', read: true },
];

const typeConfig = {
  appointment: { icon: Calendar, bg: 'bg-[#009DD1]/10' },
  lab: { icon: FileText, bg: 'bg-[#7C3AED]/10' },
  reminder: { icon: Bell, bg: 'bg-amber-100/20' },
  info: { icon: Info, bg: 'bg-emerald-100/20' },
  alert: { icon: AlertCircle, bg: 'bg-rose-100/20' },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');
  const { updateUnreadCount } = useNotifications();

  const unread = notifications.filter((n) => !n.read).length;
  
  useEffect(() => {
    updateUnreadCount(unread);
  }, [unread, updateUnreadCount]);

  const markRead = (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismiss = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const filtered = notifications.filter((n) => filter === 'all' ? true : !n.read);

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#009DD1]" />
            Notifications
            {unread > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {unread}
              </span>
            )}
          </h1>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 hover:bg-emerald-100 rounded-lg px-3 py-1.5"
          >
            <Check className="w-3 h-3" />
            Mark all
          </button>
        )}
      </div>

      {/* Filter tabs - compact */}
      <div className="flex gap-2">
        {[{ key: 'all', label: `All (${notifications.length})` }, { key: 'unread', label: `Unread (${unread})` }].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filter === t.key
                ? 'bg-[#009DD1] text-white border-[#009DD1]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#009DD1]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Compact notifications list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-slate-100 text-slate-400">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-400" />
            <p className="text-sm font-medium">You're all caught up!</p>
          </div>
        ) : (
          filtered.map((n) => {
            const tc = typeConfig[n.type];
            const Icon = tc.icon;
            return (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={markRead}
                onDismiss={dismiss}
                icon={Icon}
                colorClass={tc.bg}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
