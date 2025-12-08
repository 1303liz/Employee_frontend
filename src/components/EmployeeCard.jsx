import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import employeeService from '../services/employeeService';

const EmployeeCard = ({ employee, onDelete }) => {
  const { user: currentUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  
  // Handle both direct user objects and nested EmployeeProfile structure
  const user = employee.user || employee;
  const fullName = user.first_name || user.last_name 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
    : user.username || 'Unknown';
  const employeeId = user.employee_id || `EMP${employee.id || user.id || '000'}`;
  const email = user.email || 'No email provided';
  const department = user.department || 'Unassigned';
  const role = user.role || 'EMPLOYEE';
  const isActive = user.is_active !== undefined ? user.is_active : true;
  const mustChangePassword = user.must_change_password;
  const hasLoggedIn = user.last_login !== null && user.last_login !== undefined;
  
  // Check if this is the current user's profile
  const isCurrentUser = currentUser && (user.id === currentUser.id || user.username === currentUser.username);
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${fullName}? This will deactivate their account and they will no longer be able to log in.`)) {
      onDelete(employee.id);
    }
  };
  
  const handleResendCredentials = async () => {
    setMessage('');
    setResending(true);
    
    try {
      const response = await employeeService.resendEmployeeCredentials(employee.id);
      setMessage(`✅ Credentials sent to ${response.email}`);
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to resend credentials';
      setMessage(`❌ ${errorMsg}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setResending(false);
    }
  };
  
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
        <p>
          <strong>Status:</strong>{' '}
          <span className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </p>
        {mustChangePassword && !hasLoggedIn && (
          <p>
            <span className="status-badge status-warning">
              ⚠️ Awaiting first login
            </span>
          </p>
        )}
        {message && (
          <p style={{ fontSize: '0.875rem', marginTop: '8px', color: message.startsWith('✅') ? 'var(--success-color)' : 'var(--danger-color)' }}>
            {message}
          </p>
        )}
      </div>
      <div className="employee-card-footer">
        <Link to={`/employees/edit/${employee.id || user.id}`} className="btn btn-sm btn-primary">
          Edit
        </Link>
        {mustChangePassword && !hasLoggedIn && role === 'EMPLOYEE' && (
          <button 
            onClick={handleResendCredentials} 
            className="btn btn-sm btn-secondary"
            disabled={resending}
          >
            {resending ? 'Sending...' : '📧 Resend'}
          </button>
        )}
        {!isCurrentUser && (
          <button onClick={handleDelete} className="btn btn-sm btn-danger">
            Delete
          </button>
        )}
        {isCurrentUser && (
          <span style={{ fontSize: '0.85rem', color: 'var(--gray-text)', marginLeft: '0.5rem' }}>
            (You cannot delete yourself)
          </span>
        )}
      </div>
    </div>
  );
};

export default EmployeeCard;
