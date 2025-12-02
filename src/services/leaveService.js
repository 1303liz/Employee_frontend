import api from './api';

const leaveService = {
  getMyLeaves: async () => {
    const response = await api.get('/leaves/my-leaves');
    return response.data;
  },

  getAllLeaves: async () => {
    const response = await api.get('/leaves');
    return response.data;
  },

  applyLeave: async (leaveData) => {
    const response = await api.post('/leaves', leaveData);
    return response.data;
  },

  updateLeaveStatus: async (id, status) => {
    const response = await api.put(`/leaves/${id}`, { status });
    return response.data;
  },

  deleteLeave: async (id) => {
    const response = await api.delete(`/leaves/${id}`);
    return response.data;
  },
};

export default leaveService;
