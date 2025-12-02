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
      <h1>Dashboard</h1>
      <div className="welcome-message">
        <h2>Welcome, {user?.name}!</h2>
        <p>Role: {user?.role}</p>
      </div>

      {user?.role === 'HR' && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Employees</h3>
            <p className="stat-number">{stats.totalEmployees}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Leaves</h3>
            <p className="stat-number">{stats.pendingLeaves}</p>
          </div>
          <div className="stat-card">
            <h3>Today's Attendance</h3>
            <p className="stat-number">{stats.todayAttendance}</p>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <a href="/attendance/mark" className="btn btn-primary">
            Mark Attendance
          </a>
          <a href="/leaves/apply" className="btn btn-primary">
            Apply Leave
          </a>
          {user?.role === 'HR' && (
            <>
              <a href="/employees/add" className="btn btn-primary">
                Add Employee
              </a>
              <a href="/leaves/manage" className="btn btn-primary">
                Manage Leaves
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
