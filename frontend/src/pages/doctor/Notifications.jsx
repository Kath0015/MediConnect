import React, { useState } from 'react';
import { Bell, Check, X, CheckCheck, FlaskConical, Calendar, User } from 'lucide-react';

const mockNotifs = [
  { id: 1, title: 'Lab Result Ready', message: 'Lab results for Maria Santos (CBC) have been uploaded by Nurse Lopez.', date: '2026-08-18', time: '09:30 AM', read: false },
  { id: 2, title: 'New Appointment Booked', message: 'Juan dela Cruz requested a consultation for Aug 20, 11:00 AM.', date: '2026-08-17', time: '04:15 PM', read: false },
  { id: 3, title: 'Certificate Request', message: 'Pedro Lim requested a Fit to Work Medical Certificate.', date: '2026-08-16', time: '10:00 AM', read: true },
];

const DoctorNotifications = () => {
  const [notifs, setNotifs] = useState(mockNotifs);
  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#7C3AED]" />
            Notifications
            {unread > 0 && <span className="bg-[#7C3AED] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{unread}</span>}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Updates on lab results, appointments, and patient requests.</p>
        </div>
        {unread > 0 && (
          <button onClick={() => setNotifs((n) => n.map((x) => ({ ...x, read: true })))} className="flex items-center gap-2 text-sm font-medium text-[#7C3AED] border border-[#7C3AED]/30 rounded-xl px-4 py-2 hover:bg-purple-50 transition-colors">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifs.map((n) => (
          <div key={n.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex gap-4 transition-all ${!n.read ? 'border-[#7C3AED]/30' : 'border-slate-100'}`}>
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{n.title}</h3>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />}
                </div>
                <div className="flex gap-1">
                  {!n.read && (
                    <button onClick={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => setNotifs((prev) => prev.filter((x) => x.id !== n.id))} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-rose-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-1">{n.message}</p>
              <p className="text-xs text-slate-400 mt-2">{n.date} · {n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorNotifications;
