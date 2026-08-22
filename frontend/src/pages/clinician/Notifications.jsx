import React, { useState } from 'react';
import { Bell, Check, X, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

const mockNotifs = [
  { id: 1, title: 'Patient Arrived', message: 'Juan dela Cruz has arrived for 11:00 AM consultation.', date: '2026-08-18', time: '10:30 AM', read: false },
  { id: 2, title: 'Document Uploaded', message: 'Maria Santos uploaded previous CBC scan.', date: '2026-08-17', time: '02:00 PM', read: true },
];

const ClinicianNotifications = () => {
  const [notifs, setNotifs] = useState(mockNotifs);
  const unread = notifs.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleMarkAsRead = (id) => {
    setNotifs((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)));
    toast.success('Notification marked as read');
  };

  const handleDeleteNotif = (id) => {
    setNotifs((prev) => prev.filter((x) => x.id !== id));
    toast.success('Notification dismissed');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#26B170]" />
            Notifications
            {unread > 0 && <span className="bg-[#26B170] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{unread}</span>}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Clinic alerts and patient queue notifications.</p>
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-2 text-sm font-medium text-[#26B170] border border-[#26B170]/30 rounded-xl px-4 py-2 hover:bg-emerald-50 transition-colors">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
            No notifications.
          </div>
        ) : (
          notifs.map((n) => (
            <div key={n.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex gap-4 transition-all ${!n.read ? 'border-[#26B170]/30' : 'border-slate-100'}`}>
              <div className="w-10 h-10 rounded-xl bg-[#26B170]/10 text-[#26B170] flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{n.title}</h3>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#26B170]" />}
                  </div>
                  <div className="flex gap-1">
                    {!n.read && (
                      <button onClick={() => handleMarkAsRead(n.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-colors" title="Mark as read">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => handleDeleteNotif(n.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-rose-500 transition-colors" title="Dismiss">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-1">{n.message}</p>
                <p className="text-xs text-slate-400 mt-2">{n.date} · {n.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClinicianNotifications;

