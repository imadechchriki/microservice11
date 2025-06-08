import axios from 'axios';

const STATISTICS_API_URL = import.meta.env.VITE_STATISTICS_API_URL || 'http://localhost:5246/api';

const statisticsApi = axios.create({
  baseURL: STATISTICS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const statisticsService = {
  // Health check
  async checkHealth() {
    const response = await statisticsApi.get('/Statistics/health');
    return response.data;
  },

  // Get overall statistics
  async getOverallStatistics() {
    const response = await statisticsApi.get('/Statistics/overall');
    return response.data;
  },

  // Get all available publications
  async getAllPublications() {
    const response = await statisticsApi.get('/Statistics/publications');
    return response.data;
  },

  // Get questionnaire statistics by publication ID
  async getQuestionnaireStatistics(publicationId) {
    const response = await statisticsApi.get(`/Statistics/questionnaire/${publicationId}`);
    return response.data;
  },

  // Get submissions by publication ID
  async getSubmissions(publicationId) {
    const response = await statisticsApi.get(`/Statistics/submissions/${publicationId}`);
    return response.data;
  },

  // Get publications summary
  async getPublicationsSummary(publicationIds) {
    const response = await statisticsApi.post('/Statistics/publications/summary', publicationIds);
    return response.data;
  },
};

export default statisticsService; 