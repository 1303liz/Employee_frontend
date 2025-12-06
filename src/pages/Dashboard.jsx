import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import employeeService from '../services/employeeService';
import leaveService from '../services/leaveService';
import attendanceService from '../services/attendanceService';
import profileService from '../services/profileService';
import Loader from '../components/Loader';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'HR') {
        const employeesData = await employeeService.getAllEmployees();
        const leavesData = await leaveService.getAllLeaves();
        const attendanceData = await attendanceService.getAllAttendance();

        // Handle both array and paginated response formats
        const employees = Array.isArray(employeesData) ? employeesData : (employeesData?.results || employeesData?.data || []);
        const leaves = Array.isArray(leavesData) ? leavesData : (leavesData?.results || leavesData?.data || []);
        const attendance = Array.isArray(attendanceData) ? attendanceData : (attendanceData?.results || attendanceData?.data || []);

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
      {/* Top Profile Bar */}
      <div className="dashboard-top-bar">
        <div className="top-bar-left">
          <div className="top-bar-avatar">
            {profile?.profile_photo_url ? (
              <img src={profile.profile_photo_url} alt={profile.first_name} />
            ) : (
              <div className="top-bar-avatar-placeholder">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
            )}
          </div>
          <div className="top-bar-info">
            <h2>Welcome back, {user?.first_name || user?.username}!</h2>
            <p>{profile?.role === 'HR' ? '🎯 HR Manager' : '👤 Employee'} • {profile?.department || 'N/A'}</p>
          </div>
        </div>
        <div className="top-bar-right">
          <div className="date-display">
            <span className="date-icon">📅</span>
            <div>
              <div className="date-text">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
              <div className="date-subtext">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {user?.role === 'HR' && (
        <div className="stats-overview">
          <div className="stat-box stat-blue">
            <div className="stat-box-icon">👥</div>
            <div className="stat-box-content">
              <h3>{stats.totalEmployees}</h3>
              <p>Total Employees</p>
            </div>
            <div className="stat-box-trend">↗ Active</div>
          </div>
          <div className="stat-box stat-orange">
            <div className="stat-box-icon">🏖️</div>
            <div className="stat-box-content">
              <h3>{stats.pendingLeaves}</h3>
              <p>Pending Leaves</p>
            </div>
            <div className="stat-box-trend">⏳ Awaiting</div>
          </div>
          <div className="stat-box stat-green">
            <div className="stat-box-icon">✓</div>
            <div className="stat-box-content">
              <h3>{stats.todayAttendance}</h3>
              <p>Today's Attendance</p>
            </div>
            <div className="stat-box-trend">✓ Present</div>
          </div>
          <div className="stat-box stat-purple">
            <div className="stat-box-icon">📊</div>
            <div className="stat-box-content">
              <h3>{stats.totalEmployees > 0 ? Math.round((stats.todayAttendance / stats.totalEmployees) * 100) : 0}%</h3>
              <p>Attendance Rate</p>
            </div>
            <div className="stat-box-trend">📈 Today</div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Quick Actions Panel */}
        <div className="dashboard-card quick-actions-panel">
          <div className="card-header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="card-body">
            <Link to="/attendance/mark" className="action-item action-blue">
              <div className="action-icon">📅</div>
              <div className="action-content">
                <h4>Mark Attendance</h4>
                <p>Clock in/out for today</p>
              </div>
              <div className="action-arrow">→</div>
            </Link>
            <Link to="/leaves/apply" className="action-item action-green">
              <div className="action-icon">✈️</div>
              <div className="action-content">
                <h4>Apply for Leave</h4>
                <p>Request time off</p>
              </div>
              <div className="action-arrow">→</div>
            </Link>
            {user?.role === 'HR' && (
              <>
                <Link to="/employees/add" className="action-item action-purple">
                  <div className="action-icon">➕</div>
                  <div className="action-content">
                    <h4>Add Employee</h4>
                    <p>Register new team member</p>
                  </div>
                  <div className="action-arrow">→</div>
                </Link>
                <Link to="/leaves/manage" className="action-item action-orange">
                  <div className="action-icon">✅</div>
                  <div className="action-content">
                    <h4>Manage Leaves</h4>
                    <p>Approve or reject requests</p>
                  </div>
                  <div className="action-arrow">→</div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="dashboard-card profile-info-panel">
          <div className="card-header">
            <h3>👤 Profile Details</h3>
            <Link to="/profile" className="edit-link">Edit →</Link>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Employee ID</span>
              <span className="info-value">{profile?.employee_id || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{profile?.email || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone</span>
              <span className="info-value">{profile?.phone_number || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Department</span>
              <span className="info-value">{profile?.department || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Hire Date</span>
              <span className="info-value">
                {profile?.hire_date ? new Date(profile.hire_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Status</span>
              <span className="info-value">
                <span className={`mini-badge ${profile?.is_active ? 'badge-active' : 'badge-inactive'}`}>
                  {profile?.is_active ? '● Active' : '● Inactive'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
