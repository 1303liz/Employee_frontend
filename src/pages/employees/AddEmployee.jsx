import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import employeeService from '../../services/employeeService';

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    department: '',
    employment_type: 'FULL_TIME',
    status: 'ACTIVE',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address: '',
    salary: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Log the data being sent
    console.log('Submitting employee data:', formData);

    try {
      const response = await employeeService.createEmployee(formData);
      console.log('Employee created successfully:', response);
      console.log('Response data:', response.data);
      console.log('Response structure:', JSON.stringify(response, null, 2));
      
      // Check if email was sent (handle both response.data and direct response)
      const responseData = response.data || response;
      const emailSent = responseData.email_sent;
      const employeeEmail = responseData.user?.email || formData.email;
      
      if (emailSent) {
        setSuccess(`Employee added successfully! Login credentials have been sent to ${employeeEmail}.`);
      } else {
        setSuccess(`Employee added successfully! Please share these credentials manually - Username: ${formData.username}, Temporary Password: ${formData.password}`);
      }
      
      setTimeout(() => navigate('/employees'), 3000);
    } catch (err) {
      console.error('Error creating employee:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      
      // Handle different error formats
      let errorMessage = 'Failed to add employee';
      
      if (err.response?.data) {
        const errors = err.response.data;
        
        // If it's an object with field-specific errors
        if (typeof errors === 'object') {
          const errorMessages = [];
          for (const [field, messages] of Object.entries(errors)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${messages}`);
            }
          }
          errorMessage = errorMessages.join(' | ');
        } else if (typeof errors === 'string') {
          errorMessage = errors;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-employee-container">
      <div className="page-header">
        <h1>Add New Employee</h1>
      </div>

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <strong>Success!</strong> {success}
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
            {success.includes('sent to') 
              ? 'The employee has received their login credentials via email.' 
              : 'Please save these credentials and share them with the employee securely.'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="employee-form">
        <div className="form-section">
          <h3>Account Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="username">
                Username <span className="required">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="e.g., john.doe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john.doe@company.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Temporary Password <span className="required">*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter or generate a temporary password"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={generateTemporaryPassword}
                className="btn btn-secondary"
                style={{ whiteSpace: 'nowrap' }}
              >
                🔑 Generate Password
              </button>
            </div>
            <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
              Employee will use this to login for the first time. Minimum 8 characters.
            </small>
          </div>
        </div>

        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="first_name">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_of_birth">Date of Birth</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+1234567890"
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergency_contact_name">Emergency Contact Name</label>
              <input
                type="text"
                id="emergency_contact_name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergency_contact_phone">Emergency Contact Phone</label>
              <input
                type="tel"
                id="emergency_contact_phone"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="Full address"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Employment Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Engineering, Sales, HR"
              />
            </div>

            <div className="form-group">
              <label htmlFor="employment_type">
                Employment Type <span className="required">*</span>
              </label>
              <select
                id="employment_type"
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                required
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="salary">Salary</label>
              <input
                type="number"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Annual salary"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Adding Employee...' : '✓ Add Employee'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/employees')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
