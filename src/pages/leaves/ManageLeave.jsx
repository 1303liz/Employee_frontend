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
      const data = await leaveService.getAllLeaves();
      setLeaves(data);
    } catch (err) {
      setError('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leaveId, status) => {
    try {
      await leaveService.updateLeaveStatus(leaveId, status);
      fetchAllLeaves(); // Refresh the list
    } catch (err) {
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
            {leaves.map((leave) => (
              <tr key={leave._id}>
                <td>{leave.employeeId?.name || 'N/A'}</td>
                <td>{leave.leaveType}</td>
                <td>{formatDate(leave.startDate)}</td>
                <td>{formatDate(leave.endDate)}</td>
                <td>{leave.reason}</td>
                <td>
                  <span className={`status-badge status-${leave.status.toLowerCase()}`}>
                    {leave.status}
                  </span>
                </td>
                <td>
                  {leave.status === 'Pending' && (
                    <div className="action-buttons">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leaves.length === 0 && <p className="no-data">No leave requests found.</p>}
    </div>
  );
};

export default ManageLeave;
