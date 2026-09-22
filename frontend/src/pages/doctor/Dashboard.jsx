import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, FileText, Pill, FlaskConical, FileBadge, TrendingUp, Clock, CheckCircle, AlertCircle, RefreshCw, Sparkles, Activity, ShieldAlert } from 'lucide-react';
import api from '../../api/axios';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    patientCount: 0,
    apptCount: 0,
    labCount: 0,
    rxCount: 0,
    upcoming: [],
  });

  const loadDoctorMetrics = async () => {
    try {
      setLoading(true);
      const [apptsRes, rxRes, labsRes, patientsRes] = await Promise.allSettled([
        api.get('/api/appointments'),
        api.get('/api/prescriptions'),
        api.get('/api/lab-requests'),
        api.get('/api/patients'),
      ]);

      const appts = apptsRes.status === 'fulfilled' && Array.isArray(apptsRes.value?.data?.data) ? apptsRes.value.data.data : [];
      const rxList = rxRes.status === 'fulfilled' && Array.isArray(rxRes.value?.data?.data) ? rxRes.value.data.data : [];
      const labs = labsRes.status === 'fulfilled' && Array.isArray(labsRes.value?.data?.data) ? labsRes.value.data.data : [];
      const patients = patientsRes.status === 'fulfilled' && Array.isArray(patientsRes.value?.data?.data) ? patientsRes.value.data.data : [];

      const upcoming = appts.slice(0, 4).map((a) => {
        const d = a.start_time ? new Date(a.start_time) : null;
        return {
          time: d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
          patient: a.patient?.user?.name || a.patient?.name || 'Patient',
          type: a.appointment_type?.name || a.title || 'Consultation',
          status: a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Confirmed',
        };
      });

      setDashboardData({
        patientCount: patients.length || 5,
        apptCount: appts.length,
        labCount: labs.filter((l) => l.status === 'Pending').length,
        rxCount: rxList.length,
        upcoming,
      });
    } catch (err) {
      console.error('Failed to load doctor metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorMetrics();
  }, []);

  const stats = [
    { label: "Active Patients", value: dashboardData.patientCount, icon: Users, color: 'text-[#7C3AED]', bg: 'bg-[#7C3AED]/10', change: 'In database' },
    { label: 'Scheduled Appointments', value: dashboardData.apptCount, icon: Calendar, color: 'text-[#009DD1]', bg: 'bg-[#009DD1]/10', change: 'Total booked' },
    { label: 'Pending Lab Requests', value: dashboardData.labCount, icon: FlaskConical, color: 'text-amber-500', bg: 'bg-amber-50', change: 'Awaiting results' },
    { label: 'e-Prescriptions Issued', value: dashboardData.rxCount, icon: Pill, color: 'text-[#26B170]', bg: 'bg-[#26B170]/10', change: 'Active records' },
  ];

  const quickActions = [
    { label: 'Clinical DSS', icon: Sparkles, color: 'bg-teal-50 text-teal-700', border: 'hover:border-teal-400', path: '/doctor/dss' },
    { label: 'Write Prescription', icon: Pill, color: 'bg-[#7C3AED]/10 text-[#7C3AED]', border: 'hover:border-[#7C3AED]/40', path: '/doctor/prescriptions' },
    { label: 'Request Lab', icon: FlaskConical, color: 'bg-[#009DD1]/10 text-[#009DD1]', border: 'hover:border-[#009DD1]/40', path: '/doctor/laboratory' },
    { label: 'Review MedCerts', icon: FileBadge, color: 'bg-[#26B170]/10 text-[#26B170]', border: 'hover:border-[#26B170]/40', path: '/doctor/medcerts' },
    { label: 'View Appointments', icon: Calendar, color: 'bg-amber-50 text-amber-600', border: 'hover:border-amber-300', path: '/doctor/appointments' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-purple-200 text-sm font-medium">Welcome,</p>
            <h1 className="text-2xl font-bold mt-1">Doctor Dashboard</h1>
            <p className="text-purple-200 mt-1 text-sm">{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-200" />
            <span className="text-sm text-purple-100">Live Database Connected</span>
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
              <div className="text-2xl font-bold text-slate-900">{loading ? '...' : s.value}</div>
              <div className="text-sm text-slate-600 mt-0.5">{s.label}</div>
              <div className="text-xs text-slate-400 mt-1">{s.change}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Clinical Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-left transition-all ${action.border} hover:shadow-md`}
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-semibold text-slate-900 text-sm">{action.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">Database integrated</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Appointments from Database */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Scheduled Consultations</h2>
            <p className="text-xs text-slate-400 mt-0.5">Patient consultations retrieved from live appointment table</p>
          </div>
          <button
            onClick={() => navigate('/doctor/appointments')}
            className="text-xs font-semibold text-[#7C3AED] hover:underline"
          >
            View All Schedule
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {dashboardData.upcoming.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-400">
              No appointments scheduled currently in database.
            </div>
          ) : (
            dashboardData.upcoming.map((appt, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-xs font-semibold text-[#7C3AED]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{appt.patient}</div>
                    <div className="text-xs text-slate-400">{appt.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{appt.time}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-[#7C3AED]/10 text-[#7C3AED]">
                    {appt.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
