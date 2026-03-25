import React, { useEffect, useState, useRef } from 'react';
import hrService from '../../services/hrService';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/formatDate';

const StatCard = ({ label, value, color }) => (
  <div className="stat-card" style={{ borderTop: `4px solid ${color || '#228BE6'}` }}>
    <h3>{label}</h3>
    <div className="stat-number">{value}</div>
  </div>
);

const RatingBar = ({ label, value, max = 5, color = '#228BE6' }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
      <span>{label}</span>
      <strong>{value} / {max}</strong>
    </div>
    <div style={{ background: '#e9ecef', borderRadius: 4, height: 8 }}>
      <div style={{
        width: `${(value / max) * 100}%`, height: '100%',
        background: color, borderRadius: 4, transition: 'width 0.4s',
      }} />
    </div>
  </div>
);

const MyPerformanceReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef();

  useEffect(() => {
    hrService.getMyPerformanceReport()
      .then(data => setReport(data))
      .catch(() => setError('Failed to load your performance report.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = () => {
    const printContents = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>My Performance Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #333; }
            h1, h2, h3, h4 { color: #1c7ed6; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #dee2e6; padding: 8px 12px; text-align: left; font-size: 13px; }
            th { background: #f1f3f5; }
            .stat-row { display: flex; gap: 16px; flex-wrap: wrap; margin: 16px 0; }
            .stat-box { border: 1px solid #dee2e6; border-radius: 6px; padding: 12px 20px; min-width: 140px; }
            .stat-label { font-size: 12px; color: #868E96; }
            .stat-value { font-size: 24px; font-weight: 700; color: #1c7ed6; }
            .section { margin-bottom: 28px; }
            .progress-bar-container { background: #e9ecef; border-radius: 4px; height: 8px; margin: 4px 0 10px; }
            .progress-bar { height: 100%; background: #228BE6; border-radius: 4px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 6px; font-size: 13px; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  if (loading) return <Loader />;

  return (
    <div className="leave-list-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>My Performance Report</h1>
        {report && (
          <button className="btn btn-secondary" onClick={handleDownload}>
            Download / Print PDF
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {report && (
        <div ref={printRef}>
          {/* Employee Info */}
          <section className="employee-card" style={{ marginBottom: '1.5rem' }}>
            <h3>Employee Information</h3>
            <p><strong>Name:</strong> {report.employee.full_name}</p>
            <p><strong>Employee ID:</strong> {report.employee.employee_id || '—'}</p>
            <p><strong>Email:</strong> {report.employee.email}</p>
            <p><strong>Department:</strong> {report.employee.department || 'Unassigned'}</p>
          </section>

          {/* Summary Stats */}
          <section style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: 12 }}>Summary</h3>
            <div className="stats-grid">
              <StatCard label="Total Reviews" value={report.summary.total_reviews} color="#228BE6" />
              <StatCard label="Avg Review Rating" value={`${report.summary.average_review_rating} / 5`} color="#40C057" />
              <StatCard label="Avg 360 Rating" value={`${report.summary.average_360_rating} / 5`} color="#FCC419" />
              <StatCard label="Completed Trainings" value={report.summary.completed_trainings} color="#7950F2" />
              <StatCard label="Active Trainings" value={report.summary.active_trainings} color="#FD7E14" />
              <StatCard label="Peer Evaluations Received" value={report.summary.peer_evaluations_received} color="#E64980" />
            </div>
          </section>

          {/* Peer Ratings Breakdown */}
          {report.summary.peer_evaluations_received > 0 && (
            <section className="employee-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: 12 }}>Peer Evaluation Averages</h3>
              <RatingBar label="Communication" value={report.summary.peer_avg_communication} color="#228BE6" />
              <RatingBar label="Teamwork" value={report.summary.peer_avg_teamwork} color="#40C057" />
              <RatingBar label="Technical Skills" value={report.summary.peer_avg_technical} color="#7950F2" />
              <RatingBar label="Leadership" value={report.summary.peer_avg_leadership} color="#E64980" />
            </section>
          )}

          {/* Latest Review */}
          {report.latest_review && (
            <section className="employee-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: 12 }}>Latest Performance Review</h3>
              <p><strong>Period:</strong> {report.latest_review.review_period}</p>
              <p><strong>Overall Rating:</strong> {report.latest_review.overall_rating} / 5</p>
              {report.latest_review.strengths && (
                <p><strong>Strengths:</strong> {report.latest_review.strengths}</p>
              )}
              {report.latest_review.improvement_areas && (
                <p><strong>Improvement Areas:</strong> {report.latest_review.improvement_areas}</p>
              )}
              {report.latest_review.goals && (
                <p><strong>Goals:</strong> {report.latest_review.goals}</p>
              )}
            </section>
          )}

          {/* Review History */}
          {(report.review_history || []).length > 0 && (
            <section className="employee-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: 12 }}>Review History</h3>
              <div className="table-container">
                <table className="leave-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Rating</th>
                      <th>Status</th>
                      <th>Reviewer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.review_history.map(rev => (
                      <tr key={rev.id}>
                        <td>{rev.review_period}</td>
                        <td>{rev.overall_rating} / 5</td>
                        <td>{rev.status}</td>
                        <td>{rev.reviewer_name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 360 Feedback Breakdown */}
          {(report.feedback_breakdown || []).length > 0 && (
            <section className="employee-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: 12 }}>360 Feedback by Relationship</h3>
              <div className="table-container">
                <table className="leave-table">
                  <thead>
                    <tr>
                      <th>Relationship</th>
                      <th>Count</th>
                      <th>Average Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.feedback_breakdown.map(fb => (
                      <tr key={fb.relationship}>
                        <td>{fb.relationship}</td>
                        <td>{fb.count}</td>
                        <td>{fb.average_rating} / 5</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Recent Peer Evaluations */}
          {(report.recent_peer_evaluations || []).length > 0 && (
            <section className="employee-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: 12 }}>Recent Peer Evaluations</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {report.recent_peer_evaluations.map(ev => (
                  <div key={ev.id} style={{ border: '1px solid #e9ecef', borderRadius: 6, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>From: {ev.evaluator_name}</strong>
                      <span style={{ fontSize: 13, color: '#868E96' }}>{ev.period}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#555', marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <span>Communication: {ev.communication_rating}/5</span>
                      <span>Teamwork: {ev.teamwork_rating}/5</span>
                      <span>Technical: {ev.technical_rating}/5</span>
                      <span>Leadership: {ev.leadership_rating}/5</span>
                    </div>
                    {ev.overall_comments && (
                      <p style={{ marginTop: 6, fontSize: 13, fontStyle: 'italic', color: '#555' }}>"{ev.overall_comments}"</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Training Overview */}
          {(report.training_overview || []).length > 0 && (
            <section className="employee-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: 12 }}>Training Enrollments</h3>
              <div className="table-container">
                <table className="leave-table">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Status</th>
                      <th>Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.training_overview.map(tr => (
                      <tr key={tr.id}>
                        <td>{tr.program_title}</td>
                        <td>{tr.status}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, background: '#e9ecef', borderRadius: 4, height: 8 }}>
                              <div style={{
                                width: `${tr.completion_percentage}%`, height: '100%',
                                background: tr.completion_percentage >= 100 ? '#40C057' : '#228BE6',
                                borderRadius: 4,
                              }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{tr.completion_percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Training Applications */}
          {(report.training_applications || []).length > 0 && (
            <section className="employee-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: 12 }}>Training Applications</h3>
              <div className="table-container">
                <table className="leave-table">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Status</th>
                      <th>Applied On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.training_applications.map(app => (
                      <tr key={app.id}>
                        <td>{app.program_title}</td>
                        <td>{app.status_display}</td>
                        <td>{formatDate(app.applied_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Recommendations */}
          {(report.recommendations || []).length > 0 && (
            <section className="employee-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: 12 }}>Recommendations</h3>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {report.recommendations.map((rec, idx) => (
                  <li key={idx} style={{ marginBottom: 8, color: '#555', fontSize: 14 }}>{rec}</li>
                ))}
              </ul>
            </section>
          )}

          {!report.latest_review && report.summary.total_reviews === 0 && report.summary.peer_evaluations_received === 0 && (
            <div className="employee-card" style={{ textAlign: 'center', color: '#868E96', padding: 40 }}>
              <p style={{ fontSize: 16 }}>No performance data available yet.</p>
              <p>Your performance reviews and peer evaluations will appear here once submitted.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyPerformanceReport;