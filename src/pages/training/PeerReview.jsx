import React, { useEffect, useState } from 'react';
import hrService from '../../services/hrService';
import employeeService from '../../services/employeeService';
import Loader from '../../components/Loader';
import { useAuth } from '../../hooks/useAuth';

const RATING_LABELS = { 1: '1 - Poor', 2: '2 - Below Average', 3: '3 - Average', 4: '4 - Good', 5: '5 - Excellent' };

const StarRating = ({ value, onChange, name }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(name, n)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 24, color: n <= value ? '#FCC419' : '#dee2e6',
          padding: 0, lineHeight: 1,
        }}
        title={RATING_LABELS[n]}
      >
        *
      </button>
    ))}
    <span style={{ fontSize: 13, color: '#666', alignSelf: 'center', marginLeft: 4 }}>
      {value ? RATING_LABELS[value] : 'Not rated'}
    </span>
  </div>
);

const defaultForm = {
  evaluatee: '',
  period: '',
  communication_rating: 3,
  teamwork_rating: 3,
  technical_rating: 3,
  leadership_rating: 3,
  overall_comments: '',
};

const PeerReview = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [givenEvals, setGivenEvals] = useState([]);
  const [receivedEvals, setReceivedEvals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('submit');

  const parseList = (r) => (Array.isArray(r) ? r : r?.results || []);

  const fetchAll = async () => {
    try {
      const [empRes, givenRes, receivedRes] = await Promise.all([
        employeeService.getColleagues(),
        hrService.getPeerEvaluations({ direction: 'given' }),
        hrService.getPeerEvaluations({ direction: 'received' }),
      ]);
      setEmployees(parseList(empRes));
      setGivenEvals(parseList(givenRes));
      setReceivedEvals(parseList(receivedRes));
    } catch {
      setError('Failed to load evaluation data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRating = (name, value) => setForm(p => ({ ...p, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.evaluatee) return setError('Please select a colleague to evaluate.');
    if (!form.period.trim()) return setError('Please specify the evaluation period (e.g. Q1 2026).');
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await hrService.submitPeerEvaluation({ ...form, evaluatee: Number(form.evaluatee) });
      setSuccess('Peer evaluation submitted successfully!');
      setForm(defaultForm);
      fetchAll();
      setActiveTab('given');
    } catch (err) {
      const data = err?.response?.data;
      const msg = data?.non_field_errors?.[0] || data?.evaluatee?.[0] || data?.detail || 'Failed to submit evaluation.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this evaluation?')) return;
    try {
      await hrService.deletePeerEvaluation(id);
      setSuccess('Evaluation deleted.');
      fetchAll();
    } catch {
      setError('Failed to delete evaluation.');
    }
  };

  const avgOf = (ev) => ((ev.communication_rating + ev.teamwork_rating + ev.technical_rating + ev.leadership_rating) / 4).toFixed(1);

  if (loading) return <Loader />;

  return (
    <div className="leave-list-container">
      <h1>Peer Reviews and Evaluations</h1>

      {error && <div className="error-message" style={{ marginBottom: 12 }}>{error}</div>}
      {success && (
        <div className="error-message" style={{ background: '#d3f9d8', color: '#2f9e44', marginBottom: 12 }}>
          {success}
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {[
          { key: 'submit', label: 'Submit Evaluation' },
          { key: 'given', label: `Evaluations Given (${givenEvals.length})` },
          { key: 'received', label: `Evaluations Received (${receivedEvals.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 18px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14,
              background: activeTab === tab.key ? '#228BE6' : '#f1f3f5',
              color: activeTab === tab.key ? '#fff' : '#495057',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'submit' && (
        <div className="employee-card">
          <h3 style={{ marginBottom: '1rem' }}>Evaluate a Colleague</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Colleague to Evaluate</label>
              <select value={form.evaluatee} onChange={e => setForm(p => ({ ...p, evaluatee: e.target.value }))} required>
                <option value="">Select colleague...</option>
                {employees.map(emp => (
                  <option key={emp.user_id || emp.id} value={emp.user_id || emp.id}>
                    {emp.full_name || emp.username} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Evaluation Period (e.g. Q1 2026)</label>
              <input
                type="text"
                placeholder="Q1 2026"
                value={form.period}
                onChange={e => setForm(p => ({ ...p, period: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Communication Rating</label>
              <StarRating value={form.communication_rating} onChange={handleRating} name="communication_rating" />
            </div>
            <div className="form-group">
              <label>Teamwork Rating</label>
              <StarRating value={form.teamwork_rating} onChange={handleRating} name="teamwork_rating" />
            </div>
            <div className="form-group">
              <label>Technical Skills Rating</label>
              <StarRating value={form.technical_rating} onChange={handleRating} name="technical_rating" />
            </div>
            <div className="form-group">
              <label>Leadership Rating</label>
              <StarRating value={form.leadership_rating} onChange={handleRating} name="leadership_rating" />
            </div>
            <div className="form-group">
              <label>Overall Comments</label>
              <textarea
                rows={4}
                placeholder="Share your observations and feedback..."
                value={form.overall_comments}
                onChange={e => setForm(p => ({ ...p, overall_comments: e.target.value }))}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'given' && (
        <div className="employee-card">
          <h3 style={{ marginBottom: '1rem' }}>Evaluations I Have Given</h3>
          {givenEvals.length === 0 ? (
            <p style={{ color: '#666' }}>You have not submitted any peer evaluations yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {givenEvals.map(ev => (
                <div key={ev.id} style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: 16, background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong>{ev.evaluatee_name}</strong>
                      <span style={{ marginLeft: 8, fontSize: 13, color: '#868E96' }}>Period: {ev.period}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ background: '#228BE6', color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                        Avg: {avgOf(ev)} / 5
                      </span>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        style={{ background: 'none', border: '1px solid #FA5252', color: '#FA5252', borderRadius: 4, padding: '2px 10px', cursor: 'pointer', fontSize: 12 }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 13, color: '#555' }}>
                    <span>Communication: <strong>{ev.communication_rating}/5</strong></span>
                    <span>Teamwork: <strong>{ev.teamwork_rating}/5</strong></span>
                    <span>Technical: <strong>{ev.technical_rating}/5</strong></span>
                    <span>Leadership: <strong>{ev.leadership_rating}/5</strong></span>
                  </div>
                  {ev.overall_comments && (
                    <p style={{ marginTop: 8, fontSize: 13, color: '#555', fontStyle: 'italic' }}>"{ev.overall_comments}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'received' && (
        <div className="employee-card">
          <h3 style={{ marginBottom: '1rem' }}>Evaluations I Have Received</h3>
          {receivedEvals.length === 0 ? (
            <p style={{ color: '#666' }}>No peer evaluations have been submitted about you yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {receivedEvals.map(ev => (
                <div key={ev.id} style={{ border: '1px solid #e9ecef', borderRadius: 8, padding: 16, background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong>From: {ev.evaluator_name}</strong>
                      <span style={{ marginLeft: 8, fontSize: 13, color: '#868E96' }}>Period: {ev.period}</span>
                    </div>
                    <span style={{ background: '#40C057', color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                      Avg: {avgOf(ev)} / 5
                    </span>
                  </div>
                  <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 13, color: '#555' }}>
                    <span>Communication: <strong>{ev.communication_rating}/5</strong></span>
                    <span>Teamwork: <strong>{ev.teamwork_rating}/5</strong></span>
                    <span>Technical: <strong>{ev.technical_rating}/5</strong></span>
                    <span>Leadership: <strong>{ev.leadership_rating}/5</strong></span>
                  </div>
                  {ev.overall_comments && (
                    <p style={{ marginTop: 8, fontSize: 13, color: '#555', fontStyle: 'italic' }}>"{ev.overall_comments}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PeerReview;