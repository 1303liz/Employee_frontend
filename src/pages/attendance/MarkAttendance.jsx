import React, { useState } from 'react';
import attendanceService from '../../services/attendanceService';

const MarkAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [skipLocation, setSkipLocation] = useState(false);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      setLocationStatus('Getting your location...');
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          setLocationStatus('Resolving address...');
          
          // Try to get readable address using reverse geocoding
          let locationAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'EmployeeManagementSystem/1.0'
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.display_name) {
                locationAddress = data.display_name;
              } else if (data.address) {
                const addr = data.address;
                const parts = [
                  addr.road || addr.street,
                  addr.suburb || addr.neighbourhood,
                  addr.city || addr.town || addr.village,
                  addr.state,
                  addr.country
                ].filter(Boolean);
                locationAddress = parts.join(', ') || locationAddress;
              }
            }
          } catch (geoError) {
            console.warn('Reverse geocoding failed, using coordinates:', geoError);
            // Continue with coordinates if geocoding fails
          }
          
          setLocationStatus('Location captured successfully');
          resolve({
            latitude,
            longitude,
            location: locationAddress
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
          enableHighAccuracy: false, // Changed to false for faster response
          timeout: 30000, // Increased to 30 seconds
          maximumAge: 60000 // Allow cached position up to 1 minute old
        }
      );
    });
  };

  const handleCheckIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let location;
      try {
        location = await getLocation();
      } catch (locationErr) {
        console.warn('Location failed:', locationErr);
        // Use fallback coordinates (0,0) if location fails
        location = {
          latitude: 0,
          longitude: 0,
          location: 'Location unavailable - Manual check-in'
        };
        setLocationStatus('Using manual check-in (location unavailable)');
      }
      
      await attendanceService.checkIn(location);
      setSuccess('Check-in successful!');
      setLocationStatus('');
      setSkipLocation(false);
    } catch (err) {
      console.error('Check-in error:', err);
      setLocationStatus('');
      
      if (err.response?.data) {
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
      let location;
      try {
        location = await getLocation();
      } catch (locationErr) {
        console.warn('Location failed:', locationErr);
        // Use fallback coordinates (0,0) if location fails
        location = {
          latitude: 0,
          longitude: 0,
          location: 'Location unavailable - Manual check-out'
        };
        setLocationStatus('Using manual check-out (location unavailable)');
      }
      
      await attendanceService.checkOut(location);
      setSuccess('Check-out successful!');
      setLocationStatus('');
      setSkipLocation(false);
    } catch (err) {
      console.error('Check-out error:', err);
      setLocationStatus('');
      
      if (err.response?.data) {
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
