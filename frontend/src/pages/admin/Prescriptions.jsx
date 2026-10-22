import React, { useState, useEffect } from 'react';
import { Pill, Search, Eye, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { getPrescriptions } from '../../api/Prescriptions';
import { formatAdminDate } from '../../utils/formatters';
import { getStatusBadgeTokens } from '../../utils/statusTokens';

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRx, setSelectedRx] = useState(null);

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
          date: formatAdminDate(r.date_prescribed || r.created_at),
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
          <p className="text-slate-500 mt-1 text-sm">Read-only prescription records for operational review and audit.</p>
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
                      getStatusBadgeTokens(r.status)
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeTokens(selectedRx.status)}`}>
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
