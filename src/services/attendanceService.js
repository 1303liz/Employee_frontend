import api from './api';

const attendanceService = {
  getMyAttendance: async () => {
    const response = await api.get('/attendance/my-attendance');
    return response.data;
  },

  getAllAttendance: async () => {
    const response = await api.get('/attendance');
    return response.data;
  },

  checkIn: async () => {
    const response = await api.post('/attendance/check-in');
    return response.data;
  },

  checkOut: async () => {
    const response = await api.post('/attendance/check-out');
    return response.data;
  },

  markAttendance: async (attendanceData) => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },
};

export default attendanceService;
