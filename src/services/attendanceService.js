import api from './api';

const attendanceService = {
  // Get my attendance records
  getMyAttendance: async () => {
    try {
      const response = await api.get('/attendance-management/records/');
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  // Get attendance by ID
  getAttendanceById: async (id) => {
    try {
      const response = await api.get(`/attendance-management/records/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance details:', error);
      throw error;
    }
  },

  // Check in
  checkIn: async (data) => {
    try {
      const response = await api.post('/attendance-management/check-in/', data);
      return response.data;
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  },

  // Check out
  checkOut: async (data) => {
    try {
      const response = await api.post('/attendance-management/check-out/', data);
      return response.data;
    } catch (error) {
      console.error('Error checking out:', error);
      throw error;
    }
  },

  // Get current attendance status
  getCurrentStatus: async () => {
    try {
      const response = await api.get('/attendance-management/current-status/');
      return response.data;
    } catch (error) {
      console.error('Error fetching current status:', error);
      throw error;
    }
  },

  // HR: Get all attendance records
  getAllAttendance: async (params = {}) => {
    try {
      const response = await api.get('/attendance-management/records/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all attendance:', error);
      throw error;
    }
  },

  // HR: Get attendance dashboard
  getDashboard: async () => {
    try {
      const response = await api.get('/attendance-management/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  },

  // Get work schedules
  getSchedules: async () => {
    try {
      const response = await api.get('/attendance-management/schedules/');
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  },

  // Get employee schedules
  getEmployeeSchedules: async (params = {}) => {
    try {
      const response = await api.get('/attendance-management/employee-schedules/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching employee schedules:', error);
      throw error;
    }
  },

  // Get holidays
  getHolidays: async () => {
    try {
      const response = await api.get('/attendance-management/holidays/');
      return response.data;
    } catch (error) {
      console.error('Error fetching holidays:', error);
      throw error;
    }
  },
};

export default attendanceService;
