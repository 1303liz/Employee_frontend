import React from 'react';
import { Link } from 'react-router-dom';

const EmployeeCard = ({ employee }) => {
  return (
    <div className="employee-card">
      <div className="employee-card-header">
        <h3>{employee.name}</h3>
        <span className="employee-id">ID: {employee.employeeId}</span>
      </div>
      <div className="employee-card-body">
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Department:</strong> {employee.department}</p>
        <p><strong>Position:</strong> {employee.position}</p>
        <p><strong>Status:</strong> {employee.status}</p>
      </div>
      <div className="employee-card-footer">
        <Link to={`/employees/edit/${employee._id}`} className="btn btn-primary">
          Edit
        </Link>
      </div>
    </div>
  );
};

export default EmployeeCard;
