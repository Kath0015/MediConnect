import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Search, CheckCircle, Clock, AlertCircle, Plus, User, Stethoscope, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { getCheckIns, createCheckIn, updateCheckInStatus, deleteCheckIn } from '../../api/Triage';

const ClinicianCheckIn = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPatient, setNewPatient] = useState({
    patient: '',
    purpose: 'General Consultation',
  });

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await getCheckIns();
      const mapped = (res.data || []).map((c) => ({
        id: c.id,
        queueNumber: c.queue_number,
        patient: c.patient_name,
        purpose: c.purpose || 'General Consultation',
        status: c.status || 'Waiting',
        arrivalTime: c.checked_in_at ? new Date(c.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
      }));
      setQueue(mapped);
    } catch (err) {
      console.error('Failed to load check-ins:', err);
      toast.error('Failed to load queue from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const filtered = queue.filter((p) =>
    p.patient?.toLowerCase().includes(search.toLowerCase()) ||
    p.queueNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.purpose?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateStatus = async (item, newStatus) => {
    try {
      await updateCheckInStatus(item.id, newStatus);
      toast.success(`${item.patient} status updated to ${newStatus}!`);
      await loadQueue();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update patient queue status');
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    if (!newPatient.patient.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await createCheckIn({
        patient_name: newPatient.patient,
        purpose: newPatient.purpose,
      });
      toast.success(`${res.patient_name} checked in! Queue: ${res.queue_number}`);
      setIsRegisterModalOpen(false);
      setNewPatient({ patient: '', purpose: 'General Consultation' });
      await loadQueue();
    } catch (err) {
      console.error('Failed to check in patient:', err);
      toast.error('Failed to register check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQueue = async (item) => {
    try {
      await deleteCheckIn(item.id);
      toast.success('Patient removed from queue');
      await loadQueue();
    } catch (err) {
      console.error('Failed to delete check-in:', err);
      toast.error('Failed to remove from queue');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#26B170]" />
            Patient Check-In & Queue
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Real-time database-backed patient arrival queue and consultation tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadQueue}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#26B170]' : ''}`} />
          </button>
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2 bg-[#26B170] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1E8E5A] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Check-In Walk-In Patient
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name, purpose, or queue number..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#26B170]/30 focus:border-[#26B170]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3">Queue #</th>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Purpose</th>
              <th className="px-5 py-3">Arrival Time</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#26B170]" />
                    <span>Loading queue from database...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  No active patients in clinic check-in queue.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[#26B170]">{p.queueNumber}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{p.patient}</td>
                  <td className="px-5 py-4 text-slate-600">{p.purpose}</td>
                  <td className="px-5 py-4 text-slate-600">{p.arrivalTime}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      p.status === 'In Consultation'
                        ? 'bg-blue-100 text-blue-700'
                        : p.status === 'Done'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {p.status === 'Waiting' && (
                        <button
                          onClick={() => handleUpdateStatus(p, 'In Consultation')}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold"
                        >
                          Call In
                        </button>
                      )}
                      {p.status === 'In Consultation' && (
                        <button
                          onClick={() => handleUpdateStatus(p, 'Done')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-semibold"
                        >
                          Mark Done
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/clinician/vitals')}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-[#26B170] transition-colors"
                        title="Record Vitals"
                      >
                        <Stethoscope className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQueue(p)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove from Queue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Check In Modal */}
      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Check-In Walk-In Patient</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Generate a queue number and add the patient to the live triage queue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterPatient} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={newPatient.patient}
                onChange={(e) => setNewPatient({ ...newPatient, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Reason / Purpose</label>
              <select
                value={newPatient.purpose}
                onChange={(e) => setNewPatient({ ...newPatient, purpose: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
              >
                <option value="General Consultation">General Consultation</option>
                <option value="Follow-up Checkup">Follow-up Checkup</option>
                <option value="Medical Certificate Request">Medical Certificate Request</option>
                <option value="Laboratory Test Review">Laboratory Test Review</option>
                <option value="Prescription Refill">Prescription Refill</option>
                <option value="Urgent Triage">Urgent Triage</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#26B170] hover:bg-[#1E8E5A] text-white text-xs font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Check-In Patient'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicianCheckIn;
