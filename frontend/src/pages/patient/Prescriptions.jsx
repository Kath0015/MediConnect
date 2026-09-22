import React, { useState, useEffect } from 'react';
import { Pill, Search, Filter, Calendar, Clock, User, ChevronRight, Download, Eye, RotateCw, CheckCircle2, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { getPrescriptions } from '../../api/Prescriptions';

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  expired: { label: 'Expired', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedRx, setSelectedRx] = useState(null);
  const [refillRx, setRefillRx] = useState(null);

  const loadPatientPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await getPrescriptions();
      const mapped = (res.data || []).map((p) => {
        const firstMed = Array.isArray(p.medications) && p.medications[0] ? p.medications[0] : null;
        return {
          id: p.id,
          rxNumber: p.prescription_number,
          medication: firstMed?.name || 'Prescribed Medicine',
          dosage: firstMed?.dosage || '1 dose',
          frequency: firstMed?.frequency || 'As directed',
          prescribedBy: p.doctor_name || 'Attending Physician',
          date: p.date_prescribed || p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: (p.status || 'Active').toLowerCase(),
          duration: firstMed?.duration || 'Course duration',
          instructions: firstMed?.instructions || p.notes || 'Take as advised by doctor.',
          diagnosis: p.diagnosis || 'Clinical evaluation',
          pharmacy: 'MediConnect Central Pharmacy',
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
    loadPatientPrescriptions();
  }, []);

  const filtered = prescriptions.filter((p) => {
    const matchesSearch =
      p.medication.toLowerCase().includes(search.toLowerCase()) ||
      p.prescribedBy.toLowerCase().includes(search.toLowerCase()) ||
      p.rxNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDownload = (p) => {
    toast.success(`Printing official e-Prescription for ${p.medication}`);
    window.print();
  };

  const handleConfirmRefill = () => {
    if (!refillRx) return;
    toast.success(`Refill request for ${refillRx.medication} sent to ${refillRx.prescribedBy}!`);
    setRefillRx(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-[#009DD1]" /> My e-Prescriptions
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            View your doctor-prescribed medications and pharmacy orders saved in the clinical database.
          </p>
        </div>
        <button
          onClick={loadPatientPrescriptions}
          disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#009DD1]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by medication name or prescribing doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-[#009DD1] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Prescriptions List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-[#009DD1] mx-auto mb-2" />
          <p className="text-sm text-slate-500">Loading your prescriptions from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Pill className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700">No prescriptions found</h3>
          <p className="text-xs text-slate-400 mt-1">You have no active prescription records matching your search.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => {
            const sc = statusConfig[p.status] || statusConfig.active;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-[#009DD1]/40 transition-colors shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                      <Pill className="w-6 h-6 text-[#009DD1]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">{p.medication}</h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${sc.color}`}>
                          {sc.label}
                        </span>
                        {p.rxNumber && (
                          <span className="text-xs font-mono text-slate-400">({p.rxNumber})</span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-[#009DD1] mt-0.5">{p.dosage} — {p.frequency}</p>
                      <p className="text-xs text-slate-500 mt-1">Prescribed by: {p.prescribedBy} on {p.date}</p>
                      <p className="text-xs text-slate-600 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        Instructions: {p.instructions}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setSelectedRx(p)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(p)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Print Rx
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      <Dialog open={!!selectedRx} onOpenChange={(open) => !open && setSelectedRx(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#009DD1]" /> Official Prescription Record
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Verified clinical prescription issued by licensed healthcare staff.
            </DialogDescription>
          </DialogHeader>
          {selectedRx && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">RX Number:</span>
                  <span className="font-mono font-bold text-[#009DD1]">{selectedRx.rxNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Medication:</span>
                  <span className="font-bold text-slate-900">{selectedRx.medication}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Dosage:</span>
                  <span className="text-slate-700">{selectedRx.dosage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Frequency:</span>
                  <span className="text-slate-700">{selectedRx.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Prescribing Doctor:</span>
                  <span className="text-slate-700">{selectedRx.prescribedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date Issued:</span>
                  <span className="text-slate-700">{selectedRx.date}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <span className="text-xs text-slate-500 block mb-1">Doctor's Special Instructions:</span>
                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 italic">
                    {selectedRx.instructions}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => handleDownload(selectedRx)}
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

export default Prescriptions;
