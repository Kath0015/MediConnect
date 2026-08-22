import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, FileText, Pill, FlaskConical, FileBadge, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const stats = [
  { label: "Today's Patients", value: 8, icon: Users, color: 'text-[#7C3AED]', bg: 'bg-[#7C3AED]/10', change: '+2 from yesterday' },
  { label: 'Appointments Today', value: 12, icon: Calendar, color: 'text-[#009DD1]', bg: 'bg-[#009DD1]/10', change: '3 remaining' },
  { label: 'Pending Lab Requests', value: 5, icon: FlaskConical, color: 'text-amber-500', bg: 'bg-amber-50', change: '2 results ready' },
  { label: 'Prescriptions Issued', value: 24, icon: Pill, color: 'text-[#26B170]', bg: 'bg-[#26B170]/10', change: 'This week' },
];

const upcomingAppointments = [
  { time: '10:00 AM', patient: 'Maria Santos', type: 'Follow-up', status: 'Confirmed' },
  { time: '11:00 AM', patient: 'Juan dela Cruz', type: 'Consultation', status: 'Confirmed' },
  { time: '02:00 PM', patient: 'Ana Reyes', type: 'Lab Review', status: 'Pending' },
  { time: '03:30 PM', patient: 'Pedro Lim', type: 'Follow-up', status: 'Confirmed' },
];

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    { label: 'Write Prescription', icon: Pill, color: 'bg-[#7C3AED]/10 text-[#7C3AED]', border: 'hover:border-[#7C3AED]/40', path: '/doctor/prescriptions' },
    { label: 'Request Lab', icon: FlaskConical, color: 'bg-[#009DD1]/10 text-[#009DD1]', border: 'hover:border-[#009DD1]/40', path: '/doctor/laboratory' },
    { label: 'Issue MedCert', icon: FileBadge, color: 'bg-[#26B170]/10 text-[#26B170]', border: 'hover:border-[#26B170]/40', path: '/doctor/medcerts' },
    { label: 'Add Medical Record', icon: FileText, color: 'bg-amber-50 text-amber-600', border: 'hover:border-amber-300', path: '/doctor/medical-records' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-purple-200 text-sm font-medium">Good morning,</p>
            <h1 className="text-2xl font-bold mt-1">Doctor Dashboard</h1>
            <p className="text-purple-200 mt-1 text-sm">{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-200" />
            <span className="text-sm text-purple-100">Office Hours: 8AM – 5PM</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-300" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-sm text-slate-600 mt-0.5">{s.label}</div>
              <div className="text-xs text-slate-400 mt-1">{s.change}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#7C3AED]" />
            Today's Appointments
          </h2>
          <div className="space-y-3">
            {upcomingAppointments.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-[#7C3AED]/5 transition-colors cursor-pointer"
                onClick={() => navigate('/doctor/appointments')}
              >
                <div className="text-xs font-mono text-slate-500 w-16 flex-shrink-0">{a.time}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{a.patient}</p>
                  <p className="text-xs text-slate-500">{a.type}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${a.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{a.status}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/doctor/appointments')}
            className="mt-4 w-full text-center text-sm text-[#7C3AED] font-medium hover:underline"
          >
            View all appointments →
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50 ${a.border} hover:bg-white transition-all duration-200 text-center group`}
                >
                  <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DoctorDashboard;
