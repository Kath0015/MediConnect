import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  FlaskConical,
  TrendingUp,
  Clock,
  HeartPulse,
  RefreshCw,
  Plus,
  X,
  FileText,
  Search,
  Users,
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  getDSSOverview,
  analyzeSymptoms,
  interpretLaboratory,
  getPatientDSSAssessment,
  getPredictiveAnalytics
} from '../../api/DecisionSupport';
import api from '../../api/axios';

export default function ClinicalDSS() {
  const [activeTab, setActiveTab] = useState('symptoms');
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);

  // Tab 1: Symptoms state
  const [symptomsList, setSymptomsList] = useState(['fever', 'cough', 'shortness of breath']);
  const [customSymptom, setCustomSymptom] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [duration, setDuration] = useState('3 days');
  const [patientAge, setPatientAge] = useState(52);
  const [patientGender, setPatientGender] = useState('male');
  const [symptomResult, setSymptomResult] = useState(null);

  // Tab 2: Lab Interpretation state
  const [labInputs, setLabInputs] = useState({
    wbc: 12.8,
    hemoglobin: 13.5,
    platelets: 185,
    fasting_glucose: 142,
    hba1c: 7.4,
    creatinine: 1.1,
    sgpt_alt: 38,
    total_cholesterol: 220,
    potassium: 4.2
  });
  const [labResult, setLabResult] = useState(null);

  // Tab 3 & 5: Patient Assessment state
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientAssessment, setPatientAssessment] = useState(null);

  // Tab 4: Predictive Analytics state
  const [predictiveData, setPredictiveData] = useState(null);

  // Load initial overview and patients
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [ovRes, patRes] = await Promise.all([
        getDSSOverview().catch(() => null),
        api.get('/api/patients').catch(() => ({ data: { data: [] } }))
      ]);

      if (ovRes?.data) setOverview(ovRes.data);
      if (patRes?.data?.data) {
        setPatients(patRes.data.data);
        if (patRes.data.data.length > 0) {
          setSelectedPatientId(patRes.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading DSS initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial symptom analysis on mount
  useEffect(() => {
    handleAnalyzeSymptoms();
    handleInterpretLabs();
    fetchPredictiveAnalytics();
  }, []);

  // When patient selection changes, fetch their assessment
  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientAssessment(selectedPatientId);
    }
  }, [selectedPatientId]);

  const handleAnalyzeSymptoms = async () => {
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
        setSymptomResult(res.data);
      }
    } catch (err) {
      console.error('Symptom DSS error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSymptom = (sym) => {
    const clean = sym.trim().toLowerCase();
    if (clean && !symptomsList.includes(clean)) {
      setSymptomsList([...symptomsList, clean]);
    }
    setCustomSymptom('');
  };

  const handleRemoveSymptom = (sym) => {
    setSymptomsList(symptomsList.filter((s) => s !== sym));
  };

  const handleInterpretLabs = async () => {
    try {
      setLoading(true);
      const res = await interpretLaboratory({
        lab_values: labInputs
      });
      if (res?.data) {
        setLabResult(res.data);
      }
    } catch (err) {
      console.error('Lab DSS error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLabPreset = (type) => {
    if (type === 'critical_dextrose') {
      setLabInputs({
        wbc: 18.5,
        hemoglobin: 11.2,
        platelets: 160,
        fasting_glucose: 340, // Critical High
        hba1c: 11.2,
        creatinine: 2.8,
        sgpt_alt: 65,
        total_cholesterol: 245,
        potassium: 5.9
      });
    } else if (type === 'dengue_fever') {
      setLabInputs({
        wbc: 3.1, // Abnormal Low
        hemoglobin: 14.8,
        platelets: 42, // Critical Low
        fasting_glucose: 90,
        hba1c: 5.2,
        creatinine: 0.9,
        sgpt_alt: 115, // High
        total_cholesterol: 160,
        potassium: 3.8
      });
    } else {
      setLabInputs({
        wbc: 6.8,
        hemoglobin: 14.2,
        platelets: 240,
        fasting_glucose: 88,
        hba1c: 5.1,
        creatinine: 0.9,
        sgpt_alt: 25,
        total_cholesterol: 175,
        potassium: 4.1
      });
    }
  };

  const fetchPatientAssessment = async (patId) => {
    try {
      setLoading(true);
      const res = await getPatientDSSAssessment(patId);
      if (res?.data) {
        setPatientAssessment(res.data);
      }
    } catch (err) {
      console.error('Patient assessment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictiveAnalytics = async () => {
    try {
      const res = await getPredictiveAnalytics();
      if (res?.data) {
        setPredictiveData(res.data);
      }
    } catch (err) {
      console.error('Predictive analytics error:', err);
    }
  };

  const commonSymptomChips = [
    'fever',
    'cough',
    'shortness of breath',
    'chest pain',
    'frequent urination',
    'increased thirst',
    'fatigue',
    'headache',
    'dizziness',
    'diarrhea',
    'vomiting',
    'painful urination',
    'rash',
    'joint pain'
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm border border-cyan-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Clinical Intelligence & Assessment
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI-Based Decision Support System (DSS)
            </h1>
            <p className="text-teal-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              Assisting healthcare professionals with automated symptom pattern recognition, critical laboratory interpretations, predictive risk stratifications, and evidence-based clinical recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                fetchInitialData();
                handleAnalyzeSymptoms();
                handleInterpretLabs();
                fetchPredictiveAnalytics();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 backdrop-blur-sm transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Analytics
            </button>
          </div>
        </div>

        {/* Clinical Disclaimer Alert */}
        <div className="mt-6 pt-4 border-t border-teal-600/50 flex items-start gap-3 text-xs text-teal-100/90">
          <Info className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
          <span>
            <strong>Clinical Notice:</strong> This module provides intelligent recommendations to assist healthcare professionals in decision-making. It does not replace medical diagnosis, but supports clinical assessment based on available patient information.
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
        {[
          { id: 'symptoms', label: '1. Symptom-Based DSS', icon: Stethoscope },
          { id: 'laboratory', label: '2. Laboratory Interpretation', icon: FlaskConical },
          { id: 'clinical', label: '3. Clinical Decision & Risk', icon: Activity },
          { id: 'predictive', label: '4. Predictive Analytics', icon: TrendingUp },
          { id: 'recommendations', label: '5. AI Recommendations', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-teal-800 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SYMPTOM-BASED DECISION SUPPORT */}
      {/* ========================================================================= */}
      {activeTab === 'symptoms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                Analyze Patient Symptoms
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select from common clinical presentations or type custom symptoms.
              </p>
            </div>

            {/* Common Symptom Quick Chips */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                Quick Select Symptoms
              </label>
              <div className="flex flex-wrap gap-1.5">
                {commonSymptomChips.map((sym) => {
                  const isSelected = symptomsList.includes(sym);
                  return (
                    <button
                      key={sym}
                      onClick={() => (isSelected ? handleRemoveSymptom(sym) : handleAddSymptom(sym))}
                      className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sym}
                      {isSelected ? ' ✓' : ' +'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Symptom Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSymptom(customSymptom)}
                placeholder="Type additional symptom & Enter..."
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <button
                onClick={() => handleAddSymptom(customSymptom)}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Active Selected Symptoms Badges */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                Selected Symptoms ({symptomsList.length})
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-16">
                {symptomsList.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No symptoms selected. Click tags above.</span>
                ) : (
                  symptomsList.map((sym) => (
                    <span
                      key={sym}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-teal-200 text-teal-800 rounded-lg text-xs font-semibold shadow-2xs"
                    >
                      {sym}
                      <button
                        onClick={() => handleRemoveSymptom(sym)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Demographic Parameters */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
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
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Age</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAnalyzeSymptoms}
              disabled={loading || symptomsList.length === 0}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Clinical Assessment
            </button>
          </div>

          {/* Results Output Panel */}
          <div className="lg:col-span-7 space-y-6">
            {symptomResult ? (
              <>
                {/* Urgency Status Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                    symptomResult.has_red_flags
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : symptomResult.urgency_level.includes('Urgent')
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {symptomResult.has_red_flags ? (
                      <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs uppercase font-bold tracking-wider">Clinical Urgency Assessment</div>
                      <div className="text-lg font-extrabold">{symptomResult.urgency_level}</div>
                    </div>
                  </div>
                  {symptomResult.has_red_flags && (
                    <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase rounded-full tracking-wider animate-pulse">
                      Red Flag Symptoms
                    </span>
                  )}
                </div>

                {/* Suggested Medical Conditions */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-800">
                      Possible Medical Conditions ({symptomResult.possible_conditions?.length || 0})
                    </h3>
                    <span className="text-xs text-slate-500">Sorted by diagnostic confidence</span>
                  </div>

                  {symptomResult.possible_conditions?.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">
                      No high-probability condition matches found for the entered symptoms. Consider broader panel.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {symptomResult.possible_conditions.map((cond, idx) => (
                        <div
                          key={cond.code}
                          className="p-4 rounded-xl border border-slate-200 hover:border-teal-300 bg-slate-50/50 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-900">{cond.condition_name}</span>
                              <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md font-medium">
                                {cond.category}
                              </span>
                            </div>
                            <span className="text-sm font-extrabold text-teal-700">
                              {cond.confidence_score}% Match
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-teal-600 h-2 rounded-full transition-all"
                              style={{ width: `${cond.confidence_score}%` }}
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-700">Correlated Symptoms:</span>
                              {cond.matched_symptoms.map((ms) => (
                                <span key={ms} className="bg-white border px-2 py-0.5 rounded-sm font-medium text-slate-600">
                                  {ms}
                                </span>
                              ))}
                            </div>
                            <div className="text-slate-500">
                              Follow-up:{' '}
                              <strong className="text-slate-700">
                                {cond.recommended_follow_up_days === 0
                                  ? 'Immediate / STAT'
                                  : `${cond.recommended_follow_up_days} days`}
                              </strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommended Laboratory Tests */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <FlaskConical className="w-5 h-5 text-teal-600" />
                      Recommended Laboratory Diagnostic Tests ({symptomResult.recommended_laboratory_tests?.length || 0})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {symptomResult.recommended_laboratory_tests?.map((lab) => (
                      <div
                        key={lab.name}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-sm text-slate-900">{lab.name}</span>
                            <span
                              className={`text-2xs uppercase font-bold px-2 py-0.5 rounded-full ${
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
                          <span className="text-xs text-slate-500 font-medium block">{lab.category}</span>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{lab.rationale}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">Ready for Symptom Assessment</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Add symptoms and click Generate Clinical Assessment to view suggested differential conditions and diagnostic lab panels.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LABORATORY INTERPRETATION ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'laboratory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs & Presets */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-teal-600" />
                Laboratory Test Parameters
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter lab test values to evaluate against clinical reference intervals and critical panic cutoffs.
              </p>
            </div>

            {/* Quick Demo Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                Quick Clinical Presets
              </label>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => loadLabPreset('critical_dextrose')}
                  className="px-3 py-1.5 text-xs text-left font-medium bg-red-50 hover:bg-red-100 text-red-800 rounded-lg border border-red-200 transition-colors"
                >
                  ⚡ Load Critical Hyperglycemia / Renal Sample
                </button>
                <button
                  onClick={() => loadLabPreset('dengue_fever')}
                  className="px-3 py-1.5 text-xs text-left font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 transition-colors"
                >
                  ⚠️ Load Severe Thrombocytopenia / Dengue Sample
                </button>
                <button
                  onClick={() => loadLabPreset('normal')}
                  className="px-3 py-1.5 text-xs text-left font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors"
                >
                  ✓ Load Normal Physiology Profile
                </button>
              </div>
            </div>

            {/* Lab Values Form */}
            <div className="space-y-3 pt-2 max-h-[480px] overflow-y-auto pr-1">
              {[
                { key: 'wbc', label: 'WBC (White Blood Cells)', unit: 'x10^9/L', step: '0.1' },
                { key: 'hemoglobin', label: 'Hemoglobin (Hgb)', unit: 'g/dL', step: '0.1' },
                { key: 'platelets', label: 'Platelet Count', unit: 'x10^9/L', step: '1' },
                { key: 'fasting_glucose', label: 'Fasting Blood Sugar (FBS)', unit: 'mg/dL', step: '1' },
                { key: 'hba1c', label: 'HbA1c Glycated Hgb', unit: '%', step: '0.1' },
                { key: 'creatinine', label: 'Serum Creatinine', unit: 'mg/dL', step: '0.1' },
                { key: 'sgpt_alt', label: 'ALT / SGPT (Liver)', unit: 'U/L', step: '1' },
                { key: 'total_cholesterol', label: 'Total Cholesterol', unit: 'mg/dL', step: '1' },
                { key: 'potassium', label: 'Serum Potassium (K+)', unit: 'mmol/L', step: '0.1' }
              ].map((field) => (
                <div key={field.key} className="flex items-center justify-between gap-3 text-xs">
                  <label className="font-semibold text-slate-700 flex-1">{field.label}:</label>
                  <div className="flex items-center gap-1.5 w-36">
                    <input
                      type="number"
                      step={field.step}
                      value={labInputs[field.key] ?? ''}
                      onChange={(e) =>
                        setLabInputs({
                          ...labInputs,
                          [field.key]: e.target.value === '' ? '' : parseFloat(e.target.value)
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-right font-mono text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                    <span className="text-2xs text-slate-400 w-12 shrink-0">{field.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleInterpretLabs}
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              Interpret Laboratory Results
            </button>
          </div>

          {/* Interpretation Output */}
          <div className="lg:col-span-8 space-y-6">
            {labResult ? (
              <>
                {/* Overall Rating & Alert Summary */}
                <div
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    labResult.has_critical_findings
                      ? 'bg-red-50 border-red-200 text-red-950'
                      : labResult.summary_counts.abnormal > 0
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider">Diagnostic Assessment</div>
                    <h3 className="text-xl font-extrabold">{labResult.overall_verdict}</h3>
                    <p className="text-xs opacity-90 max-w-xl">{labResult.clinical_guidance}</p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <div className="px-3 py-1.5 rounded-xl bg-white/80 border text-center">
                      <span className="block text-xs text-slate-500 font-semibold">Critical</span>
                      <span className="font-extrabold text-red-600 text-base">
                        {labResult.summary_counts.critical}
                      </span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-white/80 border text-center">
                      <span className="block text-xs text-slate-500 font-semibold">Abnormal</span>
                      <span className="font-extrabold text-amber-600 text-base">
                        {labResult.summary_counts.abnormal}
                      </span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-white/80 border text-center">
                      <span className="block text-xs text-slate-500 font-semibold">Normal</span>
                      <span className="font-extrabold text-emerald-600 text-base">
                        {labResult.summary_counts.normal}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Critical Laboratory Alerts */}
                {labResult.alerts?.length > 0 && (
                  <div className="space-y-2">
                    {labResult.alerts.map((alert, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                          alert.severity === 'Danger'
                            ? 'bg-red-600 text-white border-red-700 shadow-md animate-pulse'
                            : 'bg-amber-100 text-amber-950 border-amber-300'
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold mb-0.5">{alert.test}:</strong>
                          <span>{alert.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Detailed Analysis Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800 text-sm">Detailed Parameter Assessment</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Test</th>
                          <th className="px-4 py-3">Value</th>
                          <th className="px-4 py-3">Reference Interval</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Clinical Significance & Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {labResult.detailed_results?.map((row) => (
                          <tr
                            key={row.test_key}
                            className={row.is_critical ? 'bg-red-50/40' : row.status !== 'Normal' ? 'bg-amber-50/30' : ''}
                          >
                            <td className="px-4 py-3 font-bold text-slate-800">{row.test_name}</td>
                            <td className="px-4 py-3 font-mono font-bold text-slate-900">
                              {row.value} {row.unit}
                            </td>
                            <td className="px-4 py-3 text-slate-500">{row.reference_range}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold uppercase text-2xs ${
                                  row.is_critical
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : row.status.includes('Abnormal')
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 max-w-xs leading-relaxed">
                              <div>{row.clinical_meaning}</div>
                              <div className="text-slate-800 font-semibold mt-1">→ {row.physician_action}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CLINICAL DECISION SUPPORT & RISK FACTORS */}
      {/* ========================================================================= */}
      {activeTab === 'clinical' && (
        <div className="space-y-6">
          {/* Patient Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-teal-600" />
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Select Patient Record</label>
                <div className="text-sm font-bold text-slate-800">Review Clinical Decision Matrix</div>
              </div>
            </div>

            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium w-full sm:w-80"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.patient_category || 'Patient'} - Age {p.age || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          {patientAssessment ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Patient Snapshot & Risk Card */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-bold text-slate-800 text-base">{patientAssessment.patient.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                        patientAssessment.predictive_risk_assessment.risk_level === 'Critical'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : patientAssessment.predictive_risk_assessment.risk_level === 'High'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {patientAssessment.predictive_risk_assessment.risk_level} Risk
                    </span>
                  </div>

                  {/* Risk Score Dial */}
                  <div className="p-4 bg-slate-50 rounded-xl text-center space-y-1">
                    <span className="text-xs text-slate-500 font-semibold">Calculated Composite Risk Score</span>
                    <div className="text-3xl font-extrabold text-teal-800">
                      {patientAssessment.predictive_risk_assessment.risk_score} / 100
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          patientAssessment.predictive_risk_assessment.risk_score >= 70
                            ? 'bg-red-500'
                            : patientAssessment.predictive_risk_assessment.risk_score >= 40
                            ? 'bg-amber-500'
                            : 'bg-teal-500'
                        }`}
                        style={{ width: `${patientAssessment.predictive_risk_assessment.risk_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Patient Info Fields */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Age / Blood Type:</span>
                      <strong className="text-slate-800">
                        {patientAssessment.patient.age || 'N/A'} yrs • {patientAssessment.patient.blood_type || 'Unknown'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <strong className="text-slate-800">{patientAssessment.patient.category || 'General'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <strong className="text-slate-800">{patientAssessment.patient.phone || 'N/A'}</strong>
                    </div>
                  </div>

                  {/* Latest Vitals Snapshot */}
                  {patientAssessment.latest_vitals && (
                    <div className="pt-3 border-t space-y-2">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Latest Recorded Vitals
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-2xs text-slate-400 block">Blood Pressure</span>
                          <strong className="text-slate-800 font-mono">
                            {patientAssessment.latest_vitals.blood_pressure || '--'}
                          </strong>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-2xs text-slate-400 block">Heart Rate</span>
                          <strong className="text-slate-800 font-mono">
                            {patientAssessment.latest_vitals.heart_rate ? `${patientAssessment.latest_vitals.heart_rate} bpm` : '--'}
                          </strong>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-2xs text-slate-400 block">Temperature</span>
                          <strong className="text-slate-800 font-mono">
                            {patientAssessment.latest_vitals.temperature ? `${patientAssessment.latest_vitals.temperature} °C` : '--'}
                          </strong>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-2xs text-slate-400 block">BMI</span>
                          <strong className="text-slate-800 font-mono">
                            {patientAssessment.latest_vitals.bmi || '--'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Decision Support Matrix */}
              <div className="lg:col-span-8 space-y-6">
                {/* Identified Risk Factors */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    Identified Risk Factors & Vulnerabilities
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {patientAssessment.clinical_decision_support.identified_risk_factors.map((rf, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3"
                      >
                        <AlertCircle
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            rf.severity === 'High' ? 'text-red-500' : 'text-amber-500'
                          }`}
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800">{rf.factor}</div>
                          <span className="text-2xs text-slate-400 uppercase font-semibold">{rf.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Follow-up & Specialist Referral */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Follow-Up Recommendation */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                      <Clock className="w-4 h-4" />
                      Recommended Follow-Up
                    </div>
                    <div className="text-lg font-extrabold text-slate-900">
                      {patientAssessment.clinical_decision_support.recommended_follow_up}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Based on current physiological stability, vital sign trends, and risk index evaluation.
                    </p>
                  </div>

                  {/* Specialist Referral */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                      <Users className="w-4 h-4" />
                      Specialist Referral
                    </div>
                    {patientAssessment.clinical_decision_support.recommended_specialist_referrals.map((spec, i) => (
                      <div key={i} className="text-xs space-y-1">
                        <strong className="block text-slate-900 font-bold text-sm">{spec.specialty}</strong>
                        <p className="text-slate-500 leading-relaxed">{spec.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-500">Loading patient decision matrix...</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PREDICTIVE ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'predictive' && (
        <div className="space-y-6">
          {predictiveData ? (
            <>
              {/* Metric Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Critical Risk Patients', count: predictiveData.risk_level_breakdown.Critical, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                  { label: 'High Risk Patients', count: predictiveData.risk_level_breakdown.High, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
                  { label: 'Moderate Risk Patients', count: predictiveData.risk_level_breakdown.Moderate, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                  { label: 'Low Risk Stable', count: predictiveData.risk_level_breakdown.Low, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
                ].map((card) => (
                  <div key={card.label} className={`p-5 rounded-2xl border ${card.bg} ${card.border} shadow-xs`}>
                    <span className="text-xs text-slate-600 font-medium block mb-1">{card.label}</span>
                    <div className={`text-3xl font-extrabold ${card.color}`}>{card.count}</div>
                  </div>
                ))}
              </div>

              {/* Common Illness Trends & Outbreak Forecasts */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-teal-600" />
                      Predicted Common Illnesses & Outbreak Trends
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Clinic epidemiology model forecasting common condition surges and preventative action plans.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg">
                    Algorithmic Projection
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {predictiveData.common_illness_trends.map((trend) => (
                    <div
                      key={trend.condition}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-slate-900">{trend.condition}</span>
                          <span className="text-xs font-bold text-teal-700">{trend.prevalence_rate}</span>
                        </div>
                        <span className="text-2xs text-slate-500 block mb-2">{trend.category}</span>
                        <div className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                          {trend.risk_flag}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                        <strong className="text-slate-700 block mb-0.5">Proactive Clinic Action:</strong>
                        <span>{trend.recommended_actions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* High-Risk Patient Registry Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">High-Risk Patients Requiring Attention</h3>
                    <p className="text-xs text-slate-500">
                      Patients prioritized by physiological anomaly score and vital alerts.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    {predictiveData.high_risk_patients.length} Flagged Patients
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3">Patient Name</th>
                        <th className="px-5 py-3">Age / Gender</th>
                        <th className="px-5 py-3">Risk Level</th>
                        <th className="px-5 py-3">Risk Score</th>
                        <th className="px-5 py-3">Primary Risk Factor</th>
                        <th className="px-5 py-3">Recommended Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {predictiveData.high_risk_patients.map((p) => (
                        <tr key={p.patient_id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-900">{p.name}</td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {p.age || 'N/A'} yrs • {p.gender}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-2xs ${
                                p.risk_level === 'Critical'
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {p.risk_level}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{p.risk_score} / 100</td>
                          <td className="px-5 py-3.5 text-slate-700 font-medium">{p.primary_risk}</td>
                          <td className="px-5 py-3.5 text-teal-700 font-semibold">{p.recommended_follow_up}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-500">Calculating predictive analytics...</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AI RECOMMENDATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Selected Patient</label>
                <div className="text-sm font-bold text-slate-800">
                  {patientAssessment?.patient?.name || 'Loading patient...'}
                </div>
              </div>
            </div>

            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium w-full sm:w-80"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.patient_category || 'Patient'})
                </option>
              ))}
            </select>
          </div>

          {patientAssessment ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Clinical Reminders */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-teal-700 font-bold text-base border-b pb-3">
                  <AlertCircle className="w-5 h-5" />
                  Clinical Reminders
                </div>
                <div className="space-y-3">
                  {patientAssessment.ai_recommendations.clinical_reminders.map((rem, i) => (
                    <div key={i} className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-xs text-teal-900 font-medium leading-relaxed">{rem}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Preventive Care Suggestions */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-base border-b pb-3">
                  <HeartPulse className="w-5 h-5" />
                  Preventive Care Suggestions
                </div>
                <div className="space-y-3">
                  {patientAssessment.ai_recommendations.preventive_care.map((prev, i) => (
                    <div key={i} className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-indigo-950 font-medium leading-relaxed">{prev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Health Monitoring Recommendations */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-cyan-700 font-bold text-base border-b pb-3">
                  <Activity className="w-5 h-5" />
                  Health Monitoring Protocols
                </div>
                <div className="space-y-3">
                  {patientAssessment.ai_recommendations.health_monitoring.map((mon, i) => (
                    <div key={i} className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-100 flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-cyan-950 font-medium leading-relaxed">{mon}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
              <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-slate-500">Loading AI recommendations...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
