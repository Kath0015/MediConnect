import React, { useState } from 'react';
import { Bell, Check, X, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

const initialNotifs = [
  { id: 1, title: 'New Appointment Booked', message: 'Maria Santos booked an appointment with Dr. Santos for Aug 20.', date: '2026-08-18', time: '09:00 AM', type: 'appointment', read: false },
  { id: 2, title: 'User Registered', message: 'New patient Pedro Lim registered in the system.', date: '2026-08-17', time: '03:15 PM', type: 'user', read: false },
  { id: 3, title: 'Lab Result Uploaded', message: 'Lab results for Ana Reyes have been uploaded.', date: '2026-08-16', time: '11:00 AM', type: 'lab', read: true },
  { id: 4, title: 'System Backup Complete', message: 'Daily system backup completed successfully.', date: '2026-08-18', time: '02:00 AM', type: 'system', read: true },
];

const typeColors = {
  appointment: 'bg-[#009DD1]/10 text-[#009DD1]',
  user: 'bg-[#26B170]/10 text-[#26B170]',
  lab: 'bg-[#7C3AED]/10 text-[#7C3AED]',
  system: 'bg-slate-100 text-slate-600',
};

const AdminNotifications = () => {
  const [notifs, setNotifs] = useState(initialNotifs);
  const unread = notifs.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleMarkRead = (id) => {
    setNotifs((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)));
    toast.success('Notification marked as read');
  };

  const handleDismiss = (id) => {
    setNotifs((prev) => prev.filter((x) => x.id !== id));
    toast.info('Notification dismissed');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#009DD1]" /> Notifications{' '}
            {unread > 0 && (
              <span className="bg-[#009DD1] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">System-wide clinical alerts and activity logs.</p>
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm font-medium text-[#009DD1] border border-[#009DD1]/30 rounded-xl px-4 py-2 hover:bg-[#009DD1]/5 transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
            No active notifications.
          </div>
        ) : (
          notifs.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 flex gap-4 transition-all ${
                !n.read ? 'border-[#009DD1]/30 bg-sky-50/20' : 'border-slate-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${typeColors[n.type]} flex items-center justify-center flex-shrink-0`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{n.title}</h3>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#009DD1]" />}
                  </div>
                  <div className="flex gap-1">
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                        title="Mark read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(n.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-rose-500 transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-1">{n.message}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {n.date} · {n.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;

