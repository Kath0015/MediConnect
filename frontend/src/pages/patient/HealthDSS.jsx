import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Activity,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  X,
  Stethoscope,
  FlaskConical,
  ShieldAlert,
  Info,
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';
import { analyzeSymptoms, interpretLaboratory, getMyDSSAssessment } from '../../api/DecisionSupport';
import { useAuth } from '../../contexts/AuthContext';

export default function HealthDSS() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('symptoms');
  const [loading, setLoading] = useState(false);

  // Tab 1: Symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState(['fever', 'cough']);
  const [customSymptom, setCustomSymptom] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [duration, setDuration] = useState('2 days');
  const [symptomResult, setSymptomResult] = useState(null);

  // Tab 2: Lab Explainer
  const [labInputs, setLabInputs] = useState({
    fasting_glucose: 95,
    hemoglobin: 13.8,
    platelets: 230,
    total_cholesterol: 185
  });
  const [labResult, setLabResult] = useState(null);

  // Tab 3: Personal Health Advice
  const [myAssessment, setMyAssessment] = useState(null);

  useEffect(() => {
    fetchMyAssessment();
    handleAnalyze();
    handleInterpret();
  }, []);

  const fetchMyAssessment = async () => {
    try {
      const res = await getMyDSSAssessment();
      if (res?.data) {
        setMyAssessment(res.data);
      }
    } catch (err) {
      console.log('Personal assessment note:', err?.message || err);
    }
  };

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
        setSymptomResult(res.data);
      }
    } catch (err) {
      console.error('Patient symptom analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSymptom = (sym) => {
    const clean = sym.trim().toLowerCase();
    if (clean && !selectedSymptoms.includes(clean)) {
      setSelectedSymptoms([...selectedSymptoms, clean]);
    }
    setCustomSymptom('');
  };

  const handleRemoveSymptom = (sym) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
  };

  const handleInterpret = async () => {
    try {
      setLoading(true);
      const res = await interpretLaboratory({
        lab_values: labInputs
      });
      if (res?.data) {
        setLabResult(res.data);
      }
    } catch (err) {
      console.error('Patient lab interpretation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const patientFriendlySymptoms = [
    { label: 'Fever or Chills', value: 'fever' },
    { label: 'Cough', value: 'cough' },
    { label: 'Shortness of Breath', value: 'shortness of breath' },
    { label: 'Chest Pain or Discomfort', value: 'chest pain' },
    { label: 'Headache', value: 'headache' },
    { label: 'Dizziness or Lightheadedness', value: 'dizziness' },
    { label: 'Stomach Ache / Cramps', value: 'stomach pain' },
    { label: 'Diarrhea', value: 'diarrhea' },
    { label: 'Nausea or Vomiting', value: 'nausea' },
    { label: 'Pain When Urinating', value: 'painful urination' },
    { label: 'Extreme Tiredness / Fatigue', value: 'fatigue' },
    { label: 'Skin Rash', value: 'rash' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Patient Friendly Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
            AI Health Assistant & Guidance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            How Are You Feeling Today?
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl leading-relaxed">
            Get instant, easy-to-understand insights into your symptoms, learn what your lab test results mean, and receive personalized everyday wellness recommendations.
          </p>
        </div>

        {/* Clear Patient Disclaimer */}
        <div className="mt-6 pt-4 border-t border-white/20 flex items-start gap-2.5 text-xs text-blue-100">
          <Info className="w-4 h-4 text-blue-200 shrink-0 mt-0.5" />
          <span>
            <strong>Friendly Reminder:</strong> This AI Health Assistant provides educational guidance and helps you prepare for your doctor visit. It is not an official medical diagnosis. If you have severe symptoms, please contact emergency services or visit a clinic immediately.
          </span>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'symptoms', label: 'Symptom Checker & Triage', icon: Stethoscope },
          { id: 'labs', label: 'Understand My Lab Results', icon: FlaskConical },
          { id: 'advice', label: 'Personal Health & Habits', icon: HeartPulse }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[180px] flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                isActive
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SYMPTOM CHECKER & TRIAGE */}
      {/* ========================================================================= */}
      {activeTab === 'symptoms' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">What symptoms are you experiencing?</h2>
              <p className="text-xs text-slate-500 mt-1">Tap the symptoms below that match how you feel right now:</p>
            </div>

            {/* Tap Chips */}
            <div className="flex flex-wrap gap-2">
              {patientFriendlySymptoms.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym.value);
                return (
                  <button
                    key={sym.value}
                    onClick={() => (isSelected ? handleRemoveSymptom(sym.value) : handleAddSymptom(sym.value))}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sym.label} {isSelected ? ' ✓' : ' +'}
                  </button>
                );
              })}
            </div>

            {/* Custom Symptom Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSymptom(customSymptom)}
                placeholder="Other symptom (e.g. sore throat, runny nose)..."
                className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <button
                onClick={() => handleAddSymptom(customSymptom)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Add
              </button>
            </div>

            {/* Severity and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">How intense is it?</label>
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
                <label className="text-xs font-bold text-slate-600 block mb-1.5">How long have you had it?</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. Since yesterday, 3 days"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || selectedSymptoms.length === 0}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Check My Symptoms
            </button>
          </div>

          {/* Results Display */}
          {symptomResult && (
            <div className="space-y-6">
              {/* Guidance / Urgency Card */}
              <div
                className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  symptomResult.has_red_flags
                    ? 'bg-red-50 border-red-200 text-red-950'
                    : symptomResult.urgency_level.includes('Urgent')
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
                    {symptomResult.has_red_flags ? (
                      <ShieldAlert className="w-5 h-5 text-red-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                    Recommended Next Step
                  </div>
                  <h3 className="text-xl font-extrabold">{symptomResult.urgency_level}</h3>
                  <p className="text-xs opacity-90 max-w-xl leading-relaxed">
                    {symptomResult.has_red_flags
                      ? 'Your symptoms include critical signs. We strongly advise visiting a clinic or emergency care promptly.'
                      : 'We recommend scheduling a consultation with a clinic doctor to get an accurate assessment and relief.'}
                  </p>
                </div>

                <button
                  onClick={() => navigate('/patient/book-appointment')}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book Doctor Appointment
                </button>
              </div>

              {/* Possible Causes (in simple words) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Possible Reasons For Your Symptoms
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {symptomResult.possible_conditions?.slice(0, 4).map((cond) => (
                    <div
                      key={cond.code}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold text-sm">{cond.condition_name}</strong>
                        <span className="text-xs font-extrabold text-blue-600">{cond.confidence_score}% match</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Suggested Doctor Specialty: <strong>{cond.recommended_specialist}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tests the doctor might suggest */}
              {symptomResult.recommended_laboratory_tests?.length > 0 && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-teal-600" />
                    Diagnostic Tests Your Doctor May Suggest
                  </h3>
                  <p className="text-xs text-slate-500">
                    Doctors commonly request these tests to verify your health and rule out complications:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {symptomResult.recommended_laboratory_tests.slice(0, 4).map((lab) => (
                      <div key={lab.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <strong className="text-slate-900 block font-bold mb-0.5">{lab.name}</strong>
                        <span className="text-slate-600 text-2xs leading-relaxed">{lab.rationale}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LAB RESULTS EXPLAINER */}
      {/* ========================================================================= */}
      {activeTab === 'labs' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-teal-600" />
                Check Your Lab Test Numbers
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your test numbers from your lab report to understand what they mean in simple words:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Fasting Blood Sugar (Normal: 70–99 mg/dL)
                </label>
                <input
                  type="number"
                  value={labInputs.fasting_glucose}
                  onChange={(e) => setLabInputs({ ...labInputs, fasting_glucose: parseFloat(e.target.value) || '' })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Total Cholesterol (Normal: 125–200 mg/dL)
                </label>
                <input
                  type="number"
                  value={labInputs.total_cholesterol}
                  onChange={(e) => setLabInputs({ ...labInputs, total_cholesterol: parseFloat(e.target.value) || '' })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Hemoglobin / Iron (Normal: 12–17 g/dL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={labInputs.hemoglobin}
                  onChange={(e) => setLabInputs({ ...labInputs, hemoglobin: parseFloat(e.target.value) || '' })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Platelet Count (Normal: 150–450 x10^9/L)
                </label>
                <input
                  type="number"
                  value={labInputs.platelets}
                  onChange={(e) => setLabInputs({ ...labInputs, platelets: parseFloat(e.target.value) || '' })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              onClick={handleInterpret}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Explain My Lab Numbers
            </button>
          </div>

          {/* Explanations Output */}
          {labResult && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-800">Summary Of Your Results</h3>
              <div className="space-y-3">
                {labResult.detailed_results?.map((row) => (
                  <div
                    key={row.test_key}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      row.is_critical
                        ? 'bg-red-50 border-red-200'
                        : row.status !== 'Normal'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-bold text-sm">{row.test_name}</strong>
                        <span
                          className={`text-2xs px-2 py-0.5 rounded-full font-bold uppercase ${
                            row.is_critical
                              ? 'bg-red-600 text-white'
                              : row.status !== 'Normal'
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {row.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{row.clinical_meaning}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold font-mono text-slate-800">
                        {row.value} {row.unit}
                      </div>
                      <span className="text-2xs text-slate-500">Normal: {row.reference_range}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PERSONAL HEALTH & HABITS */}
      {/* ========================================================================= */}
      {activeTab === 'advice' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Wellness Habits */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-blue-700 font-bold text-base border-b pb-3">
                <HeartPulse className="w-5 h-5" />
                Everyday Wellness Habits
              </div>
              <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Hydration:</strong> Aim for 8 glasses (around 2 liters) of clean water each day.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Daily Movement:</strong> At least 30 minutes of brisk walking or light exercise daily.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Less Salt:</strong> Moderate salty and ultra-processed food to keep your blood pressure healthy.</span>
                </li>
              </ul>
            </div>

            {/* When to see a doctor */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-base border-b pb-3">
                <Clock className="w-5 h-5" />
                Routine Checkups
              </div>
              <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <span><strong>Annual Checkup:</strong> Schedule an annual wellness exam to check your vitals and blood sugar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <span><strong>Prescription Reviews:</strong> Never stop or change medications without consulting your doctor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <span><strong>Flu Shots:</strong> Annual influenza immunization helps keep seasonal colds and flus away.</span>
                </li>
              </ul>
            </div>

            {/* Home Tracking Tips */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-teal-700 font-bold text-base border-b pb-3">
                <Activity className="w-5 h-5" />
                Home Tracking Tips
              </div>
              <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                  <span><strong>Blood Pressure:</strong> Rest quietly for 5 minutes before checking your blood pressure at home.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                  <span><strong>Keep a Symptom Note:</strong> Note down when symptoms start and what makes them better or worse.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                  <span><strong>Emergency Warning:</strong> Chest pain or shortness of breath always warrants prompt medical attention.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
