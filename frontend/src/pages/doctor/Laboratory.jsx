import React, { useState } from 'react';
import { FlaskConical, Search, Plus, Eye, Download, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const initialLabRequests = [
  {
    id: 1,
    patient: 'Maria Santos',
    test: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    requestedDate: '2026-08-12',
    status: 'Completed',
    result: 'WBC slightly elevated (11.2 x10^9/L)',
    findings: 'Hemoglobin: 13.5 g/dL (Normal), Hematocrit: 41% (Normal), WBC: 11.2 (Slightly Elevated), Platelets: 250,000 (Normal).',
    recommendation: 'Mild leukocytosis, monitor for infectious signs. Repeat in 2 weeks if symptomatic.'
  },
  {
    id: 2,
    patient: 'Juan dela Cruz',
    test: 'Fasting Blood Sugar (FBS), HbA1c',
    category: 'Clinical Chemistry',
    requestedDate: '2026-08-14',
    status: 'Pending',
    result: 'Awaiting Lab Tech Processing',
    findings: 'Specimen received at central lab. Results expected within 4 hours.',
    recommendation: 'Ensure 8-10 hour fasting prior to sample draw.'
  },
  {
    id: 3,
    patient: 'Pedro Lim',
    test: 'Lipid Profile & 12-Lead ECG',
    category: 'Cardiovascular / Chemistry',
    requestedDate: '2026-08-15',
    status: 'In Progress',
    result: 'ECG Completed, Lipid Panel Pending',
    findings: 'ECG: Normal sinus rhythm, HR 72 bpm. Lipid Profile undergoing automated assay.',
    recommendation: 'Cardiovascular clearance pending complete lipid profile.'
  },
];

const DoctorLaboratory = () => {
  const [labRequests, setLabRequests] = useState(initialLabRequests);
  const [search, setSearch] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [newLab, setNewLab] = useState({
    patient: '',
    test: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    notes: '',
  });

  const filtered = labRequests.filter((l) =>
    l.patient.toLowerCase().includes(search.toLowerCase()) ||
    l.test.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateLabRequest = (e) => {
    e.preventDefault();
    if (!newLab.patient.trim()) {
      toast.error('Please enter patient name');
      return;
    }
    const item = {
      id: Date.now(),
      patient: newLab.patient,
      test: newLab.test,
      category: newLab.category,
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      result: 'Pending Lab Processing',
      findings: 'Request submitted to laboratory technician.',
      recommendation: newLab.notes || 'Routine diagnostic evaluation.',
    };
    setLabRequests([item, ...labRequests]);
    setIsRequestModalOpen(false);
    setNewLab({
      patient: '',
      test: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      notes: '',
    });
    toast.success(`Lab request (${item.test}) sent for ${item.patient}`);
  };

  const handleDownloadResult = (item) => {
    toast.success(`Downloading Laboratory Report PDF for ${item.patient}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-[#7C3AED]" />
            Laboratory Requests
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Issue lab requests and review diagnostic test results.</p>
        </div>
        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="flex items-center gap-2 bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5B21B6] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Request Lab Test
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient or test name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Requested Test</th>
              <th className="px-5 py-3">Date Requested</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Result / Remark</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  No laboratory requests found.
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{l.patient}</td>
                  <td className="px-5 py-4 text-slate-700 font-medium">{l.test}</td>
                  <td className="px-5 py-4 text-slate-600">{l.requestedDate}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      l.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : l.status === 'In Progress'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 italic">{l.result}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedResult(l)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-[#7C3AED] transition-colors"
                        title="View Diagnostic Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {l.status === 'Completed' && (
                        <button
                          onClick={() => handleDownloadResult(l)}
                          className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-[#7C3AED] transition-colors"
                          title="Download Lab Report"
                        >
                          <Download className="w-4 h-4" />
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

      {/* Request Lab Test Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[#7C3AED]" /> Order Diagnostic Laboratory Test
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit a laboratory test order for clinic staff and diagnostic fulfillment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLabRequest} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={newLab.patient}
                onChange={(e) => setNewLab({ ...newLab, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Test Panel / Procedure</label>
              <select
                value={newLab.test}
                onChange={(e) => {
                  const val = e.target.value;
                  let cat = 'Hematology';
                  if (val.includes('Blood Sugar') || val.includes('Lipid') || val.includes('Liver')) cat = 'Clinical Chemistry';
                  if (val.includes('Urinalysis') || val.includes('Fecalysis')) cat = 'Microscopy';
                  if (val.includes('ECG') || val.includes('X-Ray')) cat = 'Radiology / Diagnostics';
                  setNewLab({ ...newLab, test: val, category: cat });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              >
                <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                <option value="Fasting Blood Sugar (FBS), HbA1c">Fasting Blood Sugar (FBS), HbA1c</option>
                <option value="Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)">Lipid Profile</option>
                <option value="Routine Urinalysis">Routine Urinalysis</option>
                <option value="Fecalysis & Occult Blood">Fecalysis & Occult Blood</option>
                <option value="12-Lead Electrocardiogram (ECG)">12-Lead ECG</option>
                <option value="Chest X-Ray PA View">Chest X-Ray PA View</option>
                <option value="Liver Function Test (SGPT, SGOT, Alk Phos)">Liver Function Test</option>
                <option value="Serum Creatinine & BUN">Serum Creatinine & BUN</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Clinical Indication / Diagnosis</label>
              <textarea
                rows={2}
                placeholder="Reason for test, suspected condition, special instructions..."
                value={newLab.notes}
                onChange={(e) => setNewLab({ ...newLab, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold"
              >
                Submit Lab Order
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Result Modal */}
      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#7C3AED]" /> Diagnostic Result Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Official laboratory report and clinician evaluation.
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="text-sm font-semibold text-slate-900">{selectedResult.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Test:</span>
                  <span className="text-sm font-bold text-[#7C3AED]">{selectedResult.test}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Category:</span>
                  <span className="text-sm text-slate-700">{selectedResult.category || 'General Diagnostic'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date:</span>
                  <span className="text-sm text-slate-700">{selectedResult.requestedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Status:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    selectedResult.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedResult.status}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Detailed Findings:</span>
                  <p className="text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">{selectedResult.findings || selectedResult.result}</p>
                </div>
                {selectedResult.recommendation && (
                  <div className="pt-1">
                    <span className="text-xs text-slate-500 block mb-1">Doctor's Remark / Recommendation:</span>
                    <p className="text-xs text-slate-700 italic">{selectedResult.recommendation}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    handleDownloadResult(selectedResult);
                    setSelectedResult(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Result PDF
                </button>
                <button
                  onClick={() => setSelectedResult(null)}
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

export default DoctorLaboratory;

