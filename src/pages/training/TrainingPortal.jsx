import React, { useEffect, useState } from 'react';
import hrService from '../../services/hrService';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';

const STATUS_BADGE = {
  PENDING: { color: '#FFA94D', label: 'Pending' },
  APPROVED: { color: '#40C057', label: 'Approved' },
  REJECTED: { color: '#FA5252', label: 'Rejected' },
  WITHDRAWN: { color: '#868E96', label: 'Withdrawn' },
};

const ENROLLMENT_STATUS_BADGE = {
  ASSIGNED: { color: '#228BE6', label: 'Assigned' },
  IN_PROGRESS: { color: '#FFA94D', label: 'In Progress' },
  COMPLETED: { color: '#40C057', label: 'Completed' },
};

const Badge = ({ status, map }) => {
  const cfg = map[status] || { color: '#868E96', label: status };
  return (
    <span style={{
      background: cfg.color, color: '#fff', borderRadius: 12,
      padding: '2px 10px', fontSize: 12, fontWeight: 600,
    }}>
      {cfg.label}
    </span>
  );
};

const TrainingPortal = () => {
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [applications, setApplications] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [applyForm, setApplyForm] = useState({ training_program: '', reason: '' });
  const [applyingId, setApplyingId] = useState(null);

  const parseList = (r) => (Array.isArray(r) ? r : r?.results || []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [avail, apps, enroll] = await Promise.all([
        hrService.getAvailableTrainings(),
        hrService.getMyTrainingApplications(),
        hrService.getMyTrainingEnrollments(),
      ]);
      setAvailable(parseList(avail));
      setApplications(parseList(apps));
      setEnrollments(parseList(enroll));
    } catch {
      setError('Failed to load training data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const appliedProgramIds = new Set(
    applications
      .filter(a => a.status !== 'WITHDRAWN' && a.status !== 'REJECTED')
      .map(a => a.training_program)
  );

  const enrolledProgramIds = new Set(enrollments.map(e => e.training_program));

  const handleApply = async (programId) => {
    setApplyingId(programId);
    setError('');
    setSuccess('');
    try {
      await hrService.applyForTraining({ training_program: programId, reason: applyForm.reason });
      setSuccess('Application submitted successfully!');
      setApplyForm({ training_program: '', reason: '' });
      fetchAll();
    } catch (err) {
      const msg = err?.response?.data?.non_field_errors?.[0]
        || err?.response?.data?.training_program?.[0]
        || 'Failed to submit application.';
      setError(msg);
    } finally {
      setApplyingId(null);
    }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application?')) return;
    setError('');
    try {
      await hrService.withdrawTrainingApplication(appId);
      setSuccess('Application withdrawn.');
      fetchAll();
    } catch {
      setError('Failed to withdraw application.');
    }
  };

  const handleUpdateProgress = async (enrollmentId, field, value) => {
    try {
      await hrService.updateMyEnrollmentProgress(enrollmentId, { [field]: value });
      setEnrollments(prev =>
        prev.map(e => e.id === enrollmentId ? { ...e, [field]: value } : e)
      );
    } catch {
      setError('Failed to update progress.');
    }
  };

  const downloadTextFile = (filename, content) => {
    const fileBlob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadApprovalLetter = (application) => {
    const employeeName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Employee';
    const letter = [
      'TRAINING APPROVAL LETTER',
      '----------------------------------------',
      `Date: ${new Date().toLocaleDateString()}`,
      `Employee: ${employeeName}`,
      `Program: ${application.program_title}`,
      `Program Duration: ${formatDate(application.program_start_date)} - ${formatDate(application.program_end_date)}`,
      `Application Status: ${application.status_display}`,
      '',
      'This is to confirm your training application has been approved by HR.',
      `HR Notes: ${application.hr_notes || 'No additional notes provided.'}`,
      '',
      'Regards,',
      'Human Resources',
    ].join('\n');

    downloadTextFile(`training-approval-${application.id}.txt`, letter);
  };

  const handleDownloadEnrollmentSummary = (enrollment) => {
    const employeeName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Employee';
    const summary = [
      'TRAINING ENROLLMENT SUMMARY',
      '----------------------------------------',
      `Date: ${new Date().toLocaleDateString()}`,
      `Employee: ${employeeName}`,
      `Program: ${enrollment.program_title}`,
      `Enrollment Status: ${enrollment.status}`,
      `Completion: ${enrollment.completion_percentage}%`,
      `Notes: ${enrollment.notes || 'No notes provided.'}`,
    ].join('\n');

    downloadTextFile(`training-enrollment-${enrollment.id}.txt`, summary);
  };

  if (loading) return <Loader />;

  return (
    <div className="leave-list-container">
      <h1>🎓 Training Portal</h1>

      {error && <div className="error-message" style={{ marginBottom: 12 }}>{error}</div>}
      {success && (
        <div className="error-message" style={{ background: '#d3f9d8', color: '#2f9e44', marginBottom: 12 }}>
          {success}
        </div>
      )}

      {/* ── Available Trainings ── */}
      <section className="employee-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Available Training Programs</h3>
        {available.length === 0 ? (
          <p style={{ color: '#666' }}>No active training programs at the moment.</p>
        ) : (
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {available.map(program => {
              const alreadyApplied = appliedProgramIds.has(program.id);
              const alreadyEnrolled = enrolledProgramIds.has(program.id);
              return (
                <div key={program.id} style={{
                  border: '1px solid #e9ecef', borderRadius: 8, padding: 16,
                  background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  <h4 style={{ margin: '0 0 8px', color: '#333' }}>{program.title}</h4>
                  {program.description && (
                    <p style={{ margin: '0 0 8px', color: '#555', fontSize: 14 }}>{program.description}</p>
                  )}
                  <div style={{ fontSize: 13, color: '#777', marginBottom: 12 }}>
                    📅 {formatDate(program.start_date)} — {formatDate(program.end_date)}
                  </div>
                  {alreadyEnrolled ? (
                    <span style={{ color: '#40C057', fontWeight: 600, fontSize: 13 }}>✅ Enrolled</span>
                  ) : alreadyApplied ? (
                    <span style={{ color: '#FFA94D', fontWeight: 600, fontSize: 13 }}>⏳ Application Pending/Approved</span>
                  ) : (
                    <div>
                      <textarea
                        placeholder="Why do you want to attend? (optional)"
                        rows={2}
                        style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #dee2e6', fontSize: 13 }}
                        onChange={e => setApplyForm(p => ({ ...p, reason: e.target.value }))}
                      />
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: 13 }}
                        disabled={applyingId === program.id}
                        onClick={() => handleApply(program.id)}
                      >
                        {applyingId === program.id ? 'Applying…' : 'Apply Now'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── My Applications ── */}
      <section className="employee-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>My Training Applications</h3>
        {applications.length === 0 ? (
          <p style={{ color: '#666' }}>You have not applied for any training programs yet.</p>
        ) : (
          <div className="table-container">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>HR Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td>{app.program_title}</td>
                    <td>{formatDate(app.program_start_date)}</td>
                    <td>{formatDate(app.program_end_date)}</td>
                    <td><Badge status={app.status} map={STATUS_BADGE} /></td>
                    <td style={{ fontSize: 13, color: '#555' }}>{app.hr_notes || '—'}</td>
                    <td>
                      {app.status === 'PENDING' && (
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={() => handleWithdraw(app.id)}
                        >
                          Withdraw
                        </button>
                      )}
                      {app.status === 'APPROVED' && (
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: 12, padding: '4px 10px' }}
                          onClick={() => handleDownloadApprovalLetter(app)}
                        >
                          Download Letter
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── My Enrollments ── */}
      <section className="employee-card">
        <h3 style={{ marginBottom: '1rem' }}>My Enrolled Trainings</h3>
        {enrollments.length === 0 ? (
          <p style={{ color: '#666' }}>You are not enrolled in any training programs yet.</p>
        ) : (
          <div className="table-container">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Status</th>
                  <th>Completion %</th>
                  <th>Update Progress</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map(enrollment => (
                  <tr key={enrollment.id}>
                    <td>{enrollment.program_title}</td>
                    <td>
                      <select
                        value={enrollment.status}
                        style={{ fontSize: 13, padding: '2px 6px', borderRadius: 4, border: '1px solid #dee2e6' }}
                        onChange={e => handleUpdateProgress(enrollment.id, 'status', e.target.value)}
                      >
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          flex: 1, height: 8, background: '#e9ecef', borderRadius: 4, overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${enrollment.completion_percentage}%`,
                            height: '100%',
                            background: enrollment.completion_percentage >= 100 ? '#40C057' : '#228BE6',
                            borderRadius: 4,
                            transition: 'width 0.3s',
                          }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 36 }}>
                          {enrollment.completion_percentage}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={enrollment.completion_percentage}
                        style={{ width: 60, fontSize: 13, padding: '2px 6px', borderRadius: 4, border: '1px solid #dee2e6' }}
                        onBlur={e => {
                          const val = Math.min(100, Math.max(0, Number(e.target.value)));
                          handleUpdateProgress(enrollment.id, 'completion_percentage', val);
                        }}
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: 12, padding: '4px 10px' }}
                        onClick={() => handleDownloadEnrollmentSummary(enrollment)}
                      >
                        Download Summary
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default TrainingPortal;