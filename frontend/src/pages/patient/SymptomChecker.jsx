import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { checkSymptoms } from '../../api/SymptomChecker';
import { AlertCircle, CheckCircle, Activity, Stethoscope, Loader } from 'lucide-react';

export default function SymptomChecker() {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const commonSymptoms = [
    'Cough',
    'Sore throat',
    'Runny nose',
    'Fever',
    'Body aches',
    'Fatigue',
    'Headache',
    'Nausea',
    'Diarrhea',
    'Rash',
    'Shortness of breath',
    'Chest pain',
  ];

  const addSymptom = (symptom) => {
    if (!symptoms.includes(symptom) && symptom.trim()) {
      setSymptoms([...symptoms, symptom]);
      setSymptomInput('');
    }
  };

  const removeSymptom = (symptom) => {
    setSymptoms(symptoms.filter((s) => s !== symptom));
  };

  const handleAddCustomSymptom = () => {
    if (symptomInput.trim()) {
      addSymptom(symptomInput.trim());
    }
  };

  const handleAnalyze = async () => {
    if (symptoms.length === 0) {
      setError('Please add at least one symptom');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await checkSymptoms({
        symptoms,
        duration: duration || null,
        severity,
        age: age ? parseInt(age) : null,
      });

      setAnalysis(response);
      setShowResults(true);
    } catch (err) {
      setError(err.message || 'Failed to analyze symptoms. Please try again.');
      console.error('Symptom analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSymptoms([]);
    setSymptomInput('');
    setDuration('');
    setSeverity('mild');
    setAge('');
    setAnalysis(null);
    setError(null);
    setShowResults(false);
  };

  if (showResults && analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Symptom Analysis Results</h1>
            <p className="text-gray-600">Based on your reported symptoms</p>
          </div>

          {/* Alert if urgent care needed */}
          {analysis.requires_urgent_care && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-red-800 mb-1">Urgent Care Required</h3>
                <p className="text-red-700">
                  Your symptoms suggest a potentially serious condition. Please seek immediate medical attention.
                </p>
              </div>
            </div>
          )}

          {/* Symptom Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Symptoms Analyzed</h2>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom) => (
                <span key={symptom} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {symptom}
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Severity</p>
                <p className="font-semibold text-gray-900 capitalize">{analysis.severity_assessment}</p>
              </div>
              <div>
                <p className="text-gray-600">Duration</p>
                <p className="font-semibold text-gray-900">{analysis.duration_assessment}</p>
              </div>
            </div>
          </div>

          {/* Possible Conditions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="text-blue-600" size={24} />
              Possible Conditions
            </h2>
            {analysis.possible_conditions.length > 0 ? (
              <div className="space-y-3">
                {analysis.possible_conditions.map((condition, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{condition.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">
                          Estimated Severity: {condition.estimated_severity}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{condition.confidence_level}%</div>
                        <p className="text-xs text-gray-500">Confidence</p>
                      </div>
                    </div>
                    {condition.matched_symptoms.length > 0 && (
                      <div className="text-sm">
                        <p className="text-gray-600 mb-1">Matching symptoms:</p>
                        <div className="flex flex-wrap gap-1">
                          {condition.matched_symptoms.map((symptom, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No specific conditions identified based on your symptoms.</p>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Stethoscope className="text-green-600" size={24} />
              Recommendations
            </h2>
            <div className="space-y-4">
              {analysis.recommendations.map((rec, idx) => (
                <div key={idx} className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{rec.action}</h3>
                      <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                      {rec.type === 'laboratory' && rec.tests && (
                        <div className="mt-2 text-sm">
                          <p className="font-medium text-gray-800 mb-1">Available Tests:</p>
                          <ul className="list-disc list-inside bg-white p-2 rounded text-gray-700">
                            {rec.tests.map((test, i) => (
                              <li key={i}>{test}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {rec.type === 'consultation' && rec.specialist && (
                        <p className="mt-2 text-sm font-medium text-gray-800">
                          Suggested Specialist: {rec.specialist}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Important Disclaimer:</strong> {analysis.disclaimer}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Start Over
            </button>
            <button
              onClick={() => {
                /* Schedule appointment logic */
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Schedule Appointment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Symptom Checker</h1>
          <p className="text-gray-600">Describe your symptoms to get preliminary health insights and next steps</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Symptom Selection */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-900 mb-4">Select or Add Symptoms *</label>

            {/* Quick Select Buttons */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Common symptoms:</p>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => addSymptom(symptom)}
                    disabled={symptoms.includes(symptom)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      symptoms.includes(symptom)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-60`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Symptom Input */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">or add custom symptoms:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomSymptom();
                    }
                  }}
                  placeholder="Type a symptom (e.g., dizziness, fatigue)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddCustomSymptom}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-medium hover:bg-blue-200 transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Selected Symptoms */}
            {symptoms.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Symptoms ({symptoms.length})</p>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom) => (
                    <div
                      key={symptom}
                      className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm"
                    >
                      {symptom}
                      <button
                        onClick={() => removeSymptom(symptom)}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="less_than_24h">Less than 24h</option>
                <option value="1_to_3_days">1-3 days</option>
                <option value="4_to_7_days">4-7 days</option>
                <option value="more_than_7_days">More than 7 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Age (Optional)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                max="150"
                placeholder="Your age"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-blue-400 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Symptoms'
            )}
          </button>

          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>💡 How this works:</strong> This AI-powered tool analyzes your symptoms to identify possible conditions
              and provide recommendations for next steps. It's not a replacement for professional medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
