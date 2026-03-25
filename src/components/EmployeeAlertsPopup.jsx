import React, { useEffect, useMemo, useState } from 'react';
import hrService from '../services/hrService';
import { useAuth } from '../hooks/useAuth';
import './EmployeeAlertsPopup.css';

const EmployeeAlertsPopup = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const seenStorageKey = useMemo(
    () => `employeeAlertsSeenAt_${user?.id || user?.username || 'current'}`,
    [user?.id, user?.username]
  );

  useEffect(() => {
    if (!user || user.role !== 'EMPLOYEE') return;

    const fetchAlerts = async () => {
      try {
        const response = await hrService.getMyEmployeeAlerts({ days: 60 });
        const fetchedAlerts = response?.notifications || [];

        if (fetchedAlerts.length === 0) {
          setAlerts([]);
          setShowPopup(false);
          return;
        }

        const seenAt = localStorage.getItem(seenStorageKey);
        const unseenAlerts = seenAt
          ? fetchedAlerts.filter((item) => new Date(item.created_at) > new Date(seenAt))
          : fetchedAlerts;

        if (unseenAlerts.length > 0) {
          setAlerts(unseenAlerts.slice(0, 8));
          setShowPopup(true);
        }
      } catch (error) {
        console.error('Error fetching employee alerts:', error);
      }
    };

    fetchAlerts();
  }, [seenStorageKey, user]);

  const handleDismiss = () => {
    localStorage.setItem(seenStorageKey, new Date().toISOString());
    setShowPopup(false);
  };

  if (!showPopup || alerts.length === 0) return null;

  return (
    <div className="employee-alert-overlay">
      <div className="employee-alert-popup">
        <div className="employee-alert-header">
          <div>
            <h3>New Employee Updates</h3>
            <p>You have {alerts.length} new update{alerts.length > 1 ? 's' : ''}.</p>
          </div>
          <button className="employee-alert-close" onClick={handleDismiss}>×</button>
        </div>

        <div className="employee-alert-list">
          {alerts.map((alert) => (
            <div key={alert.id} className={`employee-alert-item ${String(alert.priority || '').toLowerCase()}`}>
              <div className="employee-alert-title">{alert.title}</div>
              <div className="employee-alert-message">{alert.message}</div>
              <div className="employee-alert-date">
                {new Date(alert.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="employee-alert-footer">
          <button className="btn btn-primary" onClick={handleDismiss}>Dismiss</button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAlertsPopup;
