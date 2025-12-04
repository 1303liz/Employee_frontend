import api from './api';

const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/login/', credentials);
      const { user, tokens } = response.data;
      
      // Store tokens and user info
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/register/', userData);
      const { user, tokens } = response.data;
      
      // Store tokens and user info
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/logout/', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/profile/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/profile/', profileData);
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/change-password/', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDashboard: async () => {
    try {
      const response = await api.get('/dashboard/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserInfo: async () => {
    try {
      const response = await api.get('/user-info/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },

  getRefreshToken: () => {
    return localStorage.getItem('refresh_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

export default authService;
