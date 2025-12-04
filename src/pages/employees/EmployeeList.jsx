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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.role === 'HR') {
      fetchEmployees();
    } else {
      setLoading(false);
      setError('Only HR personnel can view the employee list');
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      console.log('Employees data:', data);
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to load employees');
    } finally {
      setLoading(false);
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

      {error && <div className="error-message">{error}</div>}
      
      {user?.role !== 'HR' && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <h3>Access Restricted</h3>
          <p>Only HR personnel can view and manage the employee list.</p>
        </div>
      )}

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
              <EmployeeCard key={employee.id || employee.user?.id} employee={employee} />
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
