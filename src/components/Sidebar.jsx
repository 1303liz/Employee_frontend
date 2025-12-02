import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/employees">Employees</Link>
          </li>
          <li>
            <Link to="/leaves">Leaves</Link>
          </li>
          <li>
            <Link to="/attendance">Attendance</Link>
          </li>
          {user?.role === 'HR' && (
            <>
              <li>
                <Link to="/employees/add">Add Employee</Link>
              </li>
              <li>
                <Link to="/leaves/manage">Manage Leaves</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
