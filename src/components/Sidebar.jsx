import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import messagingService from '../services/messagingService';

const Sidebar = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'HR';
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll for new messages every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      
      // Listen for message read events to update count immediately
      const handleMessageRead = () => {
        fetchUnreadCount();
      };
      window.addEventListener('messageread', handleMessageRead);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('messageread', handleMessageRead);
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const data = await messagingService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (window.innerWidth <= 768) {
      const sidebar = document.querySelector('.sidebar');
      const overlay = document.querySelector('.sidebar-overlay');
      if (sidebar) {
        sidebar.classList.remove('mobile-open');
      }
      if (overlay) {
        overlay.classList.remove('active');
      }
    }
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/dashboard" onClick={handleLinkClick}>📊 Dashboard</Link>
          </li>
          <li>
            <Link to="/profile" onClick={handleLinkClick}>👤 My Profile</Link>
          </li>
          <li>
            <Link to="/employees" onClick={handleLinkClick}>👥 Employees</Link>
          </li>
          <li>
            <Link to="/leaves" onClick={handleLinkClick}>🏖️ {isHR ? 'All Leaves' : 'My Leaves'}</Link>
          </li>
          <li>
            <Link to="/attendance" onClick={handleLinkClick}>📅 Attendance</Link>
          </li>
          <li style={{ position: 'relative' }}>
            <Link to="/messaging" onClick={handleLinkClick}>
              💬 Messages
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link to="/messaging/announcements" onClick={handleLinkClick}>📢 Announcements</Link>
          </li>
          {isHR && (
            <>
              <li style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <span style={{ fontSize: '12px', color: '#666', padding: '0 15px', fontWeight: 'bold' }}>
                  HR MANAGEMENT
                </span>
              </li>
              <li>
                <Link to="/employees/add" onClick={handleLinkClick}>➕ Add Employee</Link>
              </li>
              <li>
                <Link to="/leaves/manage" onClick={handleLinkClick}>✅ Manage Leaves</Link>
              </li>
              <li>
                <Link to="/messaging/announcements/manage" onClick={handleLinkClick}>📢 Manage Announcements</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
