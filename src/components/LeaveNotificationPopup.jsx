import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './LeaveNotificationPopup.css';

const LeaveNotificationPopup = () => {
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkLeaveNotifications();
  }, []);

  const checkLeaveNotifications = async () => {
    try {
      const response = await api.get('/leave-management/notifications/ending-soon/');
      
      if (response.data.has_notifications && !dismissed) {
        setNotifications(response.data.notifications);
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Error fetching leave notifications:', error);
    }
  };

  const handleDismiss = () => {
    setShowPopup(false);
    setDismissed(true);
    // Store dismissal in sessionStorage so it doesn't show again this session
    sessionStorage.setItem('leaveNotificationDismissed', 'true');
  };

  if (!showPopup || notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-overlay">
      <div className="notification-popup">
        <div className="notification-header">
          <div className="notification-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </div>
          <div>
            <h3>Leave Ending Soon</h3>
            <p className="notification-subtitle">You have upcoming leave end dates</p>
          </div>
          <button className="close-button" onClick={handleDismiss}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="notification-content">
          {notifications.map((notification) => (
            <div key={notification.id} className={`notification-item priority-${notification.priority}`}>
              <div className="notification-badge">
                {notification.days_remaining === 0 ? (
                  <span className="badge-today">Today</span>
                ) : notification.days_remaining === 1 ? (
                  <span className="badge-tomorrow">Tomorrow</span>
                ) : (
                  <span className="badge-days">{notification.days_remaining} days</span>
                )}
              </div>
              <div className="notification-details">
                <h4>{notification.leave_type}</h4>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-dates">
                  <span>
                    {new Date(notification.start_date).toLocaleDateString()} - {new Date(notification.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="notification-footer">
          <button className="dismiss-button" onClick={handleDismiss}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveNotificationPopup;
