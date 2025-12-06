import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'HR';

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/dashboard">📊 Dashboard</Link>
          </li>
          <li>
            <Link to="/profile">👤 My Profile</Link>
          </li>
          <li>
            <Link to="/employees">👥 Employees</Link>
          </li>
          <li>
            <Link to="/leaves">🏖️ {isHR ? 'All Leaves' : 'My Leaves'}</Link>
          </li>
          <li>
            <Link to="/attendance">📅 Attendance</Link>
          </li>
          <li>
            <Link to="/messaging">💬 Messages</Link>
          </li>
          {isHR && (
            <>
              <li style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <span style={{ fontSize: '12px', color: '#666', padding: '0 15px', fontWeight: 'bold' }}>
                  HR MANAGEMENT
                </span>
              </li>
              <li>
                <Link to="/employees/add">➕ Add Employee</Link>
              </li>
              <li>
                <Link to="/leaves/manage">✅ Manage Leaves</Link>
              </li>
              <li>
                <Link to="/messaging/announcements">📢 Announcements</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
