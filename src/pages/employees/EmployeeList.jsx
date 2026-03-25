import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import employeeService from '../../services/employeeService';
import EmployeeCard from '../../components/EmployeeCard';
import Loader from '../../components/Loader';

const EmployeeList = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.role === 'HR') {
      fetchEmployees();
    } else {
      setLoading(false);
      setError('');
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      console.log('Employees data:', data);
      // Handle both array and paginated response formats
      const employeesList = Array.isArray(data) ? data : (data?.results || data?.data || []);
      setEmployees(employeesList);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      setError('');
      setSuccess('');
      await employeeService.deleteEmployee(employeeId);
      setSuccess('Employee deleted successfully');
      // Remove the deleted employee from the list
      setEmployees(employees.filter(emp => emp.id !== employeeId));
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to delete employee:', err);
      setError(err.response?.data?.detail || 'Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const user = emp.user || emp;
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.department && user.department.toLowerCase().includes(searchLower)) ||
      (user.username && user.username.toLowerCase().includes(searchLower))
    );
  });

  if (loading) return <Loader />;

  if (user?.role !== 'HR') {
    const employeeSections = [
      {
        title: 'Training Applications',
        description: 'View training programs posted by HR, apply, and track your enrollment progress.',
        link: '/employees/training',
        action: 'Open Training Portal',
        accent: '#1d4ed8',
      },
      {
        title: 'Peer Reviews',
        description: 'Review and evaluate colleagues, then check the feedback you have received.',
        link: '/employees/peer-reviews',
        action: 'Open Peer Reviews',
        accent: '#0f766e',
      },
      {
        title: 'Performance Reports',
        description: 'Review performance reports provided by HR and download or print a copy when needed.',
        link: '/employees/performance-report',
        action: 'Open Performance Report',
        accent: '#b45309',
      },
    ];

    return (
      <div className="employee-list-container">
        <div className="page-header">
          <h1>Employee Section</h1>
        </div>

        <div className="employee-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Development and Performance</h3>
          <p style={{ margin: 0, color: '#555' }}>
            Use this section to apply for HR-posted trainings, complete peer evaluations, and review your performance reports.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {employeeSections.map((section) => (
            <div
              key={section.title}
              className="employee-card"
              style={{ borderTop: `4px solid ${section.accent}` }}
            >
              <h3 style={{ marginBottom: '0.75rem' }}>{section.title}</h3>
              <p style={{ color: '#555', minHeight: 72 }}>{section.description}</p>
              <Link to={section.link} className="btn btn-primary">
                {section.action}
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="employee-list-container">
      <div className="page-header">
        <h1>Employees</h1>
        {user?.role === 'HR' && (
          <Link to="/employees/add" className="btn btn-primary">
            Add Employee
          </Link>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {user?.role === 'HR' && (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="employee-grid">
            {filteredEmployees.map((employee) => (
              <EmployeeCard 
                key={employee.id || employee.user?.id} 
                employee={employee}
                onDelete={handleDeleteEmployee}
              />
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <p className="no-data">No employees found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeList;
