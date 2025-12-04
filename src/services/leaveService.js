import api from './api';

const leaveService = {
  // Get all leave applications
  getAllLeaves: async (params = {}) => {
    const response = await api.get('/leave-management/applications/', { params });
    return response.data;
  },

  // Get my leave applications
  getMyLeaves: async (params = {}) => {
    const response = await api.get('/leave-management/applications/', { 
      params: { ...params, my_applications: true } 
    });
    return response.data;
  },

  // Get leave application by ID
  getLeaveById: async (id) => {
    const response = await api.get(`/leave-management/applications/${id}/`);
    return response.data;
  },

  // Get leave types
  getLeaveTypes: async () => {
    const response = await api.get('/leave-management/types/');
    return response.data;
  },

  // Apply for leave
  applyLeave: async (leaveData) => {
    const response = await api.post('/leave-management/applications/', leaveData);
    return response.data;
  },

  // Update leave application
  updateLeave: async (id, leaveData) => {
    const response = await api.put(`/leave-management/applications/${id}/`, leaveData);
    return response.data;
  },

  // Partial update leave
  patchLeave: async (id, leaveData) => {
    const response = await api.patch(`/leave-management/applications/${id}/`, leaveData);
    return response.data;
  },

  // Delete leave application
  deleteLeave: async (id) => {
    const response = await api.delete(`/leave-management/applications/${id}/`);
    return response.data;
  },

  // Approve/reject leave (HR only)
  updateLeaveStatus: async (id, status, comments = '') => {
    const response = await api.post(`/leave-management/applications/${id}/approve/`, {
      status,
      comments,
    });
    return response.data;
  },

  // Bulk approve leaves (HR only)
  bulkApproveLeaves: async (leaveIds) => {
    const response = await api.post('/leave-management/bulk-approve/', {
      leave_ids: leaveIds,
    });
    return response.data;
  },

  // Get my leave balances
  getMyLeaveBalances: async () => {
    const response = await api.get('/leave-management/my-balances/');
    return response.data;
  },

  // Get all leave balances (HR only)
  getAllLeaveBalances: async (params = {}) => {
    const response = await api.get('/leave-management/balances/', { params });
    return response.data;
  },

  // Get my leave summary
  getMyLeaveSummary: async () => {
    const response = await api.get('/leave-management/my-summary/');
    return response.data;
  },

  // Get leave statistics (HR only)
  getLeaveStatistics: async (params = {}) => {
    const response = await api.get('/leave-management/statistics/', { params });
    return response.data;
  },

  // Get leave types
  getLeaveTypes: async () => {
    const response = await api.get('/leave-management/types/');
    return response.data;
  },

  // Create leave type (HR only)
  createLeaveType: async (leaveTypeData) => {
    const response = await api.post('/leave-management/types/', leaveTypeData);
    return response.data;
  },

  // Update leave type (HR only)
  updateLeaveType: async (id, leaveTypeData) => {
    const response = await api.put(`/leave-management/types/${id}/`, leaveTypeData);
    return response.data;
  },

  // Delete leave type (HR only)
  deleteLeaveType: async (id) => {
    const response = await api.delete(`/leave-management/types/${id}/`);
    return response.data;
  },

  // Add leave attachment
  addLeaveAttachment: async (leaveId, formData) => {
    const response = await api.post(
      `/leave-management/applications/${leaveId}/attachments/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Add leave comment
  addLeaveComment: async (leaveId, commentData) => {
    const response = await api.post(
      `/leave-management/applications/${leaveId}/comments/`,
      commentData
    );
    return response.data;
  },
};

export default leaveService;
