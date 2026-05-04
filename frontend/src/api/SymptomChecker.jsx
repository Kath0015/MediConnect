import api from './axios';

/**
 * Check symptoms and get AI-powered analysis
 * @param {Object} data - Symptom data
 * @param {string[]} data.symptoms - Array of symptoms
 * @param {string} [data.duration] - Duration of symptoms
 * @param {string} [data.severity] - Severity level (mild, moderate, severe)
 * @param {number} [data.age] - Patient's age
 * @returns {Promise<Object>} Analysis results with possible conditions and recommendations
 */
export const checkSymptoms = async (data) => {
  try {
    const response = await api.post('/api/symptom-check', data);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to analyze symptoms');
    }
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export default {
  checkSymptoms,
};
