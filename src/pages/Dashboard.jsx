import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import employeeService from '../services/employeeService';
import leaveService from '../services/leaveService';
import attendanceService from '../services/attendanceService';
import profileService from '../services/profileService';
import messagingService from '../services/messagingService';
import Loader from '../components/Loader';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
  });
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchProfile();
    fetchMessages();
    fetchAnnouncements();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const [unreadData, inboxData] = await Promise.all([
        messagingService.getUnreadCount(),
        messagingService.getInbox()
      ]);
      setUnreadMessages(unreadData.count || 0);
      const messages = Array.isArray(inboxData) ? inboxData : (inboxData.results || []);
      setRecentMessages(messages.slice(0, 5)); // Get first 5 messages
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await messagingService.getActiveAnnouncements();
      const announcements = Array.isArray(response) ? response : (response.results || []);
      setRecentAnnouncements(announcements.slice(0, 3)); // Get first 3 announcements
    } catch (err) {
      console.error('Failed to fetch announcements', err);
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
            <p>
              {profile?.role === 'HR' ? '🎯 HR Manager' : '👤 Employee'}
              {profile?.department && ` • ${profile.department}`}
            </p>
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
            <Link to="/messaging/announcements" className="action-item action-yellow">
              <div className="action-icon">📢</div>
              <div className="action-content">
                <h4>View Announcements</h4>
                <p>Stay updated with news</p>
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
                <Link to="/messaging/announcements/manage" className="action-item action-red">
                  <div className="action-icon">📣</div>
                  <div className="action-content">
                    <h4>Manage Announcements</h4>
                    <p>Create & edit announcements</p>
                  </div>
                  <div className="action-arrow">→</div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Messages Card */}
        <div className="dashboard-card messages-panel">
          <div className="card-header">
            <h3>💬 Recent Messages</h3>
            <Link to="/messaging" className="edit-link">
              View All {unreadMessages > 0 && `(${unreadMessages} new)`} →
            </Link>
          </div>
          <div className="card-body">
            {recentMessages.length > 0 ? (
              <>
                {recentMessages.map((message) => (
                  <Link 
                    to={`/messaging/view/${message.id}`} 
                    key={message.id}
                    className="message-item"
                    style={{
                      display: 'block',
                      padding: '12px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      backgroundColor: message.is_read ? '#fff' : '#f0f7ff',
                      border: '1px solid #e0e0e0',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: message.is_read ? 'normal' : 'bold',
                          color: '#333',
                          marginBottom: '4px'
                        }}>
                          {!message.is_read && <span style={{ color: '#2196F3', marginRight: '6px' }}>●</span>}
                          {message.sender_details?.full_name || message.sender_details?.username || 'Unknown'}
                        </div>
                        <div style={{ 
                          fontSize: '14px',
                          color: '#666',
                          marginBottom: '2px'
                        }}>
                          {message.subject}
                        </div>
                        <div style={{ 
                          fontSize: '12px',
                          color: '#999',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {message.body.substring(0, 50)}...
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '11px',
                        color: '#999',
                        whiteSpace: 'nowrap',
                        marginLeft: '12px'
                      }}>
                        {new Date(message.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#999'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                <p>No messages yet</p>
                <Link to="/messaging/compose" className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Send a Message
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Announcements Card */}
        <div className="dashboard-card announcements-panel">
          <div className="card-header">
            <h3>📢 Latest Announcements</h3>
            <Link to="/messaging/announcements" className="edit-link">
              View All →
            </Link>
          </div>
          <div className="card-body">
            {recentAnnouncements.length > 0 ? (
              <>
                {recentAnnouncements.map((announcement) => {
                  const getPriorityColor = (priority) => {
                    switch (priority?.toLowerCase()) {
                      case 'urgent': return '#FF6B6B';
                      case 'high': return '#FFA94D';
                      case 'normal': return '#4DABF7';
                      case 'low': return '#A3BE8C';
                      default: return '#4DABF7';
                    }
                  };
                  
                  const getPriorityIcon = (priority) => {
                    switch (priority?.toLowerCase()) {
                      case 'urgent': return '⚠️';
                      case 'high': return '📢';
                      case 'normal': return 'ℹ️';
                      case 'low': return '📌';
                      default: return 'ℹ️';
                    }
                  };

                  return (
                    <div 
                      key={announcement.id}
                      className="announcement-item"
                      style={{
                        padding: '14px',
                        marginBottom: '10px',
                        borderRadius: '10px',
                        backgroundColor: '#fff',
                        border: `2px solid ${getPriorityColor(announcement.priority)}`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.location.href = '/messaging/announcements'}
                    >
                      <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                        <div style={{ 
                          fontSize: '24px',
                          marginTop: '2px'
                        }}>
                          {getPriorityIcon(announcement.priority)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '6px'
                          }}>
                            <h4 style={{ 
                              margin: 0,
                              fontSize: '15px',
                              fontWeight: '600',
                              color: '#333'
                            }}>
                              {announcement.title}
                            </h4>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              backgroundColor: getPriorityColor(announcement.priority),
                              color: 'white',
                              whiteSpace: 'nowrap',
                              marginLeft: '8px'
                            }}>
                              {announcement.priority}
                            </span>
                          </div>
                          <p style={{ 
                            margin: '0 0 8px 0',
                            fontSize: '13px',
                            color: '#666',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {announcement.content}
                          </p>
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '11px',
                            color: '#999'
                          }}>
                            <span>
                              By {announcement.sender_details?.full_name || announcement.sender_details?.username || 'HR'}
                            </span>
                            <span>
                              {new Date(announcement.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#999'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📢</div>
                <p>No announcements yet</p>
                {user?.role === 'HR' && (
                  <Link to="/messaging/announcements/manage" className="btn btn-primary" style={{ marginTop: '12px' }}>
                    Create Announcement
                  </Link>
                )}
              </div>
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
              <span className="info-value">{profile?.employee_id || `EMP${profile?.id || '000'}`}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{profile?.email || 'Not provided'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone</span>
              <span className="info-value">{profile?.phone_number || 'Not provided'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Department</span>
              <span className="info-value">{profile?.department || 'Unassigned'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Hire Date</span>
              <span className="info-value">
                {profile?.hire_date ? new Date(profile.hire_date).toLocaleDateString() : 'Not set'}
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
