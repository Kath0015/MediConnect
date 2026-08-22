import React, { useState } from 'react';
import { Syringe, Search, Plus, HeartPulse, Activity, Thermometer, Weight, User, Calendar, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const initialVitals = [
  { id: 1, patient: 'Maria Santos', bp: '120/80 mmHg', hr: '72 bpm', temp: '36.6 °C', weight: '58 kg', height: '160 cm', bmi: '22.7 (Normal)', date: '2026-08-18 09:50 AM', recordedBy: 'Nurse Lopez' },
  { id: 2, patient: 'Juan dela Cruz', bp: '135/85 mmHg', hr: '78 bpm', temp: '36.8 °C', weight: '74 kg', height: '172 cm', bmi: '25.0 (Overweight)', date: '2026-08-18 10:35 AM', recordedBy: 'Nurse Lopez' },
];

const ClinicianVitals = () => {
  const [vitals, setVitals] = useState(initialVitals);
  const [search, setSearch] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [newVital, setNewVital] = useState({
    patient: '',
    systolic: '120',
    diastolic: '80',
    hr: '75',
    temp: '36.5',
    weight: '60',
    height: '165',
  });

  const filtered = vitals.filter((v) => v.patient.toLowerCase().includes(search.toLowerCase()));

  const handleSaveVitals = (e) => {
    e.preventDefault();
    if (!newVital.patient.trim()) {
      toast.error('Please enter patient name');
      return;
    }

    const w = parseFloat(newVital.weight) || 60;
    const hMeters = (parseFloat(newVital.height) || 165) / 100;
    const computedBMI = (w / (hMeters * hMeters)).toFixed(1);
    let bmiCategory = 'Normal';
    if (computedBMI < 18.5) bmiCategory = 'Underweight';
    else if (computedBMI >= 25 && computedBMI < 30) bmiCategory = 'Overweight';
    else if (computedBMI >= 30) bmiCategory = 'Obese';

    const now = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const item = {
      id: Date.now(),
      patient: newVital.patient,
      bp: `${newVital.systolic}/${newVital.diastolic} mmHg`,
      hr: `${newVital.hr} bpm`,
      temp: `${newVital.temp} °C`,
      weight: `${newVital.weight} kg`,
      height: `${newVital.height} cm`,
      bmi: `${computedBMI} (${bmiCategory})`,
      date: now,
      recordedBy: 'Nurse Staff',
    };

    setVitals([item, ...vitals]);
    setIsRecordModalOpen(false);
    setNewVital({
      patient: '',
      systolic: '120',
      diastolic: '80',
      hr: '75',
      temp: '36.5',
      weight: '60',
      height: '165',
    });
    toast.success(`Vital signs for ${item.patient} recorded! (BMI: ${computedBMI})`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Syringe className="w-6 h-6 text-[#26B170]" />
            Vital Signs
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Record and monitor patient Triage Vitals (BP, HR, Temp, Weight, BMI).</p>
        </div>
        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="flex items-center gap-2 bg-[#26B170] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a8a55] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Record Vitals
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patient vitals record..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#26B170]/30 focus:border-[#26B170]"
        />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
            No vital signs records found.
          </div>
        ) : (
          filtered.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">{v.patient}</h3>
                  <span className="text-xs text-slate-400">Recorded: {v.date} by {v.recordedBy}</span>
                </div>
                {v.bmi && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700">
                    BMI: {v.bmi}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 text-center">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1 flex items-center justify-center gap-1"><Activity className="w-3.5 h-3.5 text-rose-500" /> BP</span>
                  <span className="font-bold text-slate-800 text-sm">{v.bp}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1 flex items-center justify-center gap-1"><HeartPulse className="w-3.5 h-3.5 text-rose-500" /> Heart Rate</span>
                  <span className="font-bold text-slate-800 text-sm">{v.hr}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1 flex items-center justify-center gap-1"><Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temp</span>
                  <span className="font-bold text-slate-800 text-sm">{v.temp}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1 flex items-center justify-center gap-1"><Weight className="w-3.5 h-3.5 text-[#009DD1]" /> Weight</span>
                  <span className="font-bold text-slate-800 text-sm">{v.weight}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-1">Height</span>
                  <span className="font-bold text-slate-800 text-sm">{v.height}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Record Vitals Modal */}
      <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Syringe className="w-5 h-5 text-[#26B170]" /> Take & Record Patient Vitals
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Input patient triage measurements for doctor review.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveVitals} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Maria Santos"
                value={newVital.patient}
                onChange={(e) => setNewVital({ ...newVital, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  required
                  placeholder="120"
                  value={newVital.systolic}
                  onChange={(e) => setNewVital({ ...newVital, systolic: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  required
                  placeholder="80"
                  value={newVital.diastolic}
                  onChange={(e) => setNewVital({ ...newVital, diastolic: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  required
                  placeholder="72"
                  value={newVital.hr}
                  onChange={(e) => setNewVital({ ...newVital, hr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Body Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="36.5"
                  value={newVital.temp}
                  onChange={(e) => setNewVital({ ...newVital, temp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="60"
                  value={newVital.weight}
                  onChange={(e) => setNewVital({ ...newVital, weight: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  required
                  placeholder="165"
                  value={newVital.height}
                  onChange={(e) => setNewVital({ ...newVital, height: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#26B170]/30"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#26B170] hover:bg-[#1a8a55] text-white text-xs font-semibold"
              >
                Save Vital Signs
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicianVitals;

