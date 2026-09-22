import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Stethoscope,
  Activity,
  FlaskConical,
  CheckCircle2,
  Calendar,
  Plus,
  X,
  ShieldAlert,
  Info,
  RefreshCw
} from 'lucide-react';
import { analyzeSymptoms } from '../../api/DecisionSupport';
import { useAuth } from '../../contexts/AuthContext';

export default function HealthDSS() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState(['fever', 'cough']);
  const [customSymptom, setCustomSymptom] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [duration, setDuration] = useState('2 days');
  const [result, setResult] = useState(null);

  const commonSymptoms = [
    { label: 'Fever or Chills', value: 'fever' },
    { label: 'Cough', value: 'cough' },
    { label: 'Shortness of Breath', value: 'shortness of breath' },
    { label: 'Chest Pain or Tightness', value: 'chest pain' },
    { label: 'Headache', value: 'headache' },
    { label: 'Dizziness', value: 'dizziness' },
    { label: 'Stomach Ache', value: 'stomach pain' },
    { label: 'Diarrhea', value: 'diarrhea' },
    { label: 'Nausea / Vomiting', value: 'nausea' },
    { label: 'Pain When Urinating', value: 'painful urination' },
    { label: 'Tiredness / Fatigue', value: 'fatigue' },
    { label: 'Skin Rash', value: 'rash' }
  ];

  useEffect(() => {
    handleAnalyze();
  }, []);

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) return;
    try {
      setLoading(true);
      const res = await analyzeSymptoms({
        symptoms: selectedSymptoms,
        severity,
        duration,
        age: user?.patient?.age || 30
      });
      if (res?.data) {
        setResult(res.data);
      }
    } catch (err) {
      console.error('Patient symptom analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSymptom = (val) => {
    if (selectedSymptoms.includes(val)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== val));
    } else {
      setSelectedSymptoms([...selectedSymptoms, val]);
    }
  };

  const handleAddCustom = () => {
    const clean = customSymptom.trim().toLowerCase();
    if (clean && !selectedSymptoms.includes(clean)) {
      setSelectedSymptoms([...selectedSymptoms, clean]);
    }
    setCustomSymptom('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Friendly Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI Symptom Assistant
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Check Your Symptoms
          </h1>
          <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
            Select how you are feeling below to see possible conditions, suggested laboratory tests, and whether you should see a doctor.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/20 flex items-start gap-2 text-xs text-blue-100">
          <Info className="w-3.5 h-3.5 text-blue-200 shrink-0 mt-0.5" />
          <span>Educational guidance to help you prepare for your doctor visit. Does not replace a doctor's examination.</span>
        </div>
      </div>

      {/* 2-Column Clean Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input & Selection */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            What symptoms do you have?
          </h2>

          {/* Quick Tap Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {commonSymptoms.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym.value);
              return (
                <button
                  key={sym.value}
                  onClick={() => handleToggleSymptom(sym.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {sym.label} {isSelected ? '✓' : '+'}
                </button>
              );
            })}
          </div>

          {/* Custom Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              placeholder="Other symptom (e.g. sore throat)..."
              className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <button
              onClick={handleAddCustom}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Add
            </button>
          </div>

          {/* Selected Symptoms */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 min-h-14">
            <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Your Selected Symptoms ({selectedSymptoms.length})
            </span>
            {selectedSymptoms.length === 0 ? (
              <span className="text-xs text-slate-400 italic">Tap any symptom tag above to select.</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selectedSymptoms.map((sym) => (
                  <span
                    key={sym}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-200 text-blue-800 rounded-lg text-xs font-medium shadow-2xs"
                  >
                    {sym}
                    <button
                      onClick={() => handleToggleSymptom(sym)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Severity */}
          <div className="pt-2 border-t space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">How severe does it feel?</label>
              <div className="grid grid-cols-3 gap-2">
                {['mild', 'moderate', 'severe'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 text-xs font-bold capitalize rounded-xl border transition-all ${
                      severity === lvl
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">How long have you had it?</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2 days"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || selectedSymptoms.length === 0}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Checking Symptoms...' : 'Check My Symptoms'}
          </button>
        </div>

        {/* RIGHT COLUMN: Results & Recommendations */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <>
              {/* Guidance / Urgency Banner */}
              <div
                className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  result.has_red_flags
                    ? 'bg-red-50 border-red-200 text-red-950'
                    : result.urgency_level.includes('Urgent')
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-2xs font-extrabold uppercase tracking-wider">
                    {result.has_red_flags ? (
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    Next Step Recommendation
                  </div>
                  <h3 className="text-lg font-extrabold">{result.urgency_level}</h3>
                  <p className="text-xs opacity-90 leading-relaxed">
                    {result.has_red_flags
                      ? 'Your symptoms include warning signs. Please visit a clinic or urgent care promptly.'
                      : 'We recommend consulting a doctor for a thorough evaluation and personalized treatment.'}
                  </p>
                </div>

                <button
                  onClick={() => navigate('/patient/book-appointment')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book Appointment
                </button>
              </div>

              {/* Possible Conditions */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Possible Medical Conditions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {result.possible_conditions?.slice(0, 4).map((cond) => (
                    <div
                      key={cond.code}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold text-xs">{cond.condition_name}</strong>
                        <span className="text-xs font-bold text-blue-600">{cond.confidence_score}%</span>
                      </div>
                      <p className="text-2xs text-slate-500">
                        Suggested Specialist: <strong>{cond.recommended_specialist}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Diagnostic Tests */}
              {result.recommended_laboratory_tests?.length > 0 && (
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-teal-600" />
                    Diagnostic Tests Your Doctor May Suggest
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.recommended_laboratory_tests.slice(0, 4).map((lab) => (
                      <div key={lab.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <strong className="text-slate-900 block font-semibold mb-0.5">{lab.name}</strong>
                        <span className="text-slate-500 text-2xs leading-relaxed">{lab.rationale}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">Check Your Symptoms</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Tap the symptoms you have on the left to see instant suggestions and test recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
