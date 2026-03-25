import api from './api';

const hrService = {
  // Recruitment
  getRecruitmentQuestions: async () => {
    const response = await api.get('/hr-management/recruitment/questions/');
    return response.data;
  },

  createRecruitmentQuestion: async (payload) => {
    const response = await api.post('/hr-management/recruitment/questions/', payload);
    return response.data;
  },

  getCandidates: async (params = {}) => {
    const response = await api.get('/hr-management/recruitment/candidates/', { params });
    return response.data;
  },

  createCandidate: async (payload) => {
    const response = await api.post('/hr-management/recruitment/candidates/', payload);
    return response.data;
  },

  shortlistCandidate: async (candidateId) => {
    const response = await api.post(`/hr-management/recruitment/candidates/${candidateId}/shortlist/`);
    return response.data;
  },

  getCandidateResponses: async (candidateId) => {
    const response = await api.get(`/hr-management/recruitment/candidates/${candidateId}/responses/`);
    return response.data;
  },

  createCandidateResponse: async (candidateId, payload) => {
    const response = await api.post(`/hr-management/recruitment/candidates/${candidateId}/responses/`, payload);
    return response.data;
  },

  // Training (HR)
  getTrainingPrograms: async () => {
    const response = await api.get('/hr-management/training/programs/');
    return response.data;
  },

  createTrainingProgram: async (payload) => {
    const response = await api.post('/hr-management/training/programs/', payload);
    return response.data;
  },

  getTrainingEnrollments: async (params = {}) => {
    const response = await api.get('/hr-management/training/enrollments/', { params });
    return response.data;
  },

  createTrainingEnrollment: async (payload) => {
    const response = await api.post('/hr-management/training/enrollments/', payload);
    return response.data;
  },

  updateTrainingEnrollment: async (id, payload) => {
    const response = await api.patch(`/hr-management/training/enrollments/${id}/`, payload);
    return response.data;
  },

  // Performance / 360 (HR)
  getPerformanceReviews: async (params = {}) => {
    const response = await api.get('/hr-management/performance/reviews/', { params });
    return response.data;
  },

  createPerformanceReview: async (payload) => {
    const response = await api.post('/hr-management/performance/reviews/', payload);
    return response.data;
  },

  getFeedback360: async (params = {}) => {
    const response = await api.get('/hr-management/performance/feedback-360/', { params });
    return response.data;
  },

  createFeedback360: async (payload) => {
    const response = await api.post('/hr-management/performance/feedback-360/', payload);
    return response.data;
  },

  getFeedbackSummary: async (reviewId) => {
    const response = await api.get(`/hr-management/performance/reviews/${reviewId}/feedback-summary/`);
    return response.data;
  },

  getEmployeePerformanceReport: async (employeeId) => {
    const response = await api.get('/hr-management/performance/reports/employee/', {
      params: { employee_id: employeeId },
    });
    return response.data;
  },

  // ── HR: Training Applications Management ─────────────────────────────────
  getAllTrainingApplications: async (params = {}) => {
    const response = await api.get('/hr-management/training/applications/', { params });
    return response.data;
  },

  updateTrainingApplication: async (id, payload) => {
    const response = await api.patch(`/hr-management/training/applications/${id}/`, payload);
    return response.data;
  },

  // ── Employee-facing: Training Portal ─────────────────────────────────────
  getAvailableTrainings: async () => {
    const response = await api.get('/hr-management/training/available/');
    return response.data;
  },

  getMyTrainingApplications: async () => {
    const response = await api.get('/hr-management/training/my-applications/');
    return response.data;
  },

  applyForTraining: async (payload) => {
    const response = await api.post('/hr-management/training/my-applications/', payload);
    return response.data;
  },

  withdrawTrainingApplication: async (id) => {
    const response = await api.delete(`/hr-management/training/my-applications/${id}/`);
    return response.data;
  },

  getMyTrainingEnrollments: async () => {
    const response = await api.get('/hr-management/training/my-enrollments/');
    return response.data;
  },

  updateMyEnrollmentProgress: async (id, payload) => {
    const response = await api.patch(`/hr-management/training/my-enrollments/${id}/`, payload);
    return response.data;
  },

  // ── Employee-facing: Peer Evaluations ────────────────────────────────────
  getPeerEvaluations: async (params = {}) => {
    const response = await api.get('/hr-management/performance/peer-evaluations/', { params });
    return response.data;
  },

  submitPeerEvaluation: async (payload) => {
    const response = await api.post('/hr-management/performance/peer-evaluations/', payload);
    return response.data;
  },

  updatePeerEvaluation: async (id, payload) => {
    const response = await api.patch(`/hr-management/performance/peer-evaluations/${id}/`, payload);
    return response.data;
  },

  deletePeerEvaluation: async (id) => {
    const response = await api.delete(`/hr-management/performance/peer-evaluations/${id}/`);
    return response.data;
  },

  // ── Employee-facing: My Performance Report ───────────────────────────────
  getMyPerformanceReport: async () => {
    const response = await api.get('/hr-management/performance/my-report/');
    return response.data;
  },

  getMyEmployeeAlerts: async (params = {}) => {
    const response = await api.get('/hr-management/performance/notifications/my-alerts/', { params });
    return response.data;
  },
};

export default hrService;
