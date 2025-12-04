import React, { useState, useEffect } from 'react';
import leaveService from '../../services/leaveService';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/formatDate';

const ManageLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  const fetchAllLeaves = async () => {
    try {
      const response = await leaveService.getAllLeaves();
      console.log('Fetched all leaves:', response);
      
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

  const handleStatusUpdate = async (leaveId, status) => {
    try {
      await leaveService.updateLeaveStatus(leaveId, status);
      setError('');
      fetchAllLeaves(); // Refresh the list
    } catch (err) {
      console.error('Failed to update leave status:', err);
      setError('Failed to update leave status');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="manage-leave-container">
      <h1>Manage Leaves (HR)</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="leave-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length > 0 ? (
              leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>
                    {leave.employee?.first_name && leave.employee?.last_name
                      ? `${leave.employee.first_name} ${leave.employee.last_name}`
                      : leave.employee?.username || 'N/A'}
                  </td>
                  <td>{leave.leave_type?.name || leave.leave_type || 'N/A'}</td>
                  <td>{formatDate(leave.start_date)}</td>
                  <td>{formatDate(leave.end_date)}</td>
                  <td>{leave.reason || 'No reason provided'}</td>
                  <td>
                    <span className={`status-badge status-${leave.status.toLowerCase()}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td>
                    {leave.status === 'PENDING' && (
                      <div className="table-actions">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleStatusUpdate(leave.id, 'APPROVED')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleStatusUpdate(leave.id, 'REJECTED')}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {leave.status !== 'PENDING' && (
                      <span style={{ color: 'var(--gray-text)', fontSize: '0.875rem' }}>
                        {leave.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-text)' }}>
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageLeave;
