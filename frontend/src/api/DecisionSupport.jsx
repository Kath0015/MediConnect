import api from './axios';

/**
 * Fetch overall DSS metrics and active module status
 */
export const getDSSOverview = async () => {
  const response = await api.get('/api/dss/overview');
  return response.data;
};

/**
 * 1. Symptom-Based Decision Support
 * @param {Object} payload - { symptoms: string[], severity: string, duration: string, age: number, gender: string }
 */
export const analyzeSymptoms = async (payload) => {
  const response = await api.post('/api/dss/analyze-symptoms', payload);
  return response.data;
};

/**
 * 2. Laboratory Interpretation
 * @param {Object} payload - { lab_values: Object, lab_request_id?: number }
 */
export const interpretLaboratory = async (payload) => {
  const response = await api.post('/api/dss/interpret-labs', payload);
  return response.data;
};

/**
 * 3, 4, 5. Patient Self-Assessment (for logged-in patient)
 */
export const getMyDSSAssessment = async () => {
  const response = await api.get('/api/dss/my-assessment');
  return response.data;
};

/**
 * 3, 4, 5. Comprehensive Patient Assessment (by ID)
 * @param {number|string} patientId
 */
export const getPatientDSSAssessment = async (patientId) => {
  const response = await api.get(`/api/dss/patient/${patientId}`);
  return response.data;
};

/**
 * 4. Predictive Analytics & Clinic Disease Trends
 */
export const getPredictiveAnalytics = async () => {
  const response = await api.get('/api/dss/predictive-analytics');
  return response.data;
};

/**
 * 5. Doctor DSS Notes & Recommendations for Patient
 */
export const getDoctorNotes = async (patientId = null) => {
  const params = patientId ? { patient_id: patientId } : {};
  const response = await api.get('/api/dss/doctor-notes', { params });
  return response.data;
};

/**
 * Save / Send a Doctor DSS Note & Suggestion to a Patient
 */
export const saveDoctorNote = async (payload) => {
  const response = await api.post('/api/dss/doctor-notes', payload);
  return response.data;
};

/**
 * Get notes sent by the authenticated doctor
 */
export const getDoctorSentNotes = async () => {
  const response = await api.get('/api/dss/doctor-notes/sent');
  return response.data;
};

/**
 * Get list of clinic doctors to connect with
 */
export const getClinicDoctors = async () => {
  const response = await api.get('/api/dss/doctors');
  return response.data;
};

/**
 * 6. Google Sheet Raw Clinical Data Sync & Settings
 */
export const getGoogleSheetSettings = async () => {
  const response = await api.get('/api/dss/google-sheet-settings');
  return response.data;
};

export const syncGoogleSheet = async (url = null) => {
  const response = await api.post('/api/dss/sync-google-sheet', url ? { url } : {});
  return response.data;
};

export const updateGoogleSheetUrl = async (url) => {
  const response = await api.put('/api/dss/google-sheet-url', { url });
  return response.data;
};

export default {
  getDSSOverview,
  analyzeSymptoms,
  interpretLaboratory,
  getMyDSSAssessment,
  getPatientDSSAssessment,
  getPredictiveAnalytics,
  getDoctorNotes,
  saveDoctorNote,
  getDoctorSentNotes,
  getClinicDoctors,
  getGoogleSheetSettings,
  syncGoogleSheet,
  updateGoogleSheetUrl,
};
