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
            <span className="navbar-user">Welcome, {user.name}</span>
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
