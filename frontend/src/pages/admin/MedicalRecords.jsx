import React, { useState } from 'react';
import { FileText, Search, Eye, Download, Calendar, User, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const mockRecords = [
  { id: 1, patient: 'Maria Santos', type: 'Consultation', doctor: 'Dr. Santos', date: '2026-08-10', diagnosis: 'Upper Respiratory Tract Infection', notes: 'Patient presented with 3-day cough and mild fever. Prescribed Amoxicillin 500mg TID.', status: 'Complete' },
  { id: 2, patient: 'Juan dela Cruz', type: 'Follow-up', doctor: 'Dr. Reyes', date: '2026-08-08', diagnosis: 'Type 2 Diabetes – monitoring', notes: 'Fasting blood glucose 110 mg/dL. Continue Metformin 500mg BID.', status: 'Complete' },
  { id: 3, patient: 'Ana Reyes', type: 'Consultation', doctor: 'Dr. Cruz', date: '2026-08-05', diagnosis: 'Hypertension Stage 1', notes: 'BP 140/90. Dietary sodium restriction advised. Prescribed Losartan 50mg OD.', status: 'Complete' },
  { id: 4, patient: 'Pedro Lim', type: 'Emergency', doctor: 'Dr. Santos', date: '2026-08-15', diagnosis: 'Chest pain – evaluation', notes: 'ECG normal sinus rhythm. Referred for cardiac enzyme panel.', status: 'Pending' },
];

const AdminMedicalRecords = () => {
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filtered = mockRecords.filter((r) =>
    r.patient.toLowerCase().includes(search.toLowerCase()) ||
    r.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (record) => {
    toast.success(`Downloading clinical record summary for ${record.patient}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#009DD1]" /> Medical Records
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Access and manage all patient medical records across the clinic.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient, doctor, or diagnosis..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['Patient', 'Type', 'Doctor', 'Date', 'Diagnosis', 'Status', 'Actions'].map((h) => (
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
                  No medical records found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900">{r.patient}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-[#009DD1]/10 text-[#009DD1] px-2 py-0.5 rounded-full font-medium">
                      {r.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{r.doctor}</td>
                  <td className="px-5 py-4 text-slate-600">{r.date}</td>
                  <td className="px-5 py-4 text-slate-600 max-w-[200px] truncate">{r.diagnosis}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        r.status === 'Complete' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 flex gap-1">
                    <button
                      onClick={() => setSelectedRecord(r)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#009DD1] transition-colors"
                      title="View SOAP Note"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(r)}
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

      {/* Record Details Modal */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#009DD1]" /> Clinical Consultation Record
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Complete physician consultation note and diagnosis summary.
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Patient:</span>
                  <span className="text-sm font-bold text-slate-900">{selectedRecord.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Attending Doctor:</span>
                  <span className="text-sm font-semibold text-[#009DD1]">{selectedRecord.doctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Encounter Type:</span>
                  <span className="text-sm text-slate-700">{selectedRecord.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Date:</span>
                  <span className="text-sm text-slate-700">{selectedRecord.date}</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Clinical Diagnosis:</span>
                  <p className="text-xs font-semibold text-slate-800">{selectedRecord.diagnosis}</p>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">Doctor's SOAP Notes / Plan:</span>
                  <p className="text-xs text-slate-600 italic">{selectedRecord.notes}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => handleDownload(selectedRecord)}
                  className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Record
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
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

export default AdminMedicalRecords;

