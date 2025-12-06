import api from './api';

const profileService = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/profile/detail/');
    return response.data;
  },

  // Update profile (including photo upload)
  updateProfile: async (formData) => {
    const response = await api.patch('/profile/update/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get user documents
  getDocuments: async () => {
    const response = await api.get('/profile/documents/');
    return response.data;
  },

  // Upload a new document
  uploadDocument: async (formData) => {
    const response = await api.post('/profile/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a document
  deleteDocument: async (documentId) => {
    const response = await api.delete(`/profile/documents/${documentId}/`);
    return response.data;
  },
};

export default profileService;
