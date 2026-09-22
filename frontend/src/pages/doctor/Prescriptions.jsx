import React, { useState, useEffect } from 'react';
import { Pill, Search, Plus, Eye, Download, Check, FileText, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { getPrescriptions, createPrescription, deletePrescription } from '../../api/Prescriptions';

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingRx, setViewingRx] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRx, setNewRx] = useState({
    patient: '',
    diagnosis: 'General Consultation',
    medication: '',
    dosage: '1 tablet',
    frequency: '1 tab once daily',
    duration: '30 Days',
    instructions: '',
  });

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await getPrescriptions();
      const mapped = (res.data || []).map((p) => {
        const firstMed = Array.isArray(p.medications) && p.medications[0] ? p.medications[0] : null;
        return {
          id: p.id,
          rxNumber: p.prescription_number,
          patient: p.patient_name,
          diagnosis: p.diagnosis || 'Clinical evaluation',
          medication: firstMed?.name || 'Medication Prescribed',
          frequency: firstMed?.frequency || p.notes || 'As directed',
          duration: firstMed?.duration || '14 Days',
          instructions: firstMed?.instructions || p.notes || 'Take as instructed by physician.',
          date: p.date_prescribed || p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: p.status || 'Active',
          doctor: p.doctor_name || 'Dr. Attending Physician',
          medications: p.medications || [],
        };
      });
      setPrescriptions(mapped);
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
      toast.error('Failed to load prescriptions from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const filtered = prescriptions.filter((p) =>
    p.patient?.toLowerCase().includes(search.toLowerCase()) ||
    p.medication?.toLowerCase().includes(search.toLowerCase()) ||
    p.rxNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateRx = async (e) => {
    e.preventDefault();
    if (!newRx.patient.trim() || !newRx.medication.trim()) {
      toast.error('Please enter patient and medication names');
      return;
    }
    try {
      setIsSubmitting(true);
      await createPrescription({
        patient_name: newRx.patient,
        diagnosis: newRx.diagnosis || 'Clinical evaluation',
        medications: [
          {
            name: newRx.medication,
            dosage: newRx.dosage,
            frequency: newRx.frequency,
            duration: newRx.duration,
            instructions: newRx.instructions,
          },
        ],
        notes: newRx.instructions,
        status: 'Active',
      });
      toast.success(`e-Prescription saved to database for ${newRx.patient}`);
      setIsCreateOpen(false);
      setNewRx({
        patient: '',
        diagnosis: 'General Consultation',
        medication: '',
        dosage: '1 tablet',
        frequency: '1 tab once daily',
        duration: '30 Days',
        instructions: '',
      });
      await loadPrescriptions();
    } catch (err) {
      console.error('Failed to issue prescription:', err);
      toast.error('Failed to save prescription to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRx = async (rx) => {
    if (!window.confirm(`Are you sure you want to delete prescription for ${rx.patient}?`)) return;
    try {
      await deletePrescription(rx.id);
      toast.success('Prescription deleted from database');
      if (viewingRx?.id === rx.id) setViewingRx(null);
      await loadPrescriptions();
    } catch (err) {
      console.error('Failed to delete prescription:', err);
      toast.error('Failed to delete prescription');
    }
  };

  const handleDownloadRx = (rx) => {
    toast.success(`Printing official e-Prescription for ${rx.patient}`);
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-[#7C3AED]" />
            Prescriptions
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Real-time database-backed electronic prescriptions and pharmacy records.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadPrescriptions}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#7C3AED]' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5B21B6] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Prescription
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient, medication, or RX number..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3">RX #</th>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Medication</th>
              <th className="px-5 py-3">Dosage & Frequency</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Date Issued</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#7C3AED]" />
                    <span>Loading prescriptions from database...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  No prescriptions found in database.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-[#7C3AED]">{p.rxNumber}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{p.patient}</td>
                  <td className="px-5 py-4 font-medium text-[#7C3AED]">{p.medication}</td>
                  <td className="px-5 py-4 text-slate-600">{p.frequency}</td>
                  <td className="px-5 py-4 text-slate-600">{p.duration}</td>
                  <td className="px-5 py-4 text-slate-600">{p.date}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingRx(p)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-[#7C3AED] transition-colors"
                        title="View Prescription"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadRx(p)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-[#7C3AED] transition-colors"
                        title="Print/Download Rx"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRx(p)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Rx"
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

      {/* Create Prescription Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Create e-Prescription</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Generate an official digital prescription saved directly to the database.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRx} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={newRx.patient}
                onChange={(e) => setNewRx({ ...newRx, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Diagnosis</label>
              <input
                type="text"
                placeholder="e.g. Acute Upper Respiratory Infection"
                value={newRx.diagnosis}
                onChange={(e) => setNewRx({ ...newRx, diagnosis: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Medication Name & Strength</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amlodipine 5mg"
                  value={newRx.medication}
                  onChange={(e) => setNewRx({ ...newRx, medication: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Duration</label>
                <select
                  value={newRx.duration}
                  onChange={(e) => setNewRx({ ...newRx, duration: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
                >
                  <option value="7 Days">7 Days</option>
                  <option value="14 Days">14 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90 Days">90 Days</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Dosage & Frequency</label>
              <input
                type="text"
                required
                placeholder="e.g. 1 tablet once daily in the morning"
                value={newRx.frequency}
                onChange={(e) => setNewRx({ ...newRx, frequency: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Special Instructions (Sig)</label>
              <textarea
                rows={2}
                placeholder="e.g. Take after meals. Complete full 7-day course."
                value={newRx.instructions}
                onChange={(e) => setNewRx({ ...newRx, instructions: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Saving to DB...' : 'Issue Prescription'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Prescription Modal */}
      <Dialog open={!!viewingRx} onOpenChange={(open) => !open && setViewingRx(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#7C3AED]" /> Official e-Prescription
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Prescription details recorded in MediConnect database.
            </DialogDescription>
          </DialogHeader>
          {viewingRx && (
            <div className="space-y-4 pt-2">
              <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">RX Number:</span>
                  <span className="text-sm font-mono font-bold text-[#7C3AED]">{viewingRx.rxNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="text-sm font-semibold text-slate-900">{viewingRx.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Diagnosis:</span>
                  <span className="text-sm text-slate-700">{viewingRx.diagnosis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Physician:</span>
                  <span className="text-sm text-slate-700">{viewingRx.doctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date Issued:</span>
                  <span className="text-sm text-slate-700">{viewingRx.date}</span>
                </div>
                <div className="border-t border-purple-100 pt-2 mt-2">
                  <div className="text-xs text-slate-500 mb-1">Medications:</div>
                  {viewingRx.medications && viewingRx.medications.length > 0 ? (
                    viewingRx.medications.map((m, i) => (
                      <div key={i} className="text-xs bg-white p-2 rounded-lg border border-purple-100 mb-1">
                        <div className="font-bold text-[#7C3AED]">{m.name}</div>
                        <div className="text-slate-600">{m.dosage} — {m.frequency} ({m.duration})</div>
                        {m.instructions && <div className="text-slate-500 italic mt-0.5">{m.instructions}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm font-bold text-[#7C3AED]">{viewingRx.medication}</div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-slate-500">Status:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    viewingRx.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {viewingRx.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => handleDownloadRx(viewingRx)}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Print Rx
                </button>
                <button
                  onClick={() => setViewingRx(null)}
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

export default DoctorPrescriptions;
