import React, { useEffect, useState } from 'react';
import hrService from '../../services/hrService';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/formatDate';

const RecruitmentManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [candidateResponses, setCandidateResponses] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [questionForm, setQuestionForm] = useState({ question: '', category: 'GENERAL' });
  const [candidateForm, setCandidateForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    position_applied: '',
    resume_link: '',
  });
  const [responseForm, setResponseForm] = useState({ question: '', answer: '', score: '' });

  const parseList = (response) => (Array.isArray(response) ? response : response?.results || []);

  const fetchData = async () => {
    try {
      const [qRes, cRes] = await Promise.all([
        hrService.getRecruitmentQuestions(),
        hrService.getCandidates(),
      ]);
      const parsedQuestions = parseList(qRes);
      const parsedCandidates = parseList(cRes);
      setQuestions(parsedQuestions);
      setCandidates(parsedCandidates);

      if (!selectedCandidateId && parsedCandidates.length > 0) {
        setSelectedCandidateId(parsedCandidates[0].id);
      }
    } catch (err) {
      setError('Failed to load recruitment data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (candidateId) => {
    if (!candidateId) {
      setCandidateResponses([]);
      return;
    }

    try {
      const res = await hrService.getCandidateResponses(candidateId);
      setCandidateResponses(parseList(res));
    } catch (err) {
      setError('Failed to load candidate responses');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchResponses(selectedCandidateId);
  }, [selectedCandidateId]);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await hrService.createRecruitmentQuestion(questionForm);
      setQuestionForm({ question: '', category: 'GENERAL' });
      setError('');
      fetchData();
    } catch (err) {
      setError('Failed to create question');
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await hrService.createCandidate(candidateForm);
      setCandidateForm({ full_name: '', email: '', phone_number: '', position_applied: '', resume_link: '' });
      setError('');
      fetchData();
    } catch (err) {
      setError('Failed to add candidate');
    }
  };

  const handleAddResponse = async (e) => {
    e.preventDefault();
    if (!selectedCandidateId) {
      setError('Select a candidate first');
      return;
    }

    try {
      const payload = {
        question: Number(responseForm.question),
        answer: responseForm.answer,
      };

      if (responseForm.score !== '') {
        payload.score = Number(responseForm.score);
      }

      await hrService.createCandidateResponse(selectedCandidateId, payload);
      setResponseForm({ question: '', answer: '', score: '' });
      setError('');
      fetchResponses(selectedCandidateId);
    } catch (err) {
      setError('Failed to save candidate response');
    }
  };

  const handleShortlist = async (candidateId) => {
    try {
      await hrService.shortlistCandidate(candidateId);
      setError('');
      fetchData();
    } catch (err) {
      setError('Failed to shortlist candidate');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="leave-list-container">
      <h1>Recruitment Management</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="employee-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Add Pre-screening Question</h3>
        <form onSubmit={handleAddQuestion} className="leave-form">
          <div className="form-group">
            <label>Question</label>
            <textarea
              value={questionForm.question}
              onChange={(e) => setQuestionForm((prev) => ({ ...prev, question: e.target.value }))}
              required
              rows={2}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={questionForm.category}
              onChange={(e) => setQuestionForm((prev) => ({ ...prev, category: e.target.value }))}
            >
              <option value="GENERAL">General</option>
              <option value="TECHNICAL">Technical</option>
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="EXPERIENCE">Experience</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Add Question</button>
        </form>
      </div>

      <div className="employee-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Add Candidate</h3>
        <form onSubmit={handleAddCandidate}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={candidateForm.full_name} onChange={(e) => setCandidateForm((p) => ({ ...p, full_name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={candidateForm.email} onChange={(e) => setCandidateForm((p) => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={candidateForm.phone_number} onChange={(e) => setCandidateForm((p) => ({ ...p, phone_number: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Position Applied</label>
            <input value={candidateForm.position_applied} onChange={(e) => setCandidateForm((p) => ({ ...p, position_applied: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Resume URL</label>
            <input value={candidateForm.resume_link} onChange={(e) => setCandidateForm((p) => ({ ...p, resume_link: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary">Add Candidate</button>
        </form>
      </div>

      <div className="table-container" style={{ marginBottom: '1.5rem' }}>
        <table className="leave-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Position</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>{candidate.full_name}</td>
                <td>{candidate.position_applied}</td>
                <td>{candidate.email}</td>
                <td>
                  <span className={`status-badge status-${String(candidate.status || '').toLowerCase()}`}>
                    {candidate.status}
                  </span>
                </td>
                <td>{formatDate(candidate.created_at)}</td>
                <td>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleShortlist(candidate.id)}
                    disabled={candidate.status === 'SHORTLISTED'}
                  >
                    Shortlist
                  </button>
                </td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No candidates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="employee-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Record Candidate Answer</h3>
        <form onSubmit={handleAddResponse}>
          <div className="form-group">
            <label>Candidate</label>
            <select value={selectedCandidateId} onChange={(e) => setSelectedCandidateId(e.target.value)} required>
              <option value="">Select candidate</option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.full_name} ({candidate.position_applied})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Question</label>
            <select
              value={responseForm.question}
              onChange={(e) => setResponseForm((prev) => ({ ...prev, question: e.target.value }))}
              required
            >
              <option value="">Select question</option>
              {questions.map((question) => (
                <option key={question.id} value={question.id}>{question.question}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Answer</label>
            <textarea
              value={responseForm.answer}
              onChange={(e) => setResponseForm((prev) => ({ ...prev, answer: e.target.value }))}
              rows={3}
              required
            />
          </div>
          <div className="form-group">
            <label>Score (Optional)</label>
            <input
              type="number"
              min="0"
              max="10"
              value={responseForm.score}
              onChange={(e) => setResponseForm((prev) => ({ ...prev, score: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-primary">Save Answer</button>
        </form>
      </div>

      <div className="table-container">
        <table className="leave-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Answer</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {candidateResponses.map((item) => (
              <tr key={item.id}>
                <td>{item.question_text}</td>
                <td>{item.answer}</td>
                <td>{item.score ?? '-'}</td>
              </tr>
            ))}
            {candidateResponses.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>No answers recorded for selected candidate.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecruitmentManagement;
