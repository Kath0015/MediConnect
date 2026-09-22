import React, { useState, useEffect } from 'react';
import { Pill, Search, Eye, Download, Plus, Calendar, User, Stethoscope, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { getPrescriptions, createPrescription, deletePrescription } from '../../api/Prescriptions';

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRx, setNewRx] = useState({
    patient: '',
    medication: '',
    doctor: 'Dr. Jose Santos',
    dosage: '1 tablet once daily',
    instructions: 'Take after meals.',
  });

  const loadAllPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await getPrescriptions();
      const mapped = (res.data || []).map((r) => {
        const firstMed = Array.isArray(r.medications) && r.medications[0] ? r.medications[0] : null;
        return {
          id: r.id,
          rxNumber: r.prescription_number,
          patient: r.patient_name,
          medication: firstMed?.name || 'Prescription',
          doctor: r.doctor_name || 'Dr. Physician',
          date: r.date_prescribed || r.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          dosage: firstMed ? `${firstMed.dosage || ''} ${firstMed.frequency || ''}`.trim() : r.notes || 'As prescribed',
          status: r.status || 'Active',
          instructions: firstMed?.instructions || r.notes || 'As advised.',
          medications: r.medications || [],
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
    loadAllPrescriptions();
  }, []);

  const filtered = prescriptions.filter((r) =>
    r.patient?.toLowerCase().includes(search.toLowerCase()) ||
    r.medication?.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor?.toLowerCase().includes(search.toLowerCase()) ||
    r.rxNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleIssueRx = async (e) => {
    e.preventDefault();
    if (!newRx.patient.trim() || !newRx.medication.trim()) {
      toast.error('Please enter patient and medication details');
      return;
    }
    try {
      setIsSubmitting(true);
      await createPrescription({
        patient_name: newRx.patient,
        doctor_name: newRx.doctor,
        diagnosis: 'Consultation & Medication Order',
        medications: [
          {
            name: newRx.medication,
            dosage: newRx.dosage,
            frequency: 'As prescribed',
            duration: '30 Days',
            instructions: newRx.instructions,
          },
        ],
        notes: newRx.instructions,
        status: 'Active',
      });
      toast.success(`e-Prescription issued for ${newRx.patient} and saved to database!`);
      setIsIssueOpen(false);
      setNewRx({ patient: '', medication: '', doctor: 'Dr. Jose Santos', dosage: '1 tablet once daily', instructions: 'Take after meals.' });
      await loadAllPrescriptions();
    } catch (err) {
      console.error('Failed to issue prescription:', err);
      toast.error('Failed to save prescription to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRx = async (rx) => {
    if (!window.confirm(`Delete prescription ${rx.rxNumber || rx.id}?`)) return;
    try {
      await deletePrescription(rx.id);
      toast.success('Prescription deleted from database');
      if (selectedRx?.id === rx.id) setSelectedRx(null);
      await loadAllPrescriptions();
    } catch (err) {
      console.error('Failed to delete prescription:', err);
      toast.error('Failed to delete prescription');
    }
  };

  const handleDownloadPdf = (rx) => {
    toast.success(`Printing e-Prescription for ${rx.medication}`);
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-[#009DD1]" /> Prescriptions Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Real-time database-backed clinic electronic prescriptions, dispensed drugs, and refills.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAllPrescriptions}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#009DD1]' : ''}`} />
          </button>
          <button
            onClick={() => setIsIssueOpen(true)}
            className="flex items-center gap-2 bg-[#009DD1] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#01377D] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Issue e-Prescription
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by patient, medication, doctor, or RX number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">RX #</th>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Medication</th>
              <th className="px-5 py-3">Prescribing Doctor</th>
              <th className="px-5 py-3">Dosage & Sig</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#009DD1]" />
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
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-[#009DD1] font-semibold">{r.rxNumber || `RX-${r.id}`}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{r.patient}</td>
                  <td className="px-5 py-4 font-medium text-slate-800">{r.medication}</td>
                  <td className="px-5 py-4 text-slate-600">{r.doctor}</td>
                  <td className="px-5 py-4 text-slate-600 max-w-xs truncate">{r.dosage}</td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{r.date}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      r.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 flex items-center gap-1">
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
                      title="Print PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRx(r)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Issue Modal */}
      <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#009DD1]" /> Issue e-Prescription
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create an official digital prescription stored in the database.
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
              <label className="text-xs font-semibold text-slate-700 block mb-1">Medication Name & Strength</label>
              <input
                type="text"
                required
                placeholder="e.g. Amoxicillin 500mg"
                value={newRx.medication}
                onChange={(e) => setNewRx({ ...newRx, medication: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Prescribing Doctor</label>
              <input
                type="text"
                required
                value={newRx.doctor}
                onChange={(e) => setNewRx({ ...newRx, doctor: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Dosage & Sig</label>
              <input
                type="text"
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
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Issue Prescription'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={!!selectedRx} onOpenChange={(open) => !open && setSelectedRx(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#009DD1]" /> Official e-Prescription Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Verified clinical prescription stored in the database.
            </DialogDescription>
          </DialogHeader>
          {selectedRx && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">RX ID:</span>
                  <span className="font-mono font-bold text-[#009DD1]">{selectedRx.rxNumber || `RX-${selectedRx.id}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="font-bold text-slate-900">{selectedRx.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Medication:</span>
                  <span className="font-semibold text-slate-800">{selectedRx.medication}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Doctor:</span>
                  <span className="text-slate-700">{selectedRx.doctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Dosage:</span>
                  <span className="text-slate-700">{selectedRx.dosage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date:</span>
                  <span className="text-slate-700">{selectedRx.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Status:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    {selectedRx.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => handleDownloadPdf(selectedRx)}
                  className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Print Rx
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
