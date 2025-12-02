import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import EmployeeCard from '../../components/EmployeeCard';
import Loader from '../../components/Loader';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (err) {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="employee-list-container">
      <div className="page-header">
        <h1>Employees</h1>
        <Link to="/employees/add" className="btn btn-primary">
          Add Employee
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

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
          <EmployeeCard key={employee._id} employee={employee} />
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <p className="no-data">No employees found.</p>
      )}
    </div>
  );
};

export default EmployeeList;
