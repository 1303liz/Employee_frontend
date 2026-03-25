import React, { useState, useEffect } from 'react';
import leaveService from '../../services/leaveService';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/formatDate';

const ManageLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const leaveStats = leaves.reduce(
    (acc, leave) => {
      const status = String(leave.status || '').toUpperCase();
      if (status === 'PENDING') acc.pending += 1;
      if (status === 'APPROVED') acc.approved += 1;
      if (status === 'REJECTED') acc.rejected += 1;
      return acc;
    },
    {
      pending: 0,
      approved: 0,
      rejected: 0,
    }
  );

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
    let comments = '';

    if (status === 'REJECTED') {
      comments = window.prompt('Enter rejection reason (required):', '') || '';
      if (!comments.trim()) {
        setError('Rejection reason is required.');
        return;
      }
    } else {
      comments = window.prompt('Optional approval comment:', '') || '';
    }

    try {
      await leaveService.updateLeaveStatus(leaveId, status, comments.trim());
      setError('');
      fetchAllLeaves(); // Refresh the list
    } catch (err) {
      console.error('Failed to update leave status:', err);
      setError('Failed to update leave status');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="manage-leave-container leave-list-page">
      <div className="page-header leave-list-header">
        <div>
          <h1>Manage Leaves (HR)</h1>
          <p className="leave-list-subtitle">Review requests, update decisions, and keep leave workflows moving.</p>
        </div>
      </div>

      <div className="leave-list-summary" role="region" aria-label="Leave request summary">
        <div className="leave-summary-item">
          <span className="leave-summary-label">Total Requests</span>
          <span className="leave-summary-value">{leaves.length}</span>
        </div>
        <div className="leave-summary-item">
          <span className="leave-summary-label">Pending</span>
          <span className="leave-summary-value">{leaveStats.pending}</span>
        </div>
        <div className="leave-summary-item">
          <span className="leave-summary-label">Approved</span>
          <span className="leave-summary-value">{leaveStats.approved}</span>
        </div>
        <div className="leave-summary-item">
          <span className="leave-summary-label">Rejected</span>
          <span className="leave-summary-value">{leaveStats.rejected}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="leave-records-grid">
        {leaves.length > 0 ? (
          leaves.map((leave) => {
            const statusLower = String(leave.status || '').toLowerCase();

            return (
              <article key={leave.id} className="leave-record-card">
                <header className="leave-record-header">
                  <div>
                    <h3 className="leave-record-title">{leave.leave_type_name || 'Leave type not set'}</h3>
                    <p className="leave-record-person">
                      {leave.employee_name || leave.employee_username || leave.employee_email || 'Unknown Employee'}
                    </p>
                  </div>
                  <span className={`status-badge status-${statusLower}`}>{leave.status}</span>
                </header>

                <div className="leave-record-meta">
                  <div className="leave-meta-item">
                    <span className="leave-meta-label">Start Date</span>
                    <span className="leave-meta-value">{formatDate(leave.start_date)}</span>
                  </div>
                  <div className="leave-meta-item">
                    <span className="leave-meta-label">End Date</span>
                    <span className="leave-meta-value">{formatDate(leave.end_date)}</span>
                  </div>
                </div>

                <div className="leave-detail-block">
                  <h4>Reason</h4>
                  <p className={leave.reason ? '' : 'leave-placeholder-text'}>{leave.reason || 'No reason provided'}</p>
                </div>

                <div className="leave-detail-block">
                  <h4>Comments</h4>
                  <p className={leave.approval_comments ? '' : 'leave-placeholder-text'}>{leave.approval_comments || '-'}</p>
                </div>

                <footer className="leave-record-actions">
                  {leave.status === 'PENDING' ? (
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
                  ) : (
                    <span className="leave-action-state">
                      {leave.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                    </span>
                  )}
                </footer>
              </article>
            );
          })
        ) : (
          <div className="leave-empty-state">No leave requests found.</div>
        )}
      </div>
    </div>
  );
};

export default ManageLeave;
