import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import messagingService from '../services/messagingService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Toggle sidebar visibility
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) {
      sidebar.classList.toggle('mobile-open');
    }
    if (overlay) {
      overlay.classList.toggle('active');
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) {
      sidebar.classList.remove('mobile-open');
    }
    if (overlay) {
      overlay.classList.remove('active');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
        <Link to="/">Employee Management System</Link>
      </div>
      <div className="navbar-menu">
        {user && (
          <>
            <Link 
              to="/messaging" 
              className="navbar-messages"
              style={{
                position: 'relative',
                marginRight: '20px',
                fontSize: '20px',
                color: '#333',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              💬
              {unreadCount > 0 && (
                <span 
                  className="unread-badge"
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-10px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
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
      
      {/* Overlay for mobile sidebar */}
      <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
    </nav>
  );
};

export default Navbar;
