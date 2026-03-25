import React, { useState, useEffect } from 'react';
import leaveService from '../../services/leaveService';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/formatDate';

const LeaveList = () => {
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
    <div className="leave-list-container leave-list-page">
      <div className="page-header leave-list-header">
        <div>
          <h1>My Leaves</h1>
          <p className="leave-list-subtitle">Track requests, status updates, and rejection details in one place.</p>
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
        {leaves.map((leave) => {
          const statusLower = String(leave.status || '').toLowerCase();

          return (
            <article key={leave.id} className="leave-record-card">
              <header className="leave-record-header">
                <h3 className="leave-record-title">{leave.leave_type_name || leave.leave_type?.name || leave.leave_type || 'Not Specified'}</h3>
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
                <h4>Rejection Reason</h4>
                <p className={statusLower === 'rejected' ? '' : 'leave-placeholder-text'}>
                  {statusLower === 'rejected' ? (leave.approval_comments || 'No reason provided') : '-'}
                </p>
              </div>
            </article>
          );
        })}

        {leaves.length === 0 && (
          <div className="leave-empty-state">No leave records found.</div>
        )}
      </div>
    </div>
  );
};

export default LeaveList;
