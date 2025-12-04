import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import employeeService from '../services/employeeService';
import leaveService from '../services/leaveService';
import attendanceService from '../services/attendanceService';
import Loader from '../components/Loader';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'HR') {
        const employees = await employeeService.getAllEmployees();
        const leaves = await leaveService.getAllLeaves();
        const attendance = await attendanceService.getAllAttendance();

        setStats({
          totalEmployees: employees.length,
          pendingLeaves: leaves.filter((l) => l.status === 'Pending').length,
          todayAttendance: attendance.filter(
            (a) => new Date(a.date).toDateString() === new Date().toDateString()
          ).length,
        });
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--gray-text)', margin: 0 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="welcome-message">
        <h2>Welcome back, {user?.first_name || user?.username}! 👋</h2>
        <p style={{ margin: 0, fontSize: '1rem' }}>
          Here's what's happening with your team today.
        </p>
      </div>

      {user?.role === 'HR' && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#5468ff' }}>
              👥
            </div>
            <h3>Total Employees</h3>
            <p className="stat-number">{stats.totalEmployees}</p>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem', margin: 0 }}>
              Active team members
            </p>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
              🏖️
            </div>
            <h3>Pending Leaves</h3>
            <p className="stat-number">{stats.pendingLeaves}</p>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem', margin: 0 }}>
              Awaiting approval
            </p>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
              ✓
            </div>
            <h3>Today's Attendance</h3>
            <p className="stat-number">{stats.todayAttendance}</p>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.85rem', margin: 0 }}>
              Present today
            </p>
          </div>
        </div>
      )}

      <div className="quick-actions" style={{ 
        backgroundColor: 'var(--card-bg)', 
        padding: '2rem', 
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        marginTop: '2rem'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--dark-text)', fontSize: '1.25rem' }}>
          Quick Actions
        </h3>
        <div className="action-buttons">
          <a href="/attendance/mark" className="btn btn-primary">
            📅 Mark Attendance
          </a>
          <a href="/leaves/apply" className="btn btn-success">
            ✈️ Apply for Leave
          </a>
          {user?.role === 'HR' && (
            <>
              <a href="/employees/add" className="btn btn-primary">
                ➕ Add Employee
              </a>
              <a href="/leaves/manage" className="btn btn-secondary">
                ✅ Manage Leaves
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
