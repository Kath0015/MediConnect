import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import NotificationItem from '../../components/NotificationItem';
import { useNotifications } from '../../contexts/NotificationContext';

const initialNotifs = [
  { id: 1, title: 'New Appointment Booked', message: 'Maria Santos booked an appointment with Dr. Santos for Aug 20.', date: '2026-08-18', time: '09:00 AM', type: 'appointment', read: false },
  { id: 2, title: 'User Registered', message: 'New patient Pedro Lim registered in the system.', date: '2026-08-17', time: '03:15 PM', type: 'user', read: false },
  { id: 3, title: 'Lab Result Uploaded', message: 'Lab results for Ana Reyes have been uploaded.', date: '2026-08-16', time: '11:00 AM', type: 'lab', read: true },
  { id: 4, title: 'System Backup Complete', message: 'Daily system backup completed successfully.', date: '2026-08-18', time: '02:00 AM', type: 'system', read: true },
];

const typeConfig = {
  appointment: { icon: Bell, bg: 'bg-[#009DD1]/10' },
  user: { icon: Bell, bg: 'bg-[#26B170]/10' },
  lab: { icon: Bell, bg: 'bg-[#7C3AED]/10' },
  system: { icon: Bell, bg: 'bg-slate-100' },
};

const AdminNotifications = () => {
  const [notifs, setNotifs] = useState(initialNotifs);
  const { updateUnreadCount } = useNotifications();
  
  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    updateUnreadCount(unread);
  }, [unread, updateUnreadCount]);

  const handleMarkAllRead = () => {
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));
    toast.success('All marked as read');
  };

  const handleMarkRead = (id) => {
    setNotifs((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)));
  };

  const handleDismiss = (id) => {
    setNotifs((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#009DD1]" />
          Notifications
          {unread > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              {unread}
            </span>
          )}
        </h1>
        {unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs font-medium text-cyan-600 hover:text-cyan-700 transition-colors bg-cyan-50 hover:bg-cyan-100 rounded-lg px-3 py-1.5"
          >
            <CheckCheck className="w-3 h-3" />
            Mark all
          </button>
        )}
      </div>

      {/* Compact notifications list */}
      <div className="space-y-2">
        {notifs.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-slate-100 text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm font-medium">No notifications</p>
          </div>
        ) : (
          notifs.map((n) => {
            const tc = typeConfig[n.type];
            const Icon = tc.icon;
            return (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
                onDismiss={handleDismiss}
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

export default AdminNotifications;

