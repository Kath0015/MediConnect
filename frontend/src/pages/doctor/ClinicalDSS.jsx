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
  Send,
  MessageSquare,
  FileCheck,
  Search,
  Check
} from 'lucide-react';
import {
  analyzeSymptoms,
  saveDoctorNote,
  getDoctorSentNotes,
  getGoogleSheetSettings,
  syncGoogleSheet,
  updateGoogleSheetUrl,
} from '../../api/DecisionSupport';
import { getPatients } from '../../api/Patients';
import { toast } from 'sonner';

export default function ClinicalDSS() {
  const [loading, setLoading] = useState(false);
  const [symptomsList, setSymptomsList] = useState(['fever', 'cough', 'shortness of breath']);
  const [customSymptom, setCustomSymptom] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [duration, setDuration] = useState('3 days');
  const [patientAge, setPatientAge] = useState(45);
  const [patientGender, setPatientGender] = useState('male');
  const [result, setResult] = useState(null);

  // Google Sheet Data Source State
  const [googleSheetMeta, setGoogleSheetMeta] = useState(null);
  const [googleSheetUrlInput, setGoogleSheetUrlInput] = useState('');
  const [syncingSheet, setSyncingSheet] = useState(false);
  const [showSheetSettings, setShowSheetSettings] = useState(false);

  // Patient suggestion form state
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [doctorNote, setDoctorNote] = useState('');
  const [noteUrgency, setNoteUrgency] = useState('Normal');
  const [sendChatMessage, setSendChatMessage] = useState(true);
  const [sendingNote, setSendingNote] = useState(false);

  // Sent notes history
  const [sentNotes, setSentNotes] = useState([]);
  const [loadingSentNotes, setLoadingSentNotes] = useState(false);
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'history'

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

  // Run initial analysis & load data on mount
  useEffect(() => {
    handleAnalyze();
    loadPatients();
    loadSentNotes();
    loadGoogleSheetSettings();
  }, []);

  const loadGoogleSheetSettings = async () => {
    try {
      const res = await getGoogleSheetSettings();
      if (res?.data) {
        setGoogleSheetMeta(res.data);
        if (res.data.url) {
          setGoogleSheetUrlInput(res.data.url);
        }
      }
    } catch (err) {
      console.error('Failed to load Google Sheet settings:', err);
    }
  };

  const handleSyncGoogleSheet = async () => {
    try {
      setSyncingSheet(true);
      const res = await syncGoogleSheet(googleSheetUrlInput || null);
      toast.success(`Synchronized ${res.data?.count || 0} conditions from Google Sheet raw data!`);
      loadGoogleSheetSettings();
      handleAnalyze();
    } catch (err) {
      console.error('Failed to sync Google Sheet:', err);
      toast.error('Failed to sync Google Sheet data');
    } finally {
      setSyncingSheet(false);
    }
  };

  const handleSaveGoogleSheetUrl = async (e) => {
    e.preventDefault();
    try {
      setSyncingSheet(true);
      await updateGoogleSheetUrl(googleSheetUrlInput);
      toast.success('Google Sheet URL updated and synchronized!');
      setShowSheetSettings(false);
      loadGoogleSheetSettings();
      handleAnalyze();
    } catch (err) {
      console.error('Failed to update Google Sheet URL:', err);
      toast.error('Failed to save Google Sheet URL');
    } finally {
      setSyncingSheet(false);
    }
  };

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const res = await getPatients({ per_page: 100 });
      const patientList = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setPatients(patientList);
      if (patientList.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patientList[0].id);
      }
    } catch (err) {
      console.error('Failed to load patient list:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadSentNotes = async () => {
    try {
      setLoadingSentNotes(true);
      const res = await getDoctorSentNotes();
      if (res?.data) {
        setSentNotes(res.data);
      }
    } catch (err) {
      console.error('Failed to load sent notes:', err);
    } finally {
      setLoadingSentNotes(false);
    }
  };

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

  // Populate note form from DSS analysis
  const handlePopulateFromDSS = () => {
    if (!result) {
      toast.info('Please run symptom analysis first');
      return;
    }

    const topConditions = result.possible_conditions?.slice(0, 3).map((c) => c.condition_name) || [];
    const topLabs = result.recommended_laboratory_tests?.slice(0, 3).map((l) => l.name) || [];

    let draft = `Based on your symptoms (${symptomsList.join(', ')}):\n`;
    if (topConditions.length > 0) {
      draft += `- Potential considerations: ${topConditions.join(', ')}.\n`;
    }
    if (topLabs.length > 0) {
      draft += `- Recommended diagnostic tests: ${topLabs.join(', ')}.\n`;
    }
    draft += `Please monitor your symptoms closely and contact the clinic or book a follow-up consultation if they persist.`;

    setDoctorNote(draft);
    if (result.has_red_flags || result.urgency_level?.includes('Urgent')) {
      setNoteUrgency('Urgent');
    } else {
      setNoteUrgency('Normal');
    }

    toast.success('Clinical suggestion draft populated from DSS analysis');
  };

  // Send doctor note / recommendation to patient
  const handleSendNote = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    if (!doctorNote.trim()) {
      toast.error('Please write a clinical note or suggestion');
      return;
    }

    try {
      setSendingNote(true);
      const topConditions = result?.possible_conditions?.slice(0, 4).map((c) => c.condition_name) || [];
      const topLabs = result?.recommended_laboratory_tests?.slice(0, 4).map((l) => l.name) || [];

      await saveDoctorNote({
        patient_id: selectedPatientId,
        note: doctorNote.trim(),
        symptoms: symptomsList,
        suggested_conditions: topConditions,
        suggested_labs: topLabs,
        urgency_level: noteUrgency,
        send_chat_message: sendChatMessage,
      });

      toast.success('Clinical note and suggestion successfully sent to patient DSS!');
      setDoctorNote('');
      loadSentNotes();
    } catch (err) {
      console.error('Failed to send doctor note:', err);
      toast.error(err.response?.data?.message || 'Failed to send doctor note');
    } finally {
      setSendingNote(false);
    }
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Streamlined Header */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-cyan-200 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Physician Decision Support & Clinical Suggestions
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Clinical Decision Support (DSS)
            </h1>
            <p className="text-teal-100 text-sm max-w-2xl leading-relaxed">
              Analyze patient symptoms, generate diagnostic recommendations, and send verified clinical suggestions directly to your patient's Health DSS dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {result && (
              <button
                onClick={handleAnalyze}
                disabled={loading || symptomsList.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Re-analyze
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-5 pt-4 border-t border-teal-600/60 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'analyzer'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'bg-teal-800/80 text-teal-100 hover:bg-teal-800'
              }`}
            >
              Symptom Analyzer & Suggestion Composer
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'bg-teal-800/80 text-teal-100 hover:bg-teal-800'
              }`}
            >
              Sent Patient Suggestions ({sentNotes.length})
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-teal-200">
            <Info className="w-3.5 h-3.5" />
            <span>Connected to Patient Health DSS & Real-time Messaging</span>
          </div>
        </div>
      </div>

      {/* Google Sheet Raw Data Source Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 14H7v-2h6v2zm4-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">
                  Data Source: Google Sheet Raw Clinical Dataset
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected
                </span>
              </div>
              <p className="text-2xs text-slate-500 mt-0.5">
                {googleSheetMeta?.total_conditions || 20} disease profiles loaded from raw Google dataset • {googleSheetMeta?.synced_at ? `Last synced: ${formatDate(googleSheetMeta.synced_at)}` : 'Active'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={handleSyncGoogleSheet}
              disabled={syncingSheet}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${syncingSheet ? 'animate-spin' : ''}`} />
              {syncingSheet ? 'Syncing...' : 'Sync Google Sheet'}
            </button>

            <button
              type="button"
              onClick={() => setShowSheetSettings(!showSheetSettings)}
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {showSheetSettings ? 'Hide Config' : 'Configure Google Sheet'}
            </button>
          </div>
        </div>

        {/* Expandable Google Sheet URL Form */}
        {showSheetSettings && (
          <form onSubmit={handleSaveGoogleSheetUrl} className="mt-3 pt-3 border-t border-slate-100 space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Google Spreadsheet URL (or published CSV link):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={googleSheetUrlInput}
                  onChange={(e) => setGoogleSheetUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit#gid=0"
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={syncingSheet}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  Save & Sync
                </button>
              </div>
            </div>
            <p className="text-2xs text-slate-500 leading-relaxed">
              💡 <strong>How it works:</strong> Paste any public Google Sheet link containing columns: <em>Condition, Category, Severity, Symptoms, Key Symptoms, Recommended Labs, Specialist</em>. The DSS parses the raw rows in real-time.
            </p>
          </form>
        )}
      </div>

      {activeTab === 'analyzer' ? (
        <>
          {/* Main 2-Column Working Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Symptom Input & Parameters */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
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
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <button
                  onClick={handleAddCustom}
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Selected Symptoms Chips */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 min-h-16">
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
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
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
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
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
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
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
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
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
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
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
                            className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2"
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
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
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
                <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-700">Ready for Symptom Assessment</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Select patient symptoms on the left and click <strong>Analyze Symptoms</strong> to view condition suggestions and recommended tests.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* SECTION: SEND NOTE / SUGGESTION TO PATIENT'S DSS           */}
          {/* ─────────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                    <Send className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Send Clinical Note & Suggestion to Patient
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Compose a personalized suggestion connected directly to the patient's Health DSS dashboard and chat.
                </p>
              </div>

              {result && (
                <button
                  type="button"
                  onClick={handlePopulateFromDSS}
                  className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-center"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Auto-Fill from DSS Analysis
                </button>
              )}
            </div>

            <form onSubmit={handleSendNote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Patient */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Select Patient <span className="text-red-500">*</span>
                  </label>
                  {loadingPatients ? (
                    <div className="text-xs text-slate-400 p-2">Loading patient list...</div>
                  ) : (
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white"
                    >
                      <option value="">-- Choose a patient --</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.user?.name || `Patient #${p.id}`} ({p.user?.email || 'No email'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Urgency Level */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Urgency Assessment
                  </label>
                  <select
                    value={noteUrgency}
                    onChange={(e) => setNoteUrgency(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white"
                  >
                    <option value="Normal">Normal (Routine Guidance)</option>
                    <option value="Follow-up Recommended">Follow-up Recommended</option>
                    <option value="Urgent">Urgent (Prompt Evaluation Needed)</option>
                    <option value="Immediate Attention">Immediate Attention (Red Flag)</option>
                  </select>
                </div>
              </div>

              {/* Note / Message Textarea */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Doctor's Clinical Note & Suggestion <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={doctorNote}
                  onChange={(e) => setDoctorNote(e.target.value)}
                  placeholder="Enter medical suggestions, diagnostic lab instructions, or health advice for the patient..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden resize-y"
                />
              </div>

              {/* Options & Submit */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={sendChatMessage}
                    onChange={(e) => setSendChatMessage(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                  />
                  <span>Also notify patient via direct inbox message</span>
                </label>

                <button
                  type="submit"
                  disabled={sendingNote || !selectedPatientId || !doctorNote.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingNote ? 'Sending Suggestion...' : 'Send Suggestion to Patient'}
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Sent DSS Suggestions History</h2>
              <p className="text-xs text-slate-500">Record of clinical suggestions you have sent to patients.</p>
            </div>
            <button
              onClick={loadSentNotes}
              disabled={loadingSentNotes}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSentNotes ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loadingSentNotes ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
              <p className="text-xs">Loading sent suggestions...</p>
            </div>
          ) : sentNotes.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No suggestions sent yet</p>
              <p className="text-2xs text-slate-400">Compose and send suggestions from the Symptom Analyzer tab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        To: {note.patient?.user?.name || `Patient #${note.patient_id}`}
                      </span>
                      <span className="text-2xs text-slate-500">({note.patient?.user?.email})</span>
                    </div>

                    <div className="flex items-center gap-2 text-2xs text-slate-500">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
                        {note.urgency_level || 'Normal'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                    {note.note}
                  </p>

                  {(note.suggested_conditions?.length > 0 || note.suggested_labs?.length > 0) && (
                    <div className="flex flex-wrap gap-2 pt-1 text-2xs">
                      {note.suggested_conditions?.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold border border-blue-200">
                          {c}
                        </span>
                      ))}
                      {note.suggested_labs?.map((l, i) => (
                        <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md font-semibold border border-teal-200">
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
