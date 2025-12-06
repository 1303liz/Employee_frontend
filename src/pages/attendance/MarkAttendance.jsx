import React, { useState } from 'react';
import attendanceService from '../../services/attendanceService';

const MarkAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locationStatus, setLocationStatus] = useState('');

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      setLocationStatus('Getting your location...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus('Location captured successfully');
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          setLocationStatus('');
          let errorMessage = 'Unable to get your location. ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleCheckIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const location = await getLocation();
      await attendanceService.checkIn(location);
      setSuccess('Check-in successful!');
      setLocationStatus('');
    } catch (err) {
      console.error('Check-in error:', err);
      setLocationStatus('');
      
      if (err.message && err.message.includes('location')) {
        setError(err.message);
      } else if (err.response?.data) {
        const errorData = err.response.data;
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
      const location = await getLocation();
      await attendanceService.checkOut(location);
      setSuccess('Check-out successful!');
      setLocationStatus('');
    } catch (err) {
      console.error('Check-out error:', err);
      setLocationStatus('');
      
      if (err.message && err.message.includes('location')) {
        setError(err.message);
      } else if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else if (errorData.non_field_errors) {
          setError(Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors);
        } else if (Array.isArray(errorData)) {
          setError(errorData[0]);
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
      {locationStatus && <div className="info-message">{locationStatus}</div>}
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
