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
      setError(err.response?.data?.message || 'Failed to check in');
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
      setError(err.response?.data?.message || 'Failed to check out');
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
