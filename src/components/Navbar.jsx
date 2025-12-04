import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Employee Management System</Link>
      </div>
      <div className="navbar-menu">
        {user && (
          <>
            <span className="navbar-user">
              Welcome, {user.first_name || user.username}
              <span 
                className="role-badge"
                style={{
                  marginLeft: '8px',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  backgroundColor: user.role === 'HR' ? '#4CAF50' : '#2196F3',
                  color: 'white',
                  textTransform: 'uppercase'
                }}
              >
                {user.role === 'HR' ? '👔 HR' : '👤 Employee'}
              </span>
            </span>
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
