import api from './api';

const employeeService = {
  // Get all employees (HR only)
  getAllEmployees: async (params = {}) => {
    const response = await api.get('/employee-management/', { params });
    return response.data;
  },

  // Get employee by ID
  getEmployeeById: async (id) => {
    const response = await api.get(`/employee-management/${id}/`);
    return response.data;
  },

  // Create new employee (HR only)
  createEmployee: async (employeeData) => {
    const response = await api.post('/employee-management/', employeeData);
    return response.data;
  },

  // Update employee (HR only)
  updateEmployee: async (id, employeeData) => {
    const response = await api.put(`/employee-management/${id}/`, employeeData);
    return response.data;
  },

  // Partial update employee
  patchEmployee: async (id, employeeData) => {
    const response = await api.patch(`/employee-management/${id}/`, employeeData);
    return response.data;
  },

  // Delete employee (HR only)
  deleteEmployee: async (id) => {
    const response = await api.delete(`/employee-management/${id}/`);
    return response.data;
  },

  // Get employee statistics (HR only)
  getEmployeeStatistics: async () => {
    const response = await api.get('/employee-management/statistics/');
    return response.data;
  },

  // Get my profile (current user)
  getMyProfile: async () => {
    const response = await api.get('/employee-management/my-profile/');
    return response.data;
  },

  // Update my profile
  updateMyProfile: async (profileData) => {
    const response = await api.put('/employee-management/my-profile/', profileData);
    return response.data;
  },

  // Get positions
  getPositions: async () => {
    const response = await api.get('/employee-management/positions/');
    return response.data;
  },

  // Create position
  createPosition: async (positionData) => {
    const response = await api.post('/employee-management/positions/', positionData);
    return response.data;
  },

  // Update position
  updatePosition: async (id, positionData) => {
    const response = await api.put(`/employee-management/positions/${id}/`, positionData);
    return response.data;
  },

  // Delete position
  deletePosition: async (id) => {
    const response = await api.delete(`/employee-management/positions/${id}/`);
    return response.data;
  },

  // Get departments (from accounts app)
  getDepartments: async () => {
    const response = await api.get('/departments/');
    return response.data;
  },

  // Create department (from accounts app)
  createDepartment: async (departmentData) => {
    const response = await api.post('/departments/', departmentData);
    return response.data;
  },

  // Update department
  updateDepartment: async (id, departmentData) => {
    const response = await api.put(`/departments/${id}/`, departmentData);
    return response.data;
  },

  // Delete department
  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}/`);
    return response.data;
  },

  // Employee documents
  getEmployeeDocuments: async (employeeId) => {
    const response = await api.get(`/employee-management/${employeeId}/documents/`);
    return response.data;
  },

  createEmployeeDocument: async (employeeId, documentData) => {
    const response = await api.post(`/employee-management/${employeeId}/documents/`, documentData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteEmployeeDocument: async (employeeId, documentId) => {
    const response = await api.delete(`/employee-management/${employeeId}/documents/${documentId}/`);
    return response.data;
  },

  // Employee notes (HR only)
  getEmployeeNotes: async (employeeId) => {
    const response = await api.get(`/employee-management/${employeeId}/notes/`);
    return response.data;
  },

  createEmployeeNote: async (employeeId, noteData) => {
    const response = await api.post(`/employee-management/${employeeId}/notes/`, noteData);
    return response.data;
  },

  updateEmployeeNote: async (employeeId, noteId, noteData) => {
    const response = await api.put(`/employee-management/${employeeId}/notes/${noteId}/`, noteData);
    return response.data;
  },

  deleteEmployeeNote: async (employeeId, noteId) => {
    const response = await api.delete(`/employee-management/${employeeId}/notes/${noteId}/`);
    return response.data;
  },

  // Bulk operations
  bulkUpdateEmployees: async (bulkData) => {
    const response = await api.post('/employee-management/bulk-update/', bulkData);
    return response.data;
  },
};

export default employeeService;
