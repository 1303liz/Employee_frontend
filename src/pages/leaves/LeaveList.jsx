import React, { useState, useEffect } from 'react';
import leaveService from '../../services/leaveService';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/formatDate';

const LeaveList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await leaveService.getMyLeaves();
      console.log('Fetched leaves response:', response);
      
      // Handle both paginated and direct array responses
      const data = Array.isArray(response) ? response : (response.results || []);
      
      setLeaves(data);
    } catch (err) {
      console.error('Failed to load leaves:', err);
      setError('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="leave-list-container">
      <h1>My Leaves</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="leave-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id}>
                <td>{leave.leave_type?.name || leave.leave_type || 'N/A'}</td>
                <td>{formatDate(leave.start_date)}</td>
                <td>{formatDate(leave.end_date)}</td>
                <td>{leave.reason}</td>
                <td>
                  <span className={`status-badge status-${leave.status.toLowerCase()}`}>
                    {leave.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leaves.length === 0 && <p className="no-data">No leave records found.</p>}
    </div>
  );
};

export default LeaveList;
