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
  RefreshCw,
  MessageSquare,
  UserCheck,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight,
  Send
} from 'lucide-react';
import { analyzeSymptoms, getDoctorNotes, getClinicDoctors } from '../../api/DecisionSupport';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export default function HealthDSS() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState(['fever', 'cough']);
  const [customSymptom, setCustomSymptom] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [duration, setDuration] = useState('2 days');
  const [result, setResult] = useState(null);

  // Doctor notes state
  const [doctorNotes, setDoctorNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [clinicDoctors, setClinicDoctors] = useState([]);

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
    loadDoctorNotes();
    loadClinicDoctors();
  }, []);

  const loadDoctorNotes = async () => {
    try {
      setLoadingNotes(true);
      const res = await getDoctorNotes();
      if (res?.data) {
        setDoctorNotes(res.data);
      }
    } catch (err) {
      console.error('Failed to load doctor notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const loadClinicDoctors = async () => {
    try {
      const res = await getClinicDoctors();
      if (res?.data) {
        setClinicDoctors(res.data);
      }
    } catch (err) {
      console.error('Failed to load clinic doctors:', err);
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

  const handleConnectToDoctor = (doctor, note = null) => {
    if (!doctor) return;
    navigate('/patient/messages', {
      state: {
        contactId: doctor.id,
        contactName: doctor.name,
        contactRole: 'doctor',
        defaultMessage: note
          ? `Hello Dr. ${doctor.name}, I reviewed your note on my Health DSS ("${note.note.slice(0, 60)}...") and would like to ask a follow-up question.`
          : `Hello Dr. ${doctor.name}, I have checked my symptoms on the Health DSS assistant and would like to consult with you.`
      }
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Friendly Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
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

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SECTION: DOCTOR'S CLINICAL NOTES & RECOMMENDATIONS          */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Doctor's Clinical Notes & Suggestions
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Personalized guidance, suggested lab evaluations, and clinical advice sent by your doctor.
            </p>
          </div>

          <button
            onClick={loadDoctorNotes}
            disabled={loadingNotes}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 self-start sm:self-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingNotes ? 'animate-spin' : ''}`} />
            Refresh Notes
          </button>
        </div>

        {loadingNotes ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
            <p className="text-xs">Loading doctor suggestions...</p>
          </div>
        ) : doctorNotes.length > 0 ? (
          <div className="space-y-4">
            {doctorNotes.map((item) => {
              const doc = item.doctor || {};
              const isUrgent = item.urgency_level?.toLowerCase().includes('urgent');

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/20 p-5 shadow-xs transition-all hover:border-blue-200 hover:shadow-md space-y-4"
                >
                  {/* Note Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {doc.name ? doc.name.charAt(0).toUpperCase() : 'D'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-slate-900">
                            Dr. {doc.name || 'Attending Physician'}
                          </h3>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Doctor Verified
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-2xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(item.created_at)}
                          </span>
                          {doc.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {doc.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span
                        className={`text-2xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          isUrgent
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {item.urgency_level || 'Clinical Note'}
                      </span>
                    </div>
                  </div>

                  {/* Note Content */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Doctor's Message & Suggestion:
                    </p>
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                      {item.note}
                    </p>
                  </div>

                  {/* Conditions & Labs if suggested */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.suggested_conditions && item.suggested_conditions.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-2xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-blue-600" />
                          Suggested Medical Considerations
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.suggested_conditions.map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-800 text-2xs font-semibold"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.suggested_labs && item.suggested_labs.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-2xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                          <FlaskConical className="w-3 h-3 text-teal-600" />
                          Recommended Diagnostic Tests
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.suggested_labs.map((l, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-white border border-teal-200 text-teal-800 text-2xs font-semibold"
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CONNECT TO DOCTOR ACTIONS */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <p className="text-2xs text-slate-500">
                      Have questions about this clinical recommendation? Connect directly with Dr. {doc.name || 'your doctor'}.
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConnectToDoctor(doc, item)}
                        className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Message Dr. {doc.name?.split(' ')[0] || 'Doctor'}
                      </button>

                      <button
                        onClick={() => navigate('/patient/book-appointment')}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">
                No Personal Doctor Notes Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Once a physician reviews your symptoms or clinical records, their personalized notes, suggestions, and diagnostic recommendations will appear right here.
              </p>
            </div>

            {clinicDoctors.length > 0 && (
              <div className="pt-2">
                <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Connect with Available Clinic Doctors:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {clinicDoctors.slice(0, 3).map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleConnectToDoctor(doc)}
                      className="px-3 py-1.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                      Dr. {doc.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2-Column Symptom Checker & Test Suggestions Layout         */}
      {/* ─────────────────────────────────────────────────────────── */}
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
