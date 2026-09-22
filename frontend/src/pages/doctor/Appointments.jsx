import React, { useState, useEffect } from 'react';
import { Calendar, Search, Clock, CheckCircle, XCircle, Eye, Plus, Filter, User, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import api from '../../api/axios';

const statusConfig = {
  Confirmed: 'bg-[#009DD1]/10 text-[#009DD1] border-[#009DD1]/20',
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-[#009DD1]/10 text-[#009DD1] border-[#009DD1]/20',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
  cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
};

const DoctorAppointments = () => {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAppt, setNewAppt] = useState({
    patient: '',
    type: 'General Consultation',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    notes: '',
  });

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/appointments');
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      const mapped = list.map((a) => {
        const start = a.start_time ? new Date(a.start_time) : null;
        return {
          id: a.id,
          patient: a.patient?.user?.name || a.patient?.name || 'Walk-In Patient',
          type: a.appointment_type?.name || a.title || 'Consultation',
          date: start ? start.toISOString().split('T')[0] : '—',
          time: start ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
          status: a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Confirmed',
          notes: a.notes || a.description || 'Clinical consultation scheduled.',
        };
      });
      setAppts(mapped);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      toast.error('Failed to load appointments from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const filtered = appts.filter((a) => {
    const matchesSearch = a.patient?.toLowerCase().includes(search.toLowerCase()) || a.type?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'All' || a.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleConfirm = async (appt) => {
    try {
      await api.post(`/api/appointments/${appt.id}/confirm`);
      toast.success(`Appointment confirmed for ${appt.patient}!`);
      await loadAppointments();
    } catch (err) {
      console.error('Failed to confirm appointment:', err);
      toast.error('Failed to update appointment status');
    }
  };

  const handleComplete = async (appt) => {
    try {
      await api.post(`/api/appointments/${appt.id}/complete`);
      toast.success(`Appointment completed for ${appt.patient}!`);
      await loadAppointments();
    } catch (err) {
      console.error('Failed to complete appointment:', err);
      toast.error('Failed to complete appointment');
    }
  };

  const handleCancel = async (appt) => {
    if (!window.confirm(`Cancel appointment for ${appt.patient}?`)) return;
    try {
      await api.post(`/api/appointments/${appt.id}/cancel`, { reason: 'Doctor schedule adjustment' });
      toast.success(`Appointment cancelled`);
      await loadAppointments();
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      toast.error('Failed to cancel appointment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#7C3AED]" />
            Doctor Appointments
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Real-time database-backed consultation schedule and patient booking management.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAppointments}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#7C3AED]' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search appointments by patient name or type..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Confirmed', 'Pending', 'Completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Notes</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#7C3AED]" />
                    <span>Loading appointments from database...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  No appointments found in database.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{a.patient}</td>
                  <td className="px-5 py-4 text-slate-700 font-medium">{a.type}</td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{a.date}</td>
                  <td className="px-5 py-4 text-slate-600">{a.time}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusConfig[a.status] || statusConfig.Confirmed}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs max-w-xs truncate">{a.notes}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {a.status?.toLowerCase() === 'pending' && (
                        <button
                          onClick={() => handleConfirm(a)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold"
                        >
                          Confirm
                        </button>
                      )}
                      {a.status?.toLowerCase() === 'confirmed' && (
                        <button
                          onClick={() => handleComplete(a)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedAppt(a)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-[#7C3AED] transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {a.status?.toLowerCase() !== 'cancelled' && a.status?.toLowerCase() !== 'completed' && (
                        <button
                          onClick={() => handleCancel(a)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      <Dialog open={!!selectedAppt} onOpenChange={(open) => !open && setSelectedAppt(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Appointment Details</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Live consultation record from MediConnect clinical database.
            </DialogDescription>
          </DialogHeader>
          {selectedAppt && (
            <div className="space-y-4 pt-2 text-sm">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="font-bold text-slate-900">{selectedAppt.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Type:</span>
                  <span className="text-slate-800 font-medium">{selectedAppt.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date & Time:</span>
                  <span className="text-slate-700">{selectedAppt.date} at {selectedAppt.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Status:</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7C3AED]">
                    {selectedAppt.status}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <span className="text-xs text-slate-500 block mb-1">Clinical Notes:</span>
                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                    {selectedAppt.notes}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorAppointments;
