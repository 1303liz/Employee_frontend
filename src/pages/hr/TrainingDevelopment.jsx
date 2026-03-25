import React, { useEffect, useState } from 'react';
import hrService from '../../services/hrService';
import employeeService from '../../services/employeeService';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/formatDate';

const TrainingDevelopment = () => {
  const [programs, setPrograms] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('');
  const [applicationNotes, setApplicationNotes] = useState({});

  const [programForm, setProgramForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const [enrollmentForm, setEnrollmentForm] = useState({
    training_program: '',
    employee: '',
    status: 'ASSIGNED',
    completion_percentage: 0,
    notes: '',
  });

  const parseList = (response) => (Array.isArray(response) ? response : response?.results || []);

  const fetchData = async () => {
    try {
      const [programRes, enrollmentRes, employeeRes, applicationRes] = await Promise.all([
        hrService.getTrainingPrograms(),
        hrService.getTrainingEnrollments(),
        employeeService.getAllEmployees(),
        hrService.getAllTrainingApplications(applicationFilter ? { status: applicationFilter } : {}),
      ]);

      const parsedPrograms = parseList(programRes);
      const parsedEnrollments = parseList(enrollmentRes);
      const parsedEmployees = parseList(employeeRes);
      const parsedApplications = parseList(applicationRes);

      setPrograms(parsedPrograms);
      setEnrollments(parsedEnrollments);
      setEmployees(parsedEmployees);
      setApplications(parsedApplications);
      setApplicationNotes(
        parsedApplications.reduce((accumulator, application) => ({
          ...accumulator,
          [application.id]: application.hr_notes || '',
        }), {})
      );

      if (!enrollmentForm.training_program && parsedPrograms.length > 0) {
        setEnrollmentForm((prev) => ({ ...prev, training_program: parsedPrograms[0].id }));
      }
      if (!enrollmentForm.employee && parsedEmployees.length > 0) {
        setEnrollmentForm((prev) => ({ ...prev, employee: parsedEmployees[0].id }));
      }
    } catch (err) {
      setError('Failed to load training data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [applicationFilter]);

  const handleProgramSubmit = async (e) => {
    e.preventDefault();
    try {
      await hrService.createTrainingProgram(programForm);
      setProgramForm({ title: '', description: '', start_date: '', end_date: '', is_active: true });
      setError('');
      setSuccess('Training program created successfully.');
      fetchData();
    } catch (err) {
      setError('Failed to create training program');
    }
  };

  const handleEnrollmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await hrService.createTrainingEnrollment({
        ...enrollmentForm,
        training_program: Number(enrollmentForm.training_program),
        employee: Number(enrollmentForm.employee),
        completion_percentage: Number(enrollmentForm.completion_percentage),
      });
      setEnrollmentForm((prev) => ({ ...prev, notes: '', completion_percentage: 0 }));
      setError('');
      setSuccess('Training enrollment assigned successfully.');
      fetchData();
    } catch (err) {
      setError('Failed to assign training enrollment');
    }
  };

  const handleApplicationDecision = async (applicationId, status) => {
    try {
      await hrService.updateTrainingApplication(applicationId, {
        status,
        hr_notes: applicationNotes[applicationId] || '',
      });
      setError('');
      setSuccess(`Application ${status.toLowerCase()} successfully.`);
      fetchData();
    } catch (err) {
      const message = err?.response?.data?.detail
        || err?.response?.data?.non_field_errors?.[0]
        || 'Failed to update training application';
      setError(message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="leave-list-container">
      <h1>Training & Development</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="error-message" style={{ background: '#d3f9d8', color: '#2f9e44' }}>{success}</div>}

      <div className="employee-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Create Training Program</h3>
        <form onSubmit={handleProgramSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input value={programForm.title} onChange={(e) => setProgramForm((p) => ({ ...p, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={programForm.description} onChange={(e) => setProgramForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" value={programForm.start_date} onChange={(e) => setProgramForm((p) => ({ ...p, start_date: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" value={programForm.end_date} onChange={(e) => setProgramForm((p) => ({ ...p, end_date: e.target.value }))} required />
          </div>
          <button className="btn btn-primary" type="submit">Create Program</button>
        </form>
      </div>

      <div className="employee-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Assign Employee to Program</h3>
        <form onSubmit={handleEnrollmentSubmit}>
          <div className="form-group">
            <label>Program</label>
            <select value={enrollmentForm.training_program} onChange={(e) => setEnrollmentForm((p) => ({ ...p, training_program: e.target.value }))} required>
              <option value="">Select program</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>{program.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Employee</label>
            <select value={enrollmentForm.employee} onChange={(e) => setEnrollmentForm((p) => ({ ...p, employee: e.target.value }))} required>
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name || employee.username} ({employee.email})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={enrollmentForm.status} onChange={(e) => setEnrollmentForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Completion %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={enrollmentForm.completion_percentage}
              onChange={(e) => setEnrollmentForm((p) => ({ ...p, completion_percentage: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={enrollmentForm.notes} onChange={(e) => setEnrollmentForm((p) => ({ ...p, notes: e.target.value }))} rows={2} />
          </div>
          <button className="btn btn-primary" type="submit">Assign Training</button>
        </form>
      </div>

      <div className="table-container" style={{ marginBottom: '1.5rem' }}>
        <table className="leave-table">
          <thead>
            <tr>
              <th>Program</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program) => (
              <tr key={program.id}>
                <td>{program.title}</td>
                <td>{formatDate(program.start_date)} - {formatDate(program.end_date)}</td>
                <td>{program.is_active ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
            {programs.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>No training programs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="employee-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Training Applications Review</h3>
          <div className="form-group" style={{ margin: 0, minWidth: 220 }}>
            <label>Status Filter</label>
            <select value={applicationFilter} onChange={(e) => setApplicationFilter(e.target.value)}>
              <option value="">All applications</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="leave-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Program</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied On</th>
                <th>HR Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>{application.applicant_name}</td>
                  <td>{application.program_title}</td>
                  <td style={{ maxWidth: 220 }}>{application.reason || '—'}</td>
                  <td>{application.status_display}</td>
                  <td>{formatDate(application.applied_at)}</td>
                  <td style={{ minWidth: 220 }}>
                    <textarea
                      rows={2}
                      value={applicationNotes[application.id] || ''}
                      onChange={(e) => setApplicationNotes((prev) => ({
                        ...prev,
                        [application.id]: e.target.value,
                      }))}
                      placeholder="Add HR notes"
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '6px 10px', fontSize: 12 }}
                        disabled={application.status === 'APPROVED' || application.status === 'WITHDRAWN'}
                        onClick={() => handleApplicationDecision(application.id, 'APPROVED')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: 12 }}
                        disabled={application.status === 'REJECTED' || application.status === 'WITHDRAWN'}
                        onClick={() => handleApplicationDecision(application.id, 'REJECTED')}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No training applications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-container">
        <table className="leave-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Program</th>
              <th>Status</th>
              <th>Completion</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id}>
                <td>{enrollment.employee_name}</td>
                <td>{enrollment.program_title}</td>
                <td>{enrollment.status}</td>
                <td>{enrollment.completion_percentage}%</td>
              </tr>
            ))}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>No enrollments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainingDevelopment;
