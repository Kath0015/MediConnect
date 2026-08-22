import React, { useState } from 'react';
import { FlaskConical, Search, Eye, Download, Plus, Clock, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const initialLabs = [
  { id: 1, patient: 'Maria Santos', test: 'Complete Blood Count (CBC)', requestedBy: 'Dr. Santos', date: '2026-08-12', status: 'Completed', result: 'Normal', values: 'WBC: 6.8 x10^9/L, RBC: 4.5 x10^12/L, Hgb: 13.5 g/dL, Hct: 40%' },
  { id: 2, patient: 'Juan dela Cruz', test: 'Fasting Blood Sugar (FBS)', requestedBy: 'Dr. Reyes', date: '2026-08-14', status: 'Pending', result: '—', values: 'Pending lab processing' },
  { id: 3, patient: 'Ana Reyes', test: 'Urinalysis', requestedBy: 'Dr. Cruz', date: '2026-08-10', status: 'Completed', result: 'Abnormal', values: 'Color: Yellow, Turbidity: Slightly Hazy, Pus Cells: 8-10/hpf' },
  { id: 4, patient: 'Pedro Lim', test: 'ECG', requestedBy: 'Dr. Santos', date: '2026-08-15', status: 'In Progress', result: '—', values: 'Processing 12-lead strip evaluation' },
  { id: 5, patient: 'Rosa Garcia', test: 'Lipid Profile', requestedBy: 'Dr. Reyes', date: '2026-08-09', status: 'Completed', result: 'Normal', values: 'Total Cholesterol: 180 mg/dL, HDL: 55 mg/dL, LDL: 100 mg/dL' },
];

const statusConfig = {
  Completed: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-blue-100 text-blue-700',
};

const AdminLaboratory = () => {
  const [labs, setLabs] = useState(initialLabs);
  const [search, setSearch] = useState('');
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [newLab, setNewLab] = useState({
    patient: '',
    test: 'Complete Blood Count (CBC)',
    requestedBy: 'Dr. Santos',
  });

  const filtered = labs.filter((l) =>
    l.patient.toLowerCase().includes(search.toLowerCase()) ||
    l.test.toLowerCase().includes(search.toLowerCase()) ||
    l.requestedBy.toLowerCase().includes(search.toLowerCase())
  );

  const handleOrderLab = (e) => {
    e.preventDefault();
    if (!newLab.patient.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    const item = {
      id: Date.now(),
      patient: newLab.patient,
      test: newLab.test,
      requestedBy: newLab.requestedBy,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      result: '—',
      values: 'Specimen sample awaiting technician evaluation',
    };
    setLabs([item, ...labs]);
    setIsOrderOpen(false);
    setNewLab({ patient: '', test: 'Complete Blood Count (CBC)', requestedBy: 'Dr. Santos' });
    toast.success(`Diagnostic order for ${item.test} created!`);
  };

  const handleDownloadReport = (lab) => {
    toast.success(`Downloading diagnostic laboratory report for ${lab.patient}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-[#009DD1]" /> Laboratory
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage laboratory test requests, specimen processing, and results.</p>
        </div>
        <button
          onClick={() => setIsOrderOpen(true)}
          className="flex items-center gap-2 bg-[#009DD1] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#01377D] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Order Diagnostic Test
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Tests', count: labs.length, color: 'text-[#009DD1]', bg: 'bg-[#009DD1]/5 border-[#009DD1]/10' },
          { label: 'Completed', count: labs.filter((l) => l.status === 'Completed').length, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Pending', count: labs.filter((l) => l.status === 'Pending').length, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-5 ${s.bg} flex items-center gap-4`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-sm text-slate-600 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search lab tests by patient, test name, or doctor..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Patient', 'Test', 'Requested By', 'Date', 'Result', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4 font-medium text-slate-900 whitespace-nowrap">{l.patient}</td>
                <td className="px-5 py-4 text-slate-700">{l.test}</td>
                <td className="px-5 py-4 text-slate-600">{l.requestedBy}</td>
                <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{l.date}</td>
                <td className="px-5 py-4 text-slate-600">{l.result}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[l.status]}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-5 py-4 flex gap-1">
                  <button
                    onClick={() => setSelectedLab(l)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#009DD1] transition-colors"
                    title="View Result"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadReport(l)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#009DD1] transition-colors"
                    title="Download Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Lab Test Modal */}
      <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#009DD1]" /> Order Diagnostic Test
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create a laboratory requisition for a patient.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOrderLab} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={newLab.patient}
                onChange={(e) => setNewLab({ ...newLab, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Diagnostic Test / Panel</label>
              <select
                value={newLab.test}
                onChange={(e) => setNewLab({ ...newLab, test: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              >
                <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                <option value="Fasting Blood Sugar (FBS)">Fasting Blood Sugar (FBS)</option>
                <option value="Lipid Profile">Lipid Profile</option>
                <option value="Urinalysis">Urinalysis</option>
                <option value="Chest X-Ray">Chest X-Ray</option>
                <option value="12-Lead ECG">12-Lead ECG</option>
                <option value="Serum Creatinine">Serum Creatinine</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Requesting Physician</label>
              <select
                value={newLab.requestedBy}
                onChange={(e) => setNewLab({ ...newLab, requestedBy: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              >
                <option value="Dr. Santos">Dr. Santos (Internal Medicine)</option>
                <option value="Dr. Reyes">Dr. Reyes (Pediatrics)</option>
                <option value="Dr. Cruz">Dr. Cruz (Cardiology)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOrderOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold"
              >
                Submit Order
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lab Result Modal */}
      <Dialog open={!!selectedLab} onOpenChange={(open) => !open && setSelectedLab(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#009DD1]" /> Diagnostic Test Results
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Laboratory investigation findings and clinical values.
            </DialogDescription>
          </DialogHeader>
          {selectedLab && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="text-sm font-bold text-slate-900">{selectedLab.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Test:</span>
                  <span className="text-sm font-semibold text-[#009DD1]">{selectedLab.test}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Requested By:</span>
                  <span className="text-sm text-slate-700">{selectedLab.requestedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date:</span>
                  <span className="text-sm text-slate-700">{selectedLab.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Interpretation:</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusConfig[selectedLab.status]}`}>
                    {selectedLab.result}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Detailed Findings:</span>
                  <p className="text-xs text-slate-700 font-mono bg-white p-2.5 rounded-lg border border-slate-200">
                    {selectedLab.values}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => handleDownloadReport(selectedLab)}
                  className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Report PDF
                </button>
                <button
                  onClick={() => setSelectedLab(null)}
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

export default AdminLaboratory;

