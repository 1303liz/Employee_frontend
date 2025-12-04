import React, { useState } from 'react';
import attendanceService from '../../services/attendanceService';

const MarkAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCheckIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await attendanceService.checkIn();
      setSuccess('Check-in successful!');
    } catch (err) {
      console.error('Check-in error:', err);
      console.error('Error response:', err.response);
      if (err.response?.data) {
        const errorData = err.response.data;
        console.error('Error data:', errorData);
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else if (errorData.non_field_errors) {
          setError(Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors);
        } else {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => {
              const message = Array.isArray(value) ? value.join(', ') : value;
              return `${key}: ${message}`;
            })
            .join('. ');
          setError(errorMessages || 'Failed to check in');
        }
      } else {
        setError('Failed to check in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await attendanceService.checkOut();
      setSuccess('Check-out successful!');
    } catch (err) {
      console.error('Check-out error:', err);
      console.error('Error response:', err.response);
      if (err.response?.data) {
        const errorData = err.response.data;
        console.error('Error data:', errorData);
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else if (errorData.non_field_errors) {
          setError(Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors);
        } else {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => {
              const message = Array.isArray(value) ? value.join(', ') : value;
              return `${key}: ${message}`;
            })
            .join('. ');
          setError(errorMessages || 'Failed to check out');
        }
      } else {
        setError('Failed to check out. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mark-attendance-container">
      <h1>Mark Attendance</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="attendance-actions">
        <button
          className="btn btn-primary btn-large"
          onClick={handleCheckIn}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Check In'}
        </button>
        <button
          className="btn btn-secondary btn-large"
          onClick={handleCheckOut}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Check Out'}
        </button>
      </div>

      <div className="current-time">
        <p>Current Time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default MarkAttendance;
