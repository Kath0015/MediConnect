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

export default {
  getDSSOverview,
  analyzeSymptoms,
  interpretLaboratory,
  getMyDSSAssessment,
  getPatientDSSAssessment,
  getPredictiveAnalytics,
};
