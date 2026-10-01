import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import NotificationItem from '../../components/NotificationItem';
import { useNotifications } from '../../contexts/NotificationContext';

const mockNotifs = [
  { id: 1, title: 'Patient Arrived', message: 'Juan dela Cruz has arrived for 11:00 AM consultation.', date: '2026-08-18', time: '10:30 AM', read: false },
  { id: 2, title: 'Document Uploaded', message: 'Maria Santos uploaded previous CBC scan.', date: '2026-08-17', time: '02:00 PM', read: true },
];

const ClinicianNotifications = () => {
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

  const handleDeleteNotif = (id) => {
    setNotifs((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#26B170]" />
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
            className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 hover:bg-emerald-100 rounded-lg px-3 py-1.5"
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
              onDismiss={handleDeleteNotif}
              icon={Bell}
              colorClass="bg-[#26B170]/10"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ClinicianNotifications;

