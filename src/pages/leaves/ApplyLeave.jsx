import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import leaveService from '../../services/leaveService';

const ApplyLeave = () => {
  const [formData, setFormData] = useState({
    leaveType: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await leaveService.applyLeave(formData);
      navigate('/leaves');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply leave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-leave-container">
      <h1>Apply for Leave</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="leave-form">
        <div className="form-group">
          <label htmlFor="leaveType">Leave Type</label>
          <select
            id="leaveType"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            required
          >
            <option value="Sick Leave">Sick Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Annual Leave">Annual Leave</option>
            <option value="Maternity Leave">Maternity Leave</option>
            <option value="Paternity Leave">Paternity Leave</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
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
