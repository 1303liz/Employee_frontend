import React, { useEffect, useMemo, useState } from 'react';
import hrService from '../../services/hrService';
import employeeService from '../../services/employeeService';
import Loader from '../../components/Loader';

const PerformanceManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [employeeReport, setEmployeeReport] = useState(null);
  const [reportEmployeeId, setReportEmployeeId] = useState('');
  const [activeReportEmployeeId, setActiveReportEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reviewForm, setReviewForm] = useState({
    employee: '',
    review_period: '',
    overall_rating: 3.0,
    strengths: '',
    improvement_areas: '',
    goals: '',
    status: 'DRAFT',
  });

  const [feedbackForm, setFeedbackForm] = useState({
    performance_review: '',
    to_employee: '',
    relationship: 'PEER',
    rating: 3.0,
    comments: '',
  });

  const parseList = (response) => (Array.isArray(response) ? response : response?.results || []);

  const toNumericRating = (value) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const formatDateDisplay = (value) => {
    if (!value) return '-';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '-' : parsed.toLocaleDateString();
  };

  const ratingsOverview = useMemo(() => {
    if (employees.length === 0) return [];

    const byEmployee = new Map(
      employees.map((employee) => [employee.id, {
        employee,
        reviewCount: 0,
        reviewTotal: 0,
        feedbackCount: 0,
        feedbackTotal: 0,
        latestRatingAt: null,
        latestReviewPeriod: '-',
      }])
    );

    reviews.forEach((review) => {
      const target = byEmployee.get(review.employee);
      if (!target) return;
      target.reviewCount += 1;
      target.reviewTotal += toNumericRating(review.overall_rating);
      if (!target.latestRatingAt || new Date(review.created_at) > new Date(target.latestRatingAt)) {
        target.latestRatingAt = review.created_at;
        target.latestReviewPeriod = review.review_period || '-';
      }
    });

    feedbackItems.forEach((feedback) => {
      const target = byEmployee.get(feedback.to_employee);
      if (!target) return;
      target.feedbackCount += 1;
      target.feedbackTotal += toNumericRating(feedback.rating);
      if (!target.latestRatingAt || new Date(feedback.created_at) > new Date(target.latestRatingAt)) {
        target.latestRatingAt = feedback.created_at;
      }
    });

    return Array.from(byEmployee.values())
      .map((row) => {
        const reviewAverage = row.reviewCount > 0 ? row.reviewTotal / row.reviewCount : 0;
        const feedbackAverage = row.feedbackCount > 0 ? row.feedbackTotal / row.feedbackCount : 0;

        return {
          ...row,
          reviewAverage: reviewAverage.toFixed(2),
          feedbackAverage: feedbackAverage.toFixed(2),
          totalRatings: row.reviewCount + row.feedbackCount,
        };
      })
      .sort((first, second) => second.totalRatings - first.totalRatings);
  }, [employees, reviews, feedbackItems]);

  const fetchData = async () => {
    try {
      const [employeeRes, reviewRes, feedbackRes] = await Promise.all([
        employeeService.getAllEmployees(),
        hrService.getPerformanceReviews(),
        hrService.getFeedback360(),
      ]);

      const parsedEmployees = parseList(employeeRes);
      const parsedReviews = parseList(reviewRes);
      const parsedFeedback = parseList(feedbackRes);

      setEmployees(parsedEmployees);
      setReviews(parsedReviews);
      setFeedbackItems(parsedFeedback);

      if (!reviewForm.employee && parsedEmployees.length > 0) {
        setReviewForm((prev) => ({ ...prev, employee: parsedEmployees[0].id }));
      }

      if (!reportEmployeeId && parsedEmployees.length > 0) {
        setReportEmployeeId(String(parsedEmployees[0].id));
      }

      if (!feedbackForm.to_employee && parsedEmployees.length > 0) {
        setFeedbackForm((prev) => ({ ...prev, to_employee: parsedEmployees[0].id }));
      }

      if (!feedbackForm.performance_review && parsedReviews.length > 0) {
        setFeedbackForm((prev) => ({ ...prev, performance_review: parsedReviews[0].id }));
        fetchSummary(parsedReviews[0].id);
      }
    } catch (err) {
      setError('Failed to load performance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (reviewId) => {
    if (!reviewId) {
      setSummary(null);
      return;
    }

    try {
      const data = await hrService.getFeedbackSummary(reviewId);
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch 360 summary', err);
      setSummary(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await hrService.createPerformanceReview({
        ...reviewForm,
        employee: Number(reviewForm.employee),
        overall_rating: Number(reviewForm.overall_rating),
      });
      setReviewForm((prev) => ({ ...prev, review_period: '', strengths: '', improvement_areas: '', goals: '' }));
      setError('');
      fetchData();
    } catch (err) {
      setError('Failed to create performance review');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await hrService.createFeedback360({
        ...feedbackForm,
        performance_review: Number(feedbackForm.performance_review),
        to_employee: Number(feedbackForm.to_employee),
        rating: Number(feedbackForm.rating),
      });
      setFeedbackForm((prev) => ({ ...prev, comments: '' }));
      setError('');
      fetchData();
      fetchSummary(feedbackForm.performance_review);
    } catch (err) {
      setError('Failed to add 360 feedback');
    }
  };

  const handleGenerateReport = async (employeeId = reportEmployeeId) => {
    if (!employeeId) {
      setError('Select an employee to generate a report.');
      return;
    }

    try {
      setActiveReportEmployeeId(String(employeeId));
      const data = await hrService.getEmployeePerformanceReport(employeeId);
      setEmployeeReport(data);
      setReportEmployeeId(String(employeeId));
      setError('');
    } catch (err) {
      setError('Failed to generate employee performance report');
      console.error(err);
    } finally {
      setActiveReportEmployeeId('');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="leave-list-container">
      <h1>Performance Management (360 Evaluation)</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="employee-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>All Employee Ratings Overview</h3>
        <p style={{ color: 'var(--gray-text)', marginBottom: '1rem' }}>
          HR can review every employee's ratings here and generate a full performance report in one click.
        </p>
        <div className="table-container" style={{ marginTop: 0 }}>
          <table className="leave-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Review Ratings</th>
                <th>360 Ratings</th>
                <th>Latest Review Period</th>
                <th>Last Rated On</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
              {ratingsOverview.map((item) => (
                <tr key={item.employee.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--dark-text)' }}>
                      {item.employee.full_name || item.employee.username}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>{item.employee.email || '-'}</div>
                  </td>
                  <td>{item.reviewCount} ratings (Avg: {item.reviewAverage})</td>
                  <td>{item.feedbackCount} ratings (Avg: {item.feedbackAverage})</td>
                  <td>{item.latestReviewPeriod || '-'}</td>
                  <td>{formatDateDisplay(item.latestRatingAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleGenerateReport(item.employee.id)}
                      disabled={activeReportEmployeeId === String(item.employee.id)}
                    >
                      {activeReportEmployeeId === String(item.employee.id) ? 'Generating...' : 'Generate Report'}
                    </button>
                  </td>
                </tr>
              ))}
              {ratingsOverview.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No employee ratings found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="employee-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Employee Performance Report</h3>
        <div className="form-group">
          <label>Select Employee</label>
          <select value={reportEmployeeId} onChange={(e) => setReportEmployeeId(e.target.value)}>
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name || employee.username} ({employee.email})
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => handleGenerateReport()} disabled={activeReportEmployeeId === String(reportEmployeeId) && !!reportEmployeeId}>
            {activeReportEmployeeId === String(reportEmployeeId) && !!reportEmployeeId ? 'Generating...' : 'Generate Report'}
          </button>
          {employeeReport && (
            <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
              Print Report
            </button>
          )}
        </div>
      </div>

      {employeeReport && (
        <div className="employee-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Report for {employeeReport.employee.full_name}</h3>
          <p><strong>Employee ID:</strong> {employeeReport.employee.employee_id || '-'}</p>
          <p><strong>Email:</strong> {employeeReport.employee.email || '-'}</p>
          <p><strong>Department:</strong> {employeeReport.employee.department || 'Unassigned'}</p>

          <div className="stats-grid" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <h3>Total Reviews</h3>
              <div className="stat-number">{employeeReport.summary.total_reviews}</div>
            </div>
            <div className="stat-card">
              <h3>Avg Review Rating</h3>
              <div className="stat-number">{employeeReport.summary.average_review_rating}</div>
            </div>
            <div className="stat-card">
              <h3>360 Avg Rating</h3>
              <div className="stat-number">{employeeReport.summary.average_360_rating}</div>
            </div>
            <div className="stat-card">
              <h3>Completed Trainings</h3>
              <div className="stat-number">{employeeReport.summary.completed_trainings}</div>
            </div>
          </div>

          {employeeReport.latest_review && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>Latest Review</h4>
              <p><strong>Period:</strong> {employeeReport.latest_review.review_period}</p>
              <p><strong>Overall Rating:</strong> {employeeReport.latest_review.overall_rating}</p>
              <p><strong>Strengths:</strong> {employeeReport.latest_review.strengths || '-'}</p>
              <p><strong>Improvement Areas:</strong> {employeeReport.latest_review.improvement_areas || '-'}</p>
              <p><strong>Goals:</strong> {employeeReport.latest_review.goals || '-'}</p>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>Recommendations</h4>
            <ul style={{ paddingLeft: '1rem' }}>
              {(employeeReport.recommendations || []).map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="table-container" style={{ marginBottom: '1.5rem' }}>
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Review Period</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Reviewer</th>
                </tr>
              </thead>
              <tbody>
                {(employeeReport.review_history || []).map((review) => (
                  <tr key={review.id}>
                    <td>{review.review_period}</td>
                    <td>{review.overall_rating}</td>
                    <td>{review.status}</td>
                    <td>{review.reviewer_name || '-'}</td>
                  </tr>
                ))}
                {(!employeeReport.review_history || employeeReport.review_history.length === 0) && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>No review history available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-container" style={{ marginBottom: '1.5rem' }}>
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Relationship</th>
                  <th>Count</th>
                  <th>Average Rating</th>
                </tr>
              </thead>
              <tbody>
                {(employeeReport.feedback_breakdown || []).map((item) => (
                  <tr key={item.relationship}>
                    <td>{item.relationship}</td>
                    <td>{item.count}</td>
                    <td>{item.average_rating}</td>
                  </tr>
                ))}
                {(!employeeReport.feedback_breakdown || employeeReport.feedback_breakdown.length === 0) && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>No 360 feedback summary available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-container">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Training Program</th>
                  <th>Status</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                {(employeeReport.training_overview || []).map((training) => (
                  <tr key={training.id}>
                    <td>{training.program_title}</td>
                    <td>{training.status}</td>
                    <td>{training.completion_percentage}%</td>
                  </tr>
                ))}
                {(!employeeReport.training_overview || employeeReport.training_overview.length === 0) && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>No training records available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="employee-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Create Performance Review</h3>
        <form onSubmit={handleReviewSubmit}>
          <div className="form-group">
            <label>Employee</label>
            <select value={reviewForm.employee} onChange={(e) => setReviewForm((p) => ({ ...p, employee: e.target.value }))} required>
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name || employee.username} ({employee.email})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Review Period</label>
            <input value={reviewForm.review_period} onChange={(e) => setReviewForm((p) => ({ ...p, review_period: e.target.value }))} placeholder="Q1 2026" required />
          </div>
          <div className="form-group">
            <label>Overall Rating (1-5)</label>
            <input type="number" min="1" max="5" step="0.1" value={reviewForm.overall_rating} onChange={(e) => setReviewForm((p) => ({ ...p, overall_rating: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Strengths</label>
            <textarea rows={2} value={reviewForm.strengths} onChange={(e) => setReviewForm((p) => ({ ...p, strengths: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Improvement Areas</label>
            <textarea rows={2} value={reviewForm.improvement_areas} onChange={(e) => setReviewForm((p) => ({ ...p, improvement_areas: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Goals</label>
            <textarea rows={2} value={reviewForm.goals} onChange={(e) => setReviewForm((p) => ({ ...p, goals: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={reviewForm.status} onChange={(e) => setReviewForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="DRAFT">Draft</option>
              <option value="FINALIZED">Finalized</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Create Review</button>
        </form>
      </div>

      <div className="employee-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Add 360 Feedback</h3>
        <form onSubmit={handleFeedbackSubmit}>
          <div className="form-group">
            <label>Performance Review</label>
            <select
              value={feedbackForm.performance_review}
              onChange={(e) => {
                const value = e.target.value;
                setFeedbackForm((p) => ({ ...p, performance_review: value }));
                fetchSummary(value);
              }}
              required
            >
              <option value="">Select review</option>
              {reviews.map((review) => (
                <option key={review.id} value={review.id}>
                  {review.employee_name} - {review.review_period}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Target Employee</label>
            <select value={feedbackForm.to_employee} onChange={(e) => setFeedbackForm((p) => ({ ...p, to_employee: e.target.value }))} required>
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.full_name || employee.username}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Relationship</label>
            <select value={feedbackForm.relationship} onChange={(e) => setFeedbackForm((p) => ({ ...p, relationship: e.target.value }))}>
              <option value="MANAGER">Manager</option>
              <option value="PEER">Peer</option>
              <option value="DIRECT_REPORT">Direct Report</option>
              <option value="SELF">Self</option>
            </select>
          </div>
          <div className="form-group">
            <label>Rating (1-5)</label>
            <input type="number" min="1" max="5" step="0.1" value={feedbackForm.rating} onChange={(e) => setFeedbackForm((p) => ({ ...p, rating: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Comments</label>
            <textarea rows={3} value={feedbackForm.comments} onChange={(e) => setFeedbackForm((p) => ({ ...p, comments: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary">Add Feedback</button>
        </form>
      </div>

      {summary && (
        <div className="employee-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>360 Summary</h3>
          <p><strong>Total Feedback:</strong> {summary.total_feedback}</p>
          <p><strong>Average Rating:</strong> {summary.average_rating}</p>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
            {(summary.by_relationship || []).map((item) => (
              <li key={item.relationship}>{item.relationship}: {item.average_rating} ({item.count})</li>
            ))}
          </ul>
        </div>
      )}

      <div className="table-container" style={{ marginBottom: '1.5rem' }}>
        <table className="leave-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Period</th>
              <th>Rating</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>{review.employee_name}</td>
                <td>{review.review_period}</td>
                <td>{review.overall_rating}</td>
                <td>{review.status}</td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>No performance reviews found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-container">
        <table className="leave-table">
          <thead>
            <tr>
              <th>Review</th>
              <th>From</th>
              <th>To</th>
              <th>Relationship</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {feedbackItems.map((feedback) => (
              <tr key={feedback.id}>
                <td>{feedback.performance_review}</td>
                <td>{feedback.from_employee_name || 'N/A'}</td>
                <td>{feedback.to_employee_name}</td>
                <td>{feedback.relationship}</td>
                <td>{feedback.rating}</td>
              </tr>
            ))}
            {feedbackItems.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No 360 feedback found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformanceManagement;
