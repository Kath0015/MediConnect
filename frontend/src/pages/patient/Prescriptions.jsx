import React, { useState } from 'react';
import { Pill, Search, Filter, Calendar, Clock, User, ChevronRight, Download, Eye, RotateCw, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const initialPrescriptions = [
  {
    id: 1,
    medication: 'Amoxicillin 500mg',
    dosage: '1 capsule 3x daily',
    prescribedBy: 'Dr. Santos',
    date: '2026-08-10',
    refills: 2,
    status: 'active',
    duration: '7 Days',
    instructions: 'Take with food. Complete the full antibiotic course even if feeling better.',
    pharmacy: 'MediConnect Central Pharmacy',
  },
  {
    id: 2,
    medication: 'Metformin 500mg',
    dosage: '1 tablet 2x daily',
    prescribedBy: 'Dr. Reyes',
    date: '2026-07-28',
    refills: 5,
    status: 'active',
    duration: '60 Days',
    instructions: 'Take with morning and evening meals to minimize GI discomfort.',
    pharmacy: 'MediConnect Central Pharmacy',
  },
  {
    id: 3,
    medication: 'Losartan 50mg',
    dosage: '1 tablet once daily',
    prescribedBy: 'Dr. Santos',
    date: '2026-06-15',
    refills: 0,
    status: 'expired',
    duration: '30 Days',
    instructions: 'Take in the morning with a full glass of water. Monitor blood pressure weekly.',
    pharmacy: 'MediConnect Central Pharmacy',
  },
  {
    id: 4,
    medication: 'Cetirizine 10mg',
    dosage: '1 tablet once daily',
    prescribedBy: 'Dr. Cruz',
    date: '2026-08-01',
    refills: 1,
    status: 'active',
    duration: '14 Days',
    instructions: 'Take at bedtime. May cause mild drowsiness.',
    pharmacy: 'MediConnect Central Pharmacy',
  },
];

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  expired: { label: 'Expired', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedRx, setSelectedRx] = useState(null);
  const [refillRx, setRefillRx] = useState(null);

  const filtered = prescriptions.filter((p) => {
    const matchesSearch =
      p.medication.toLowerCase().includes(search.toLowerCase()) ||
      p.prescribedBy.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDownload = (p) => {
    toast.success(`Downloading e-Prescription PDF for ${p.medication}`);
  };

  const handleConfirmRefill = () => {
    if (!refillRx) return;
    toast.success(`Refill request for ${refillRx.medication} submitted to ${refillRx.prescribedBy}!`);
    setRefillRx(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-[#009DD1]" />
            Prescriptions
          </h1>
          <p className="text-slate-500 mt-1 text-sm">View and manage your current and past prescriptions.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
          <Calendar className="w-4 h-4 text-[#009DD1]" />
          <span>{new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active', count: prescriptions.filter((p) => p.status === 'active').length, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Expired', count: prescriptions.filter((p) => p.status === 'expired').length, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
          { label: 'Total', count: prescriptions.length, color: 'text-[#009DD1]', bg: 'bg-[#009DD1]/5 border-[#009DD1]/10' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-5 ${s.bg} flex items-center gap-4`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-sm text-slate-600 font-medium">{s.label} Prescriptions</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medication or doctor..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'expired'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 capitalize ${
                filter === f
                  ? 'bg-[#01377D] text-white border-[#01377D] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#009DD1] hover:text-[#009DD1]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
            <Pill className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No prescriptions found</p>
          </div>
        ) : (
          filtered.map((p) => {
            const sc = statusConfig[p.status];
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all duration-200 hover:border-[#009DD1]/30">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#009DD1]/10 flex items-center justify-center flex-shrink-0">
                      <Pill className="w-5 h-5 text-[#009DD1]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{p.medication}</h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${sc.color}`}>{sc.label}</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{p.dosage}</p>
                      <p className="text-xs text-slate-400 mt-1 italic">{p.instructions}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.status === 'active' && p.refills > 0 && (
                      <button
                        onClick={() => setRefillRx(p)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#009DD1]/10 text-[#009DD1] hover:bg-[#009DD1] hover:text-white transition-all flex items-center gap-1"
                      >
                        <RotateCw className="w-3.5 h-3.5" /> Request Refill
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedRx(p)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-[#009DD1] transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(p)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-[#009DD1] transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-5 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{p.prescribedBy}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(p.date).toLocaleDateString('en-PH', { dateStyle: 'medium' })}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{p.refills} refill{p.refills !== 1 ? 's' : ''} remaining</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Details Modal */}
      <Dialog open={!!selectedRx} onOpenChange={(open) => !open && setSelectedRx(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#009DD1]" /> Prescription Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Official e-Prescription information and doctor instructions.
            </DialogDescription>
          </DialogHeader>
          {selectedRx && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Medication:</span>
                  <span className="text-sm font-bold text-[#009DD1]">{selectedRx.medication}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Prescribing Doctor:</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedRx.prescribedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Dosage / Frequency:</span>
                  <span className="text-sm text-slate-700">{selectedRx.dosage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Duration:</span>
                  <span className="text-sm text-slate-700">{selectedRx.duration || '30 Days'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Refills Left:</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedRx.refills}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date Issued:</span>
                  <span className="text-sm text-slate-700">{selectedRx.date}</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Doctor's Instructions:</span>
                  <p className="text-xs text-slate-700 italic">{selectedRx.instructions}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    handleDownload(selectedRx);
                    setSelectedRx(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download e-Rx
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

      {/* Refill Request Modal */}
      <Dialog open={!!refillRx} onOpenChange={(open) => !open && setRefillRx(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <RotateCw className="w-5 h-5 text-[#009DD1]" /> Request Prescription Refill
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit an electronic refill request to your doctor.
            </DialogDescription>
          </DialogHeader>
          {refillRx && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-slate-700">
                Are you sure you want to request a refill for <strong className="text-slate-900">{refillRx.medication}</strong> ({refillRx.refills} refills remaining)?
              </p>
              <div className="bg-[#009DD1]/5 border border-[#009DD1]/20 p-3 rounded-xl text-xs text-slate-600">
                Your doctor ({refillRx.prescribedBy}) will review and approve the refill request. You will be notified once ready.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setRefillRx(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRefill}
                  className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold"
                >
                  Confirm Request
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

