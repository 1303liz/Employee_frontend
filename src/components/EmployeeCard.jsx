import React from 'react';
import { Link } from 'react-router-dom';

const EmployeeCard = ({ employee }) => {
  // Handle both direct user objects and nested EmployeeProfile structure
  const user = employee.user || employee;
  const fullName = user.first_name || user.last_name 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
    : user.username || 'Unknown';
  const employeeId = user.employee_id || employee.id || 'N/A';
  const email = user.email || 'N/A';
  const department = user.department || 'N/A';
  const role = user.role || 'EMPLOYEE';
  const isActive = user.is_active !== undefined ? user.is_active : true;
  
  return (
    <div className="employee-card">
      <div className="employee-card-header">
        <h3>{fullName}</h3>
        <span className="employee-id">ID: {employeeId}</span>
      </div>
      <div className="employee-card-body">
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Department:</strong> {department}</p>
        <p><strong>Role:</strong> {role}</p>
        <p><strong>Status:</strong> {
          <span className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        }</p>
      </div>
      <div className="employee-card-footer">
        <Link to={`/employees/edit/${employee.id || user.id}`} className="btn btn-sm btn-primary">
          Edit
        </Link>
      </div>
    </div>
  );
};

export default EmployeeCard;
