import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import leaveService from '../../services/leaveService';
import Loader from '../../components/Loader';

const ApplyLeave = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    priority: 'NORMAL',
    is_half_day: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const response = await leaveService.getLeaveTypes();
      console.log('Fetched leave types response:', response);
      
      // Handle both paginated and direct array responses
      const types = Array.isArray(response) ? response : (response.results || []);
      
      setLeaveTypes(types);
      if (types.length > 0) {
        setFormData(prev => ({ ...prev, leave_type_id: types[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch leave types:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(`Failed to load leave types: ${err.response.data.detail || err.response.statusText}`);
      } else {
        setError('Failed to load leave types. Please check your connection and try again.');
      }
    } finally {
      setFetchingTypes(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await leaveService.applyLeave(formData);
      navigate('/leaves');
    } catch (err) {
      console.error('Leave application error:', err);
      console.error('Error response:', err.response);
      if (err.response?.data) {
        const errorData = err.response.data;
        console.error('Error data:', errorData);
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0]);
        } else {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => {
              const message = Array.isArray(value) ? value.join(', ') : value;
              return `${key}: ${message}`;
            })
            .join('. ');
          setError(errorMessages || 'Failed to apply leave');
        }
      } else {
        setError('Failed to apply leave. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingTypes) {
    return (
      <div className="apply-leave-container">
        <Loader />
      </div>
    );
  }

  return (
    <div className="apply-leave-container">
      <h1>Apply for Leave</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="leave-form">
        <div className="form-group">
          <label htmlFor="leave_type_id">Leave Type</label>
          <select
            id="leave_type_id"
            name="leave_type_id"
            value={formData.leave_type_id}
            onChange={handleChange}
            required
            disabled={leaveTypes.length === 0}
          >
            {leaveTypes.length === 0 && (
              <option value="">No leave types available</option>
            )}
            {leaveTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} {type.max_days_per_year && `(Max: ${type.max_days_per_year} days/year)`}
              </option>
            ))}
          </select>
          {leaveTypes.length === 0 && (
            <small style={{ color: 'var(--danger-color)' }}>
              No leave types available. Please contact HR to configure leave types.
            </small>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="start_date">Start Date</label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="end_date">End Date</label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
          >
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="is_half_day"
              checked={formData.is_half_day}
              onChange={handleChange}
              style={{ width: 'auto', marginRight: '8px' }}
            />
            Half Day Leave
          </label>
        </div>
        <div className="form-group">
          <label htmlFor="reason">Reason</label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Apply Leave'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/leaves')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplyLeave;
