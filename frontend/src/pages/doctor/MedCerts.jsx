import React, { useState } from 'react';
import { FileBadge, Search, Plus, Eye, Download, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const initialCertificates = [
  {
    id: 1,
    patient: 'Maria Santos',
    purpose: 'Sick Leave (3 days)',
    diagnosis: 'Acute Gastroenteritis with mild dehydration',
    dateIssued: '2026-08-10',
    daysExcused: '3 Days (Aug 10 - Aug 12, 2026)',
    remarks: 'Advised rest, oral rehydration therapy, and soft diet. May resume duties once afebrile.',
    status: 'Issued',
  },
  {
    id: 2,
    patient: 'Pedro Lim',
    purpose: 'Fit to Work',
    diagnosis: 'Pre-employment Medical Examination - Normal Findings',
    dateIssued: '2026-08-12',
    daysExcused: 'N/A',
    remarks: 'Physically fit to perform standard vocational and physical duties.',
    status: 'Issued',
  },
];

const DoctorMedCerts = () => {
  const [certs, setCerts] = useState(initialCertificates);
  const [search, setSearch] = useState('');
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [viewingCert, setViewingCert] = useState(null);
  const [newCert, setNewCert] = useState({
    patient: '',
    purpose: 'Sick Leave',
    diagnosis: '',
    daysExcused: '3 Days',
    remarks: '',
  });

  const filtered = certs.filter((c) =>
    c.patient.toLowerCase().includes(search.toLowerCase()) ||
    c.purpose.toLowerCase().includes(search.toLowerCase()) ||
    c.diagnosis.toLowerCase().includes(search.toLowerCase())
  );

  const handleIssueCertificate = (e) => {
    e.preventDefault();
    if (!newCert.patient.trim() || !newCert.diagnosis.trim()) {
      toast.error('Please fill in patient name and diagnosis');
      return;
    }
    const item = {
      id: Date.now(),
      patient: newCert.patient,
      purpose: `${newCert.purpose} (${newCert.daysExcused})`,
      diagnosis: newCert.diagnosis,
      daysExcused: newCert.daysExcused,
      remarks: newCert.remarks || 'Patient cleared as per clinical findings.',
      dateIssued: new Date().toISOString().split('T')[0],
      status: 'Issued',
    };
    setCerts([item, ...certs]);
    setIsIssueOpen(false);
    setNewCert({
      patient: '',
      purpose: 'Sick Leave',
      diagnosis: '',
      daysExcused: '3 Days',
      remarks: '',
    });
    toast.success(`Medical certificate issued for ${item.patient}`);
  };

  const handleDownloadCert = (cert) => {
    toast.success(`Downloading Medical Certificate PDF for ${cert.patient}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileBadge className="w-6 h-6 text-[#7C3AED]" />
            Medical Certificates
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Issue digital medical certificates and clearance documents.</p>
        </div>
        <button
          onClick={() => setIsIssueOpen(true)}
          className="flex items-center gap-2 bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5B21B6] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Issue Certificate
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient, purpose, or diagnosis..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Purpose</th>
              <th className="px-5 py-3">Diagnosis / Remark</th>
              <th className="px-5 py-3">Date Issued</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  No medical certificates found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{c.patient}</td>
                  <td className="px-5 py-4 text-slate-700 font-medium">{c.purpose}</td>
                  <td className="px-5 py-4 text-slate-600">{c.diagnosis}</td>
                  <td className="px-5 py-4 text-slate-600">{c.dateIssued}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingCert(c)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-[#7C3AED] transition-colors"
                        title="View Certificate"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadCert(c)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-[#7C3AED] transition-colors"
                        title="Download Certificate"
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

      {/* Issue Certificate Modal */}
      <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileBadge className="w-5 h-5 text-[#7C3AED]" /> Issue Medical Certificate
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create an official digital medical certificate for school, work, or fitness clearance.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleIssueCertificate} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={newCert.patient}
                onChange={(e) => setNewCert({ ...newCert, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Purpose</label>
                <select
                  value={newCert.purpose}
                  onChange={(e) => setNewCert({ ...newCert, purpose: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
                >
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Fit to Work">Fit to Work Clearance</option>
                  <option value="Fit for School / Physical Activity">Fit for School / Sports</option>
                  <option value="Travel Clearance">Travel Clearance</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Recommended Rest / Duration</label>
                <select
                  value={newCert.daysExcused}
                  onChange={(e) => setNewCert({ ...newCert, daysExcused: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
                >
                  <option value="1 Day">1 Day</option>
                  <option value="2 Days">2 Days</option>
                  <option value="3 Days">3 Days</option>
                  <option value="5 Days">5 Days</option>
                  <option value="7 Days">7 Days</option>
                  <option value="14 Days">14 Days</option>
                  <option value="Cleared (No rest needed)">Cleared (Fit to Work)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Clinical Diagnosis</label>
              <input
                type="text"
                required
                placeholder="e.g. Acute Upper Respiratory Tract Infection (AURI)"
                value={newCert.diagnosis}
                onChange={(e) => setNewCert({ ...newCert, diagnosis: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Doctor's Advice & Remarks</label>
              <textarea
                rows={2}
                placeholder="Specific recommendations, dietary restrictions, or follow-up schedule..."
                value={newCert.remarks}
                onChange={(e) => setNewCert({ ...newCert, remarks: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
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
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold"
              >
                Issue Certificate
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Certificate Modal */}
      <Dialog open={!!viewingCert} onOpenChange={(open) => !open && setViewingCert(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileBadge className="w-5 h-5 text-[#7C3AED]" /> Official Medical Certificate
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Verified clinical certificate generated by licensed physician.
            </DialogDescription>
          </DialogHeader>
          {viewingCert && (
            <div className="space-y-4 pt-2">
              <div className="bg-purple-50/40 border border-purple-100 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="text-sm font-bold text-slate-900">{viewingCert.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Purpose:</span>
                  <span className="text-sm font-semibold text-[#7C3AED]">{viewingCert.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Diagnosis:</span>
                  <span className="text-sm text-slate-800">{viewingCert.diagnosis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Duration:</span>
                  <span className="text-sm text-slate-700">{viewingCert.daysExcused || viewingCert.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date Issued:</span>
                  <span className="text-sm text-slate-700">{viewingCert.dateIssued}</span>
                </div>
                {viewingCert.remarks && (
                  <div className="pt-2 border-t border-purple-200">
                    <span className="text-xs text-slate-500 block mb-1">Clinical Remarks:</span>
                    <p className="text-xs text-slate-800 italic">{viewingCert.remarks}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    handleDownloadCert(viewingCert);
                    setViewingCert(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
                <button
                  onClick={() => setViewingCert(null)}
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

export default DoctorMedCerts;

