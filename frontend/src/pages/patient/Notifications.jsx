import React, { useState } from 'react';
import { Bell, Calendar, FileText, CheckCircle, AlertCircle, Info, X, Check } from 'lucide-react';

const mockNotifications = [
  { id: 1, type: 'appointment', title: 'Appointment Confirmed', message: 'Your appointment with Dr. Santos on Aug 20, 2026 at 10:00 AM has been confirmed.', date: '2026-08-18', time: '09:00 AM', read: false },
  { id: 2, type: 'lab', title: 'Lab Results Available', message: 'Your CBC results from Aug 12 are now available. Please log in to view them.', date: '2026-08-17', time: '02:30 PM', read: false },
  { id: 3, type: 'reminder', title: 'Appointment Reminder', message: 'You have an upcoming appointment tomorrow, Aug 19, at 2:00 PM with Dr. Reyes.', date: '2026-08-18', time: '08:00 AM', read: true },
  { id: 4, type: 'info', title: 'Medical Certificate Ready', message: 'Your requested Medical Certificate is now ready for pickup or download.', date: '2026-08-15', time: '11:00 AM', read: true },
  { id: 5, type: 'alert', title: 'Appointment Rescheduled', message: 'Your appointment on Aug 16 has been rescheduled to Aug 22, 2026 at 3:00 PM.', date: '2026-08-14', time: '04:00 PM', read: true },
];

const typeConfig = {
  appointment: { icon: Calendar, color: 'text-[#009DD1]', bg: 'bg-[#009DD1]/10' },
  lab: { icon: FileText, color: 'text-[#7C3AED]', bg: 'bg-[#7C3AED]/10' },
  reminder: { icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50' },
  info: { icon: Info, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  alert: { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const markRead = (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismiss = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const unread = notifications.filter((n) => !n.read).length;
  const filtered = notifications.filter((n) => filter === 'all' ? true : !n.read);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#009DD1]" />
            Notifications
            {unread > 0 && (
              <span className="ml-1 bg-[#009DD1] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{unread}</span>
            )}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Stay updated with your appointments and health activity.</p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm font-medium text-[#009DD1] hover:text-[#01377D] transition-colors border border-[#009DD1]/30 rounded-xl px-4 py-2 hover:bg-[#009DD1]/5"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[{ key: 'all', label: `All (${notifications.length})` }, { key: 'unread', label: `Unread (${unread})` }].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
              filter === t.key
                ? 'bg-[#01377D] text-white border-[#01377D]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#009DD1]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 text-slate-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30 text-emerald-400" />
            <p className="font-medium">You're all caught up!</p>
            <p className="text-sm mt-1">No new notifications</p>
          </div>
        ) : (
          filtered.map((n) => {
            const tc = typeConfig[n.type];
            const Icon = tc.icon;
            return (
              <div
                key={n.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 transition-all duration-200 hover:shadow-md flex gap-4 ${
                  !n.read ? 'border-[#009DD1]/30 bg-[#009DD1]/2' : 'border-slate-100'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl ${tc.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${tc.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</h3>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#009DD1] flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!n.read && (
                        <button onClick={() => markRead(n.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-colors" title="Mark as read">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => dismiss(n.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-rose-500 transition-colors" title="Dismiss">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{n.date} · {n.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
