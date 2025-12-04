import api from './api';

const attendanceService = {
  // Check in
  checkIn: async (data = {}) => {
    const response = await api.post('/attendance-management/check-in/', data);
    return response.data;
  },

  // Check out
  checkOut: async (data = {}) => {
    const response = await api.post('/attendance-management/check-out/', data);
    return response.data;
  },

  // Start break
  startBreak: async (data = {}) => {
    const response = await api.post('/attendance-management/break/start/', data);
    return response.data;
  },

  // End break
  endBreak: async (data = {}) => {
    const response = await api.post('/attendance-management/break/end/', data);
    return response.data;
  },

  // Get my attendance history
  getMyAttendance: async (params = {}) => {
    const response = await api.get('/attendance-management/my/history/', { params });
    return response.data;
  },

  // Get my today's attendance
  getMyTodayAttendance: async () => {
    const response = await api.get('/attendance-management/my/today/');
    return response.data;
  },

  // Get my attendance summary
  getMyAttendanceSummary: async (params = {}) => {
    const response = await api.get('/attendance-management/my/summary/', { params });
    return response.data;
  },

  // Get all attendance records (HR only)
  getAllAttendance: async (params = {}) => {
    const response = await api.get('/attendance-management/records/', { params });
    return response.data;
  },

  // Get attendance record by ID
  getAttendanceById: async (id) => {
    const response = await api.get(`/attendance-management/records/${id}/`);
    return response.data;
  },

  // Update attendance record (HR only)
  updateAttendance: async (id, data) => {
    const response = await api.put(`/attendance-management/records/${id}/`, data);
    return response.data;
  },

  // Get attendance statistics (HR only)
  getAttendanceStatistics: async (params = {}) => {
    const response = await api.get('/attendance-management/statistics/', { params });
    return response.data;
  },

  // Generate attendance report (HR only)
  generateReport: async (reportData) => {
    const response = await api.post('/attendance-management/reports/generate/', reportData);
    return response.data;
  },

  // Get schedules
  getSchedules: async (params = {}) => {
    const response = await api.get('/attendance-management/schedules/', { params });
    return response.data;
  },

  // Get employee schedules
  getEmployeeSchedules: async (params = {}) => {
    const response = await api.get('/attendance-management/employee-schedules/', { params });
    return response.data;
  },

  // Get holidays
  getHolidays: async (params = {}) => {
    const response = await api.get('/attendance-management/holidays/', { params });
    return response.data;
  },

  // Get attendance policies
  getPolicies: async () => {
    const response = await api.get('/attendance-management/policies/');
    return response.data;
  },
};

export default attendanceService;
