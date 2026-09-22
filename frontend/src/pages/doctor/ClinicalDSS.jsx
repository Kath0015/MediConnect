import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Stethoscope,
  FlaskConical,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  X,
  ShieldAlert,
  Info,
  RefreshCw,
  Users,
  ChevronRight
} from 'lucide-react';
import { analyzeSymptoms } from '../../api/DecisionSupport';

export default function ClinicalDSS() {
  const [loading, setLoading] = useState(false);
  const [symptomsList, setSymptomsList] = useState(['fever', 'cough', 'shortness of breath']);
  const [customSymptom, setCustomSymptom] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [duration, setDuration] = useState('3 days');
  const [patientAge, setPatientAge] = useState(45);
  const [patientGender, setPatientGender] = useState('male');
  const [result, setResult] = useState(null);

  // Common quick-pick symptoms
  const commonSymptoms = [
    'fever',
    'cough',
    'shortness of breath',
    'chest pain',
    'headache',
    'dizziness',
    'fatigue',
    'nausea',
    'vomiting',
    'diarrhea',
    'stomach pain',
    'painful urination',
    'frequent urination',
    'increased thirst',
    'body aches',
    'chills',
    'rash'
  ];

  // Run initial analysis on mount
  useEffect(() => {
    handleAnalyze();
  }, []);

  const handleAnalyze = async () => {
    if (symptomsList.length === 0) return;
    try {
      setLoading(true);
      const res = await analyzeSymptoms({
        symptoms: symptomsList,
        severity,
        duration,
        age: patientAge ? parseInt(patientAge) : null,
        gender: patientGender
      });
      if (res?.data) {
        setResult(res.data);
      }
    } catch (err) {
      console.error('Symptom analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSymptom = (sym) => {
    if (symptomsList.includes(sym)) {
      setSymptomsList(symptomsList.filter((s) => s !== sym));
    } else {
      setSymptomsList([...symptomsList, sym]);
    }
  };

  const handleAddCustom = () => {
    const clean = customSymptom.trim().toLowerCase();
    if (clean && !symptomsList.includes(clean)) {
      setSymptomsList([...symptomsList, clean]);
    }
    setCustomSymptom('');
  };

  const handleClearAll = () => {
    setSymptomsList([]);
    setResult(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Streamlined Header */}
      <div className="bg-gradient-to-r from-teal-700 to-cyan-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-cyan-200 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Symptom-Based Clinical Assistant
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Clinical Decision Support (DSS)
            </h1>
            <p className="text-teal-100 text-sm max-w-2xl leading-relaxed">
              Select or enter patient symptoms to receive instant condition suggestions, recommended diagnostic laboratory tests, and clinical referral advice.
            </p>
          </div>

          {result && (
            <button
              onClick={handleAnalyze}
              disabled={loading || symptomsList.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all self-start sm:self-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Re-analyze
            </button>
          )}
        </div>

        {/* Short Legal Note */}
        <div className="mt-4 pt-3 border-t border-teal-600/60 flex items-center gap-2 text-xs text-teal-100/90">
          <Info className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
          <span>Supports clinical assessment based on patient symptoms. Does not replace formal medical diagnosis.</span>
        </div>
      </div>

      {/* Main 2-Column Working Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Symptom Input & Parameters */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              Patient Symptoms ({symptomsList.length})
            </h2>
            {symptomsList.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Quick Select Common Symptoms */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Quick Select Common Symptoms
            </label>
            <div className="flex flex-wrap gap-1.5">
              {commonSymptoms.map((sym) => {
                const isSelected = symptomsList.includes(sym);
                return (
                  <button
                    key={sym}
                    onClick={() => handleToggleSymptom(sym)}
                    className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sym} {isSelected ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Custom Symptom Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              placeholder="Type custom symptom and press Enter..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
            <button
              onClick={handleAddCustom}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {/* Selected Symptoms Chips */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-16">
            <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Active Selection
            </span>
            {symptomsList.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No symptoms selected. Click tags above.</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {symptomsList.map((sym) => (
                  <span
                    key={sym}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-teal-200 text-teal-800 rounded-lg text-xs font-medium shadow-2xs"
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

          {/* Simple Severity & Duration */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 3 days"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Age</label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Gender</label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || symptomsList.length === 0}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Analyzing Symptoms...' : 'Analyze Symptoms & Get Recommendations'}
          </button>
        </div>

        {/* RIGHT COLUMN: Instant AI Suggestions Output */}
        <div className="lg:col-span-7 space-y-5">
          {result ? (
            <>
              {/* Urgency Level Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  result.has_red_flags
                    ? 'bg-red-50 border-red-200 text-red-950'
                    : result.urgency_level.includes('Urgent')
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.has_red_flags ? (
                    <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  )}
                  <div>
                    <span className="text-2xs font-bold uppercase tracking-wider block">Clinical Urgency Assessment</span>
                    <strong className="text-base font-extrabold">{result.urgency_level}</strong>
                  </div>
                </div>
                {result.has_red_flags && (
                  <span className="px-2.5 py-1 bg-red-600 text-white text-2xs font-bold uppercase rounded-full tracking-wider animate-pulse">
                    Red Flag Sign
                  </span>
                )}
              </div>

              {/* Suggested Medical Conditions */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2.5">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    Suggested Medical Conditions ({result.possible_conditions?.length || 0})
                  </h3>
                  <span className="text-2xs text-slate-400 font-medium">Ranked by symptom match</span>
                </div>

                {result.possible_conditions?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center">
                    No high-probability condition matches found for the entered symptoms.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {result.possible_conditions.map((cond, idx) => (
                      <div
                        key={cond.code}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-2xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-sm text-slate-900">{cond.condition_name}</span>
                            <span className="text-2xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md font-medium">
                              {cond.category}
                            </span>
                          </div>
                          <span className="text-xs font-extrabold text-teal-700">
                            {cond.confidence_score}% Match
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-teal-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${cond.confidence_score}%` }}
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-2xs text-slate-600 pt-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">Matched:</span>
                            {cond.matched_symptoms.map((ms) => (
                              <span key={ms} className="bg-white border px-1.5 py-0.5 rounded-xs font-medium text-slate-700">
                                {ms}
                              </span>
                            ))}
                          </div>
                          <div>
                            Specialist: <strong className="text-slate-800">{cond.recommended_specialist}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended Diagnostic Laboratory Tests */}
              {result.recommended_laboratory_tests?.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b pb-2.5">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-cyan-600" />
                      Recommended Diagnostic & Laboratory Tests
                    </h3>
                    <span className="text-2xs text-slate-400 font-medium">Tests to confirm diagnosis</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.recommended_laboratory_tests.slice(0, 6).map((lab) => (
                      <div
                        key={lab.name}
                        className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col justify-between space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-xs font-bold text-slate-900">{lab.name}</strong>
                          <span
                            className={`text-2xs uppercase font-bold px-1.5 py-0.5 rounded-sm ${
                              lab.urgency === 'Stat (Immediate)'
                                ? 'bg-red-100 text-red-800'
                                : lab.urgency === 'Urgent'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {lab.urgency}
                          </span>
                        </div>
                        <p className="text-2xs text-slate-600 leading-relaxed">{lab.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">Ready for Symptom Assessment</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select patient symptoms on the left and click <strong>Analyze Symptoms</strong> to view condition suggestions and recommended tests.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
