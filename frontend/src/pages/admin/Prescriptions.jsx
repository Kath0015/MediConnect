import React, { useState } from 'react';
import { Pill, Search, Eye, Download, Plus, Calendar, User, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const initialRx = [
  { id: 1, patient: 'Maria Santos', medication: 'Amoxicillin 500mg', doctor: 'Dr. Santos', date: '2026-08-10', refills: 2, dosage: '1 capsule 3x daily with meals for 7 days', status: 'Active' },
  { id: 2, patient: 'Juan dela Cruz', medication: 'Metformin 500mg', doctor: 'Dr. Reyes', date: '2026-08-08', refills: 5, dosage: '1 tablet 2x daily with meals', status: 'Active' },
  { id: 3, patient: 'Ana Reyes', medication: 'Losartan 50mg', doctor: 'Dr. Cruz', date: '2026-06-15', refills: 0, dosage: '1 tablet once daily every morning', status: 'Expired' },
  { id: 4, patient: 'Pedro Lim', medication: 'Aspirin 81mg', doctor: 'Dr. Santos', date: '2026-08-15', refills: 11, dosage: '1 tablet once daily after lunch', status: 'Active' },
];

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState(initialRx);
  const [search, setSearch] = useState('');
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [newRx, setNewRx] = useState({
    patient: '',
    medication: '',
    doctor: 'Dr. Santos',
    dosage: '1 tablet once daily',
    refills: '2',
  });

  const filtered = prescriptions.filter((r) =>
    r.patient.toLowerCase().includes(search.toLowerCase()) ||
    r.medication.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor.toLowerCase().includes(search.toLowerCase())
  );

  const handleIssueRx = (e) => {
    e.preventDefault();
    if (!newRx.patient.trim() || !newRx.medication.trim()) {
      toast.error('Please enter patient and medication details');
      return;
    }
    const item = {
      id: Date.now(),
      patient: newRx.patient,
      medication: newRx.medication,
      doctor: newRx.doctor,
      date: new Date().toISOString().split('T')[0],
      refills: parseInt(newRx.refills) || 0,
      dosage: newRx.dosage,
      status: 'Active',
    };
    setPrescriptions([item, ...prescriptions]);
    setIsIssueOpen(false);
    setNewRx({ patient: '', medication: '', doctor: 'Dr. Santos', dosage: '1 tablet once daily', refills: '2' });
    toast.success(`e-Prescription issued for ${item.patient}!`);
  };

  const handleDownloadPdf = (rx) => {
    toast.success(`Downloading e-Prescription PDF for ${rx.medication}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-[#009DD1]" /> Prescriptions
          </h1>
          <p className="text-slate-500 mt-1 text-sm">View and manage electronic prescriptions issued in the clinic.</p>
        </div>
        <button
          onClick={() => setIsIssueOpen(true)}
          className="flex items-center gap-2 bg-[#009DD1] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#01377D] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Issue e-Prescription
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prescriptions by patient, medication, or doctor..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Patient', 'Medication', 'Doctor', 'Date', 'Refills', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
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
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900">{r.patient}</td>
                  <td className="px-5 py-4 text-slate-700 font-semibold">{r.medication}</td>
                  <td className="px-5 py-4 text-slate-600">{r.doctor}</td>
                  <td className="px-5 py-4 text-slate-600">{r.date}</td>
                  <td className="px-5 py-4 text-slate-600">{r.refills} refills</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        r.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 flex gap-1">
                    <button
                      onClick={() => setSelectedRx(r)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#009DD1] transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(r)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#009DD1] transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Issue Rx Modal */}
      <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#009DD1]" /> Issue e-Prescription
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create and sign an electronic prescription.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleIssueRx} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={newRx.patient}
                onChange={(e) => setNewRx({ ...newRx, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Medication & Strength</label>
              <input
                type="text"
                required
                placeholder="e.g. Amoxicillin 500mg"
                value={newRx.medication}
                onChange={(e) => setNewRx({ ...newRx, medication: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Prescribing Doctor</label>
                <select
                  value={newRx.doctor}
                  onChange={(e) => setNewRx({ ...newRx, doctor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
                >
                  <option value="Dr. Santos">Dr. Santos (Internal Medicine)</option>
                  <option value="Dr. Reyes">Dr. Reyes (Pediatrics)</option>
                  <option value="Dr. Cruz">Dr. Cruz (Cardiology)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Refills Allowed</label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={newRx.refills}
                  onChange={(e) => setNewRx({ ...newRx, refills: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Dosage & Instructions</label>
              <textarea
                rows={2}
                required
                placeholder="e.g. 1 capsule 3x daily with meals for 7 days"
                value={newRx.dosage}
                onChange={(e) => setNewRx({ ...newRx, dosage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsIssueOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold"
              >
                Issue e-Rx
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Rx Modal */}
      <Dialog open={!!selectedRx} onOpenChange={(open) => !open && setSelectedRx(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#009DD1]" /> e-Prescription Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Official electronic prescription information.
            </DialogDescription>
          </DialogHeader>
          {selectedRx && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="text-sm font-bold text-slate-900">{selectedRx.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Medication:</span>
                  <span className="text-sm font-bold text-[#009DD1]">{selectedRx.medication}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Doctor:</span>
                  <span className="text-sm text-slate-700">{selectedRx.doctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date Issued:</span>
                  <span className="text-sm text-slate-700">{selectedRx.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Refills Remaining:</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedRx.refills}</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Instructions / Sig:</span>
                  <p className="text-xs text-slate-700 italic">{selectedRx.dosage}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => handleDownloadPdf(selectedRx)}
                  className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download e-Rx PDF
                </button>
                <button
                  onClick={() => setSelectedRx(null)}
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

export default AdminPrescriptions;

