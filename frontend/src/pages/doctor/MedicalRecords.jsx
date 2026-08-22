import React, { useState } from 'react';
import { FileText, Search, Plus, Eye, Download, User, Calendar, Activity, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const initialRecords = [
  {
    id: 1,
    patient: 'Maria Santos',
    date: '2026-08-10',
    subjective: 'Patient reports occasional morning headaches and dizziness over past 2 weeks.',
    objective: 'BP: 140/90 mmHg, HR: 78 bpm, Temp: 36.6°C, Resp: 18 cpm. Heart sounds regular.',
    diagnosis: 'Essential Hypertension (Stage 1)',
    plan: 'Continue Amlodipine 5mg once daily. Dietary sodium restriction. Home BP monitoring log.',
    status: 'Final'
  },
  {
    id: 2,
    patient: 'Juan dela Cruz',
    date: '2026-08-08',
    subjective: 'Routine diabetes check. Denies polydipsia, polyuria, or visual disturbances.',
    objective: 'FBS: 142 mg/dL, HbA1c: 7.1%, BMI: 27.2. Foot sensory exam normal.',
    diagnosis: 'Type 2 Diabetes Mellitus - Moderately Controlled',
    plan: 'Metformin 500mg BID with meals. Lifestyle & carbohydrate moderation. Repeat HbA1c in 3 months.',
    status: 'Final'
  },
  {
    id: 3,
    patient: 'Ana Reyes',
    date: '2026-07-28',
    subjective: 'Productive cough x 5 days with yellowish phlegm. Low-grade fever initially.',
    objective: 'Chest auscultation: coarse rhonchi on right middle lobe. No wheezing.',
    diagnosis: 'Acute Bronchitis',
    plan: 'Amoxicillin 500mg TID x 7 days. Salbutamol nebulization PRN for shortness of breath.',
    status: 'Final'
  },
];

const DoctorMedicalRecords = () => {
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState('');
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newRecord, setNewRecord] = useState({
    patient: '',
    subjective: '',
    objective: '',
    diagnosis: '',
    plan: '',
  });

  const filtered = records.filter((r) =>
    r.patient.toLowerCase().includes(search.toLowerCase()) ||
    r.diagnosis.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateRecord = (e) => {
    e.preventDefault();
    if (!newRecord.patient.trim() || !newRecord.diagnosis.trim()) {
      toast.error('Please enter patient name and diagnosis');
      return;
    }
    const item = {
      id: Date.now(),
      patient: newRecord.patient,
      date: new Date().toISOString().split('T')[0],
      subjective: newRecord.subjective || 'Chief complaints recorded during consultation.',
      objective: newRecord.objective || 'Physical examination within acceptable baseline.',
      diagnosis: newRecord.diagnosis,
      plan: newRecord.plan || 'Advised follow-up as necessary.',
      status: 'Final',
    };
    setRecords([item, ...records]);
    setIsNewRecordOpen(false);
    setNewRecord({
      patient: '',
      subjective: '',
      objective: '',
      diagnosis: '',
      plan: '',
    });
    toast.success(`Medical record for ${item.patient} saved`);
  };

  const handleDownloadRecord = (rec) => {
    toast.success(`Downloading Clinical Summary PDF for ${rec.patient}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#7C3AED]" />
            Medical Records
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Patient SOAP notes, diagnoses, and treatment plans.</p>
        </div>
        <button
          onClick={() => setIsNewRecordOpen(true)}
          className="flex items-center gap-2 bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5B21B6] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Record
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient or diagnosis..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
        />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
            No medical records found.
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{r.patient}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Consultation Date: {r.date}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {r.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Diagnosis</span>
                  <p className="text-slate-800 font-medium">{r.diagnosis}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Treatment Plan</span>
                  <p className="text-slate-700">{r.plan}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedRecord(r)}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#7C3AED] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-purple-50 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </button>
                <button
                  onClick={() => handleDownloadRecord(r)}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#7C3AED] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-purple-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download Summary
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Record Modal */}
      <Dialog open={isNewRecordOpen} onOpenChange={setIsNewRecordOpen}>
        <DialogContent className="max-w-xl bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#7C3AED]" /> New Clinical SOAP Record
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Document consultation findings, assessment, and care plan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRecord} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={newRecord.patient}
                onChange={(e) => setNewRecord({ ...newRecord, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Subjective (Symptoms & History)</label>
              <textarea
                rows={2}
                placeholder="Chief complaints, history of present illness..."
                value={newRecord.subjective}
                onChange={(e) => setNewRecord({ ...newRecord, subjective: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Objective (Vitals & Physical Exam)</label>
              <textarea
                rows={2}
                placeholder="BP, HR, RR, temp, physical exam findings..."
                value={newRecord.objective}
                onChange={(e) => setNewRecord({ ...newRecord, objective: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Assessment / Diagnosis</label>
              <input
                type="text"
                required
                placeholder="e.g. Acute Pharyngitis"
                value={newRecord.diagnosis}
                onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Plan & Prescriptions</label>
              <textarea
                rows={2}
                placeholder="Medications, tests ordered, follow-up schedule..."
                value={newRecord.plan}
                onChange={(e) => setNewRecord({ ...newRecord, plan: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#7C3AED]/30"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewRecordOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold"
              >
                Save Clinical Note
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Record Details Modal */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#7C3AED]" /> Clinical Consultation Note
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Full SOAP note recorded on {selectedRecord?.date}.
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-xs text-slate-400">Patient Name</span>
                  <p className="font-bold text-slate-900">{selectedRecord.patient}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700">
                  {selectedRecord.status}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl space-y-2">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">S — Subjective</span>
                  <p className="text-xs text-slate-700 mt-0.5">{selectedRecord.subjective}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">O — Objective</span>
                  <p className="text-xs text-slate-700 mt-0.5">{selectedRecord.objective}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider block">A — Assessment</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedRecord.diagnosis}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">P — Plan</span>
                  <p className="text-xs text-slate-700 mt-0.5">{selectedRecord.plan}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    handleDownloadRecord(selectedRecord);
                    setSelectedRecord(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#5B21B6] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Note PDF
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

export default DoctorMedicalRecords;

