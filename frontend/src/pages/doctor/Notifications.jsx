import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import NotificationItem from '../../components/NotificationItem';
import { useNotifications } from '../../contexts/NotificationContext';

const mockNotifs = [
  { id: 1, title: 'Lab Result Ready', message: 'Lab results for Maria Santos (CBC) have been uploaded by Nurse Lopez.', date: '2026-08-18', time: '09:30 AM', read: false },
  { id: 2, title: 'New Appointment Booked', message: 'Juan dela Cruz requested a consultation for Aug 20, 11:00 AM.', date: '2026-08-17', time: '04:15 PM', read: false },
  { id: 3, title: 'Certificate Request', message: 'Pedro Lim requested a Fit to Work Medical Certificate.', date: '2026-08-16', time: '10:00 AM', read: true },
];

const DoctorNotifications = () => {
  const [notifs, setNotifs] = useState(mockNotifs);
  const { updateUnreadCount } = useNotifications();
  
  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    updateUnreadCount(unread);
  }, [unread, updateUnreadCount]);

  const handleMarkAllRead = () => {
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));
    toast.success('All marked as read');
  };

  const handleMarkAsRead = (id) => {
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
          <Bell className="w-5 h-5 text-[#7C3AED]" />
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
            className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors bg-purple-50 hover:bg-purple-100 rounded-lg px-3 py-1.5"
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
          notifs.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={handleMarkAsRead}
              onDismiss={handleDismiss}
              icon={Bell}
              colorClass="bg-[#7C3AED]/10"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorNotifications;
