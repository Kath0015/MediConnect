import React, { useState, useEffect } from 'react';
import { Syringe, Search, Plus, HeartPulse, Activity, Thermometer, Weight, User, Calendar, Trash2, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { getVitals, createVital } from '../../api/Triage';

const ClinicianVitals = () => {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newVital, setNewVital] = useState({
    patient: '',
    systolic: '120',
    diastolic: '80',
    hr: '75',
    temp: '36.5',
    weight: '60',
    height: '165',
  });

  const loadVitalsList = async () => {
    try {
      setLoading(true);
      const res = await getVitals();
      const mapped = (res.data || []).map((v) => {
        const bmiVal = v.bmi || 22.0;
        let bmiCat = 'Normal';
        if (bmiVal < 18.5) bmiCat = 'Underweight';
        else if (bmiVal >= 25 && bmiVal < 30) bmiCat = 'Overweight';
        else if (bmiVal >= 30) bmiCat = 'Obese';

        return {
          id: v.id,
          patient: v.patient_name,
          bp: v.blood_pressure ? `${v.blood_pressure} mmHg` : '—',
          hr: v.heart_rate ? `${v.heart_rate} bpm` : '—',
          temp: v.temperature ? `${v.temperature} °C` : '—',
          weight: v.weight ? `${v.weight} kg` : '—',
          height: v.height ? `${v.height} cm` : '—',
          bmi: `${bmiVal} (${bmiCat})`,
          date: v.recorded_at ? new Date(v.recorded_at).toLocaleString() : new Date().toLocaleString(),
          recordedBy: v.recorded_by || 'Clinician',
        };
      });
      setVitals(mapped);
    } catch (err) {
      console.error('Failed to load vitals:', err);
      toast.error('Failed to load vitals from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVitalsList();
  }, []);

  const filtered = vitals.filter((v) => v.patient?.toLowerCase().includes(search.toLowerCase()));

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    if (!newVital.patient.trim()) {
      toast.error('Please enter patient name');
      return;
    }

    try {
      setIsSubmitting(true);
      await createVital({
        patient_name: newVital.patient,
        blood_pressure: `${newVital.systolic}/${newVital.diastolic}`,
        heart_rate: parseInt(newVital.hr) || 75,
        temperature: parseFloat(newVital.temp) || 36.5,
        weight: parseFloat(newVital.weight) || 60,
        height: parseFloat(newVital.height) || 165,
      });

      toast.success(`Vital signs for ${newVital.patient} saved to clinical database!`);
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
      await loadVitalsList();
    } catch (err) {
      console.error('Failed to save vitals:', err);
      toast.error('Failed to save vitals to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#009DD1]" />
            Patient Vital Signs
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Real-time database-backed triage vitals, biometric logging, and BMI calculation.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadVitalsList}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#009DD1]' : ''}`} />
          </button>
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-2 bg-[#009DD1] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#01377D] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Record New Vitals
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#009DD1]/30 focus:border-[#009DD1]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Blood Pressure</th>
              <th className="px-5 py-3">Heart Rate</th>
              <th className="px-5 py-3">Temp</th>
              <th className="px-5 py-3">Weight & Height</th>
              <th className="px-5 py-3">BMI Index</th>
              <th className="px-5 py-3">Date Recorded</th>
              <th className="px-5 py-3">Staff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#009DD1]" />
                    <span>Loading patient vitals from database...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  No vital signs records found in database.
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{v.patient}</td>
                  <td className="px-5 py-4 font-mono text-slate-800">{v.bp}</td>
                  <td className="px-5 py-4 text-slate-600">{v.hr}</td>
                  <td className="px-5 py-4 text-slate-600">{v.temp}</td>
                  <td className="px-5 py-4 text-slate-600">{v.weight} / {v.height}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700">
                      {v.bmi}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">{v.date}</td>
                  <td className="px-5 py-4 text-slate-600 text-xs">{v.recordedBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record Modal */}
      <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Record Patient Vital Signs</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Save clinical biometrics directly to the patient's database chart.
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  required
                  value={newVital.systolic}
                  onChange={(e) => setNewVital({ ...newVital, systolic: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  required
                  value={newVital.diastolic}
                  onChange={(e) => setNewVital({ ...newVital, diastolic: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  required
                  value={newVital.hr}
                  onChange={(e) => setNewVital({ ...newVital, hr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newVital.temp}
                  onChange={(e) => setNewVital({ ...newVital, temp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
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
                  value={newVital.weight}
                  onChange={(e) => setNewVital({ ...newVital, weight: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newVital.height}
                  onChange={(e) => setNewVital({ ...newVital, height: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#009DD1]/30"
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
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#009DD1] hover:bg-[#01377D] text-white text-xs font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Vitals'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicianVitals;
