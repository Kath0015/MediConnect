import React, { useState } from 'react';
import { Pill, Search, Plus, Eye, Download, Check, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const initialPrescriptions = [
  { id: 1, patient: 'Maria Santos', medication: 'Amlodipine 5mg', frequency: '1 tab once daily in morning', duration: '30 Days', date: '2026-08-10', status: 'Active', instructions: 'Take with or without food. Monitor blood pressure weekly.' },
  { id: 2, patient: 'Juan dela Cruz', medication: 'Metformin 500mg', frequency: '1 tab twice daily with meals', duration: '60 Days', date: '2026-08-08', status: 'Active', instructions: 'Take with morning and evening meals to minimize GI upset.' },
  { id: 3, patient: 'Ana Reyes', medication: 'Amoxicillin 500mg', frequency: '1 cap every 8 hours', duration: '7 Days', date: '2026-07-28', status: 'Completed', instructions: 'Complete the entire 7-day course even if symptoms resolve.' },
];

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingRx, setViewingRx] = useState(null);
  const [newRx, setNewRx] = useState({
    patient: '',
    medication: '',
    frequency: '1 tab once daily',
    duration: '30 Days',
    instructions: '',
  });

  const filtered = prescriptions.filter((p) =>
    p.patient.toLowerCase().includes(search.toLowerCase()) ||
    p.medication.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateRx = (e) => {
    e.preventDefault();
    if (!newRx.patient.trim() || !newRx.medication.trim()) {
      toast.error('Please enter patient and medication names');
      return;
    }
    const item = {
      id: Date.now(),
      ...newRx,
      date: new Date().toISOString().split('T')[0],
      status: 'Active',
    };
    setPrescriptions([item, ...prescriptions]);
    setIsCreateOpen(false);
    setNewRx({
      patient: '',
      medication: '',
      frequency: '1 tab once daily',
      duration: '30 Days',
      instructions: '',
    });
    toast.success(`Prescription for ${item.medication} issued to ${item.patient}`);
  };

  const handleDownloadRx = (rx) => {
    toast.success(`Downloading e-Prescription PDF for ${rx.patient} (${rx.medication})`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-[#7C3AED]" />
            Prescriptions
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Issue electronic prescriptions and view prescription history.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5B21B6] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Prescription
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient or medication..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  No prescriptions found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
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
              Generate an official digital prescription for patient pharmacy fulfillment.
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
                placeholder="e.g. Take with food. Avoid grapefruit."
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
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold"
              >
                Issue Prescription
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
              Prescription details recorded in MediConnect system.
            </DialogDescription>
          </DialogHeader>
          {viewingRx && (
            <div className="space-y-4 pt-2">
              <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="text-sm font-semibold text-slate-900">{viewingRx.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Medication:</span>
                  <span className="text-sm font-bold text-[#7C3AED]">{viewingRx.medication}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Frequency:</span>
                  <span className="text-sm text-slate-700">{viewingRx.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Duration:</span>
                  <span className="text-sm text-slate-700">{viewingRx.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date Issued:</span>
                  <span className="text-sm text-slate-700">{viewingRx.date}</span>
                </div>
                {viewingRx.instructions && (
                  <div className="pt-2 border-t border-purple-200">
                    <span className="text-xs text-slate-500 block mb-1">Doctor's Sig / Instructions:</span>
                    <p className="text-xs text-slate-800 italic">{viewingRx.instructions}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    handleDownloadRx(viewingRx);
                    setViewingRx(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
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

