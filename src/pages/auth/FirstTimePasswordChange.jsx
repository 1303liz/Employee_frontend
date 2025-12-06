import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import './FirstTimePasswordChange.css';

const FirstTimePasswordChange = () => {
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.firstTimePasswordChange({
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      });

      // Update user state to reflect password has been changed
      updateUser({ ...user, must_change_password: false });

      // Show success message briefly before redirecting
      alert('Password changed successfully! You can now access your dashboard.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Password change error:', err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.non_field_errors) {
          setError(Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors.join('. ') 
            : errorData.non_field_errors);
        } else if (errorData.new_password) {
          setError(Array.isArray(errorData.new_password) 
            ? errorData.new_password.join('. ') 
            : errorData.new_password);
        } else if (errorData.confirm_password) {
          setError(Array.isArray(errorData.confirm_password) 
            ? errorData.confirm_password.join('. ') 
            : errorData.confirm_password);
        } else {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => {
              const message = Array.isArray(value) ? value.join(', ') : value;
              return `${key}: ${message}`;
            })
            .join('. ');
          setError(errorMessages || 'Password change failed. Please try again.');
        }
      } else {
        setError('Password change failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="first-time-password-container">
      <div className="first-time-password-card">
        <div className="password-header">
          <div className="password-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
          </div>
          <h2>Change Your Password</h2>
          <p className="password-subtitle">
            Welcome! For security reasons, please change your temporary password before continuing.
          </p>
        </div>

        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="error-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="new_password">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              </svg>
              New Password
            </label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              placeholder="Enter new password (min. 8 characters)"
              value={formData.new_password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              </svg>
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              placeholder="Confirm new password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          <div className="password-requirements">
            <h4>Password Requirements:</h4>
            <ul>
              <li>At least 8 characters long</li>
              <li>Choose a strong, unique password</li>
              <li>Don't reuse your temporary password</li>
            </ul>
          </div>

          <button type="submit" className="password-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Changing Password...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FirstTimePasswordChange;
