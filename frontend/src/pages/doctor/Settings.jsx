import React, { useState } from 'react';
import { Settings, Save, Clock, Stethoscope, Lock, Bell, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const DoctorSettings = () => {
  const [schedule, setSchedule] = useState({
    start: '08:00',
    end: '17:00',
    slotDuration: '30',
    maxPerDay: '20',
  });
  const [notifications, setNotifications] = useState({
    emailOnLabResult: true,
    smsOnAppointment: true,
    dailySummary: true,
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success('Consultation hours and schedule preferences saved successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#7C3AED]" />
          Doctor Settings
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Configure consultation hours, appointment slots, and preferences.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#7C3AED]" />
            Consultation Hours & Slot Setup
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Start Time</label>
              <input
                type="time"
                value={schedule.start}
                onChange={(e) => setSchedule({ ...schedule, start: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">End Time</label>
              <input
                type="time"
                value={schedule.end}
                onChange={(e) => setSchedule({ ...schedule, end: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Slot Duration (Mins)</label>
              <select
                value={schedule.slotDuration}
                onChange={(e) => setSchedule({ ...schedule, slotDuration: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Max Patients / Day</label>
              <input
                type="number"
                value={schedule.maxPerDay}
                onChange={(e) => setSchedule({ ...schedule, maxPerDay: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-[#7C3AED]" />
            Notification Preferences
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer hover:bg-purple-50/40 transition-colors">
              <span className="text-sm font-medium text-slate-700">Notify when lab results are uploaded</span>
              <input
                type="checkbox"
                checked={notifications.emailOnLabResult}
                onChange={(e) => setNotifications({ ...notifications, emailOnLabResult: e.target.checked })}
                className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED]"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer hover:bg-purple-50/40 transition-colors">
              <span className="text-sm font-medium text-slate-700">Receive alert when new appointment is booked</span>
              <input
                type="checkbox"
                checked={notifications.smsOnAppointment}
                onChange={(e) => setNotifications({ ...notifications, smsOnAppointment: e.target.checked })}
                className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED]"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#7C3AED] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#5B21B6] transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorSettings;

