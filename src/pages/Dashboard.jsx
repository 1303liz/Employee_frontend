import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import employeeService from '../services/employeeService';
import leaveService from '../services/leaveService';
import attendanceService from '../services/attendanceService';
import profileService from '../services/profileService';
import messagingService from '../services/messagingService';
import hrService from '../services/hrService';
import Loader from '../components/Loader';

const getArrayData = (response) => (Array.isArray(response) ? response : (response?.results || response?.data || []));

const buildLastSevenDaysTrend = (items, getDate, matcher = () => true) => {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
  return days.map((day) => {
    const total = items.filter((item) => {
      const itemDate = new Date(getDate(item));
      itemDate.setHours(0, 0, 0, 0);
      return matcher(item) && itemDate.getTime() === day.getTime();
    }).length;
    return { label: day.toLocaleDateString('en-US', { weekday: 'short' }), value: total };
  });
};

const buildLastSixMonthsTrend = (items, getDate, matcher = () => true) => {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return date;
  });
  return months.map((monthDate) => {
    const total = items.filter((item) => {
      const itemDate = new Date(getDate(item));
      return matcher(item)
        && itemDate.getFullYear() === monthDate.getFullYear()
        && itemDate.getMonth() === monthDate.getMonth();
    }).length;
    return { label: monthDate.toLocaleDateString('en-US', { month: 'short' }), value: total };
  });
};

const compareLatestPeriods = (trend) => {
  if (!trend || trend.length < 2) return { value: 0, direction: 'flat' };
  const current = trend[trend.length - 1]?.value || 0;
  const previous = trend[trend.length - 2]?.value || 0;
  const delta = current - previous;
  return { value: delta, direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat' };
};

const renderTrendDelta = (delta) => {
  if (delta.direction === 'up') return `+${delta.value}`;
  if (delta.direction === 'down') return `${delta.value}`;
  return '0';
};

const getTimeGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'HR';
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalEmployees: 0, pendingLeaves: 0, todayAttendance: 0 });
  const [trendCharts, setTrendCharts] = useState({ attendance: [], approvals: [], messages: [] });
  const [executiveMetrics, setExecutiveMetrics] = useState([]);
  const [hrInsights, setHrInsights] = useState({ pendingTrainingApprovals: 0 });
  const [employeeInsights, setEmployeeInsights] = useState({
    pendingTrainingApplications: 0,
    receivedPeerReviews: 0,
    latestReportStatus: 'No report yet',
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
        messagingService.getInbox(),
      ]);
      const messages = getArrayData(inboxData);
      const messageTrend = buildLastSevenDaysTrend(messages, (m) => m.created_at);
      setUnreadMessages(unreadData.count || 0);
      setRecentMessages(messages.slice(0, 5));
      setTrendCharts((prev) => ({ ...prev, messages: messageTrend }));
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await messagingService.getActiveAnnouncements();
      const announcements = getArrayData(response);
      setRecentAnnouncements(announcements.slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch announcements', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'HR') {
        const [employeesData, leavesData, attendanceData, trainingApplicationsData] = await Promise.all([
          employeeService.getAllEmployees(),
          leaveService.getAllLeaves(),
          attendanceService.getAllAttendance(),
          hrService.getAllTrainingApplications({ status: 'PENDING' }),
        ]);

        const employees = getArrayData(employeesData);
        const leaves = getArrayData(leavesData);
        const attendance = getArrayData(attendanceData);
        const pendingTrainingApprovals = getArrayData(trainingApplicationsData).length;
        const todaysAttendance = attendance.filter(
          (record) => new Date(record.date).toDateString() === new Date().toDateString()
        ).length;
        const attendanceRate = employees.length > 0
          ? Math.round((todaysAttendance / employees.length) * 100)
          : 0;

        const attendanceTrend = buildLastSevenDaysTrend(attendance, (r) => r.date);
        const approvalsTrend = buildLastSixMonthsTrend(
          leaves,
          (l) => l.approved_on || l.applied_on || l.start_date,
          (l) => l.status === 'APPROVED'
        );
        const attendanceDelta = compareLatestPeriods(attendanceTrend);
        const approvalDelta = compareLatestPeriods(approvalsTrend);

        setStats({
          totalEmployees: employees.length,
          pendingLeaves: leaves.filter((l) => l.status === 'PENDING').length,
          todayAttendance: todaysAttendance,
        });
        setTrendCharts((prev) => ({ ...prev, attendance: attendanceTrend, approvals: approvalsTrend }));
        setExecutiveMetrics([
          {
            label: 'Attendance Coverage',
            value: `${attendanceRate}%`,
            meta: `${todaysAttendance} checked in today`,
            delta: renderTrendDelta(attendanceDelta),
            tone: attendanceDelta.direction,
          },
          {
            label: 'Approved Leave Trend',
            value: approvalsTrend[approvalsTrend.length - 1]?.value || 0,
            meta: 'Approved this month',
            delta: renderTrendDelta(approvalDelta),
            tone: approvalDelta.direction,
          },
          {
            label: 'Workforce Load',
            value: employees.length,
            meta: `${leaves.filter((l) => l.status === 'PENDING').length} pending requests`,
            delta: '—',
            tone: 'flat',
          },
        ]);
        setHrInsights({ pendingTrainingApprovals });
      } else {
        const report = await hrService.getMyPerformanceReport();
        const pendingTrainingApplications = (report?.training_applications || []).filter(
          (application) => application.status === 'PENDING'
        ).length;
        const latestReportStatus = report?.latest_review?.status
          || (report?.summary?.total_reviews > 0 ? 'Available' : 'No report yet');

        setEmployeeInsights({
          pendingTrainingApplications,
          receivedPeerReviews: report?.summary?.peer_evaluations_received || 0,
          latestReportStatus,
        });
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const overviewCards = isHR
    ? [
        { label: 'Total Employees', value: stats.totalEmployees, note: 'Active workforce', tone: 'blue', badge: 'EM' },
        { label: 'Pending Leaves', value: stats.pendingLeaves, note: 'Awaiting action', tone: 'orange', badge: 'LV' },
        {
          label: 'Training Approvals',
          value: hrInsights.pendingTrainingApprovals,
          note: 'Applications waiting for review',
          tone: 'purple',
          badge: 'TA',
        },
        { label: "Today's Attendance", value: stats.todayAttendance, note: 'Checked in today', tone: 'green', badge: 'AT' },
        {
          label: 'Attendance Rate',
          value: `${stats.totalEmployees > 0 ? Math.round((stats.todayAttendance / stats.totalEmployees) * 100) : 0}%`,
          note: 'Today across the team',
          tone: 'slate',
          badge: 'RT',
        },
      ]
    : [
        { label: 'Unread Messages', value: unreadMessages, note: 'Messages waiting', tone: 'blue', badge: 'MS' },
        {
          label: 'Pending Trainings',
          value: employeeInsights.pendingTrainingApplications,
          note: 'Applications awaiting HR review',
          tone: 'orange',
          badge: 'TR',
        },
        {
          label: 'Peer Reviews',
          value: employeeInsights.receivedPeerReviews,
          note: 'Evaluations received from colleagues',
          tone: 'green',
          badge: 'PR',
        },
        {
          label: 'Report Status',
          value: employeeInsights.latestReportStatus,
          note: 'Latest HR performance report',
          tone: 'slate',
          badge: 'RP',
        },
      ];

  const focusItems = isHR
    ? [
        { label: 'Pending approvals', value: stats.pendingLeaves, note: 'Leave requests to review' },
        { label: 'Pending training approvals', value: hrInsights.pendingTrainingApprovals, note: 'Training applications to approve or reject' },
        { label: 'Announcements live', value: recentAnnouncements.length, note: 'Visible to staff' },
      ]
    : [
        { label: 'Pending training applications', value: employeeInsights.pendingTrainingApplications, note: 'Awaiting HR review' },
        { label: 'Peer reviews received', value: employeeInsights.receivedPeerReviews, note: 'Recent colleague feedback' },
        { label: 'Latest report status', value: employeeInsights.latestReportStatus, note: 'Current performance review visibility' },
      ];

  const shortcutLinks = isHR
    ? [
        { to: '/leaves/manage', title: 'Review Leaves', meta: 'Approve or reject requests', badge: 'LV', color: 'db-icon-green' },
        { to: '/hr/recruitment', title: 'Recruitment', meta: 'Screening and shortlisting', badge: 'RC', color: 'db-icon-blue' },
        {
          to: '/hr/training',
          title: 'Training Approvals',
          meta: 'Review and process applications',
          badge: 'TA',
          color: 'db-icon-teal',
          notify: hrInsights.pendingTrainingApprovals,
        },
        { to: '/hr/performance', title: 'Performance', meta: '360 reviews and feedback', badge: 'PR', color: 'db-icon-indigo' },
      ]
    : [
        { to: '/employees/training', title: 'Training Portal', meta: 'Apply for HR-posted trainings', badge: 'TD', color: 'db-icon-teal' },
        { to: '/employees/peer-reviews', title: 'Peer Reviews', meta: 'Review colleagues and see received feedback', badge: 'PR', color: 'db-icon-indigo' },
        { to: '/employees/performance-report', title: 'Performance Report', meta: 'Review and download HR reports', badge: 'RP', color: 'db-icon-orange' },
      ];

  const chartCards = [
    { title: 'Attendance Activity', meta: 'Last 7 days', badge: 'AT', bars: trendCharts.attendance },
    { title: 'Leave Approvals', meta: 'Last 6 months', badge: 'LV', bars: trendCharts.approvals },
    { title: 'Message Activity', meta: 'Last 7 days', badge: 'MS', bars: trendCharts.messages },
  ];

  const actionDefs = [
    { to: '/attendance/mark', label: 'Attendance', badge: 'AT', color: 'db-icon-blue' },
    { to: '/leaves/apply', label: 'Apply Leave', badge: 'LV', color: 'db-icon-green' },
    { to: '/messaging/announcements', label: 'Notices', badge: 'AN', color: 'db-icon-orange' },
    ...(isHR ? [
      { to: '/employees/add', label: 'Add Employee', badge: 'EM', color: 'db-icon-purple' },
      { to: '/leaves/manage', label: 'Manage Leaves', badge: 'AP', color: 'db-icon-orange' },
      { to: '/messaging/announcements/manage', label: 'Post Notice', badge: 'CM', color: 'db-icon-red' },
      { to: '/hr/recruitment', label: 'Recruitment', badge: 'RC', color: 'db-icon-blue' },
      {
        to: '/hr/training',
        label: 'Training',
        badge: 'TD',
        color: 'db-icon-teal',
        notify: hrInsights.pendingTrainingApprovals,
      },
      { to: '/hr/performance', label: 'Performance', badge: 'PR', color: 'db-icon-indigo' },
    ] : [
      { to: '/employees/training', label: 'Training', badge: 'TD', color: 'db-icon-teal' },
      { to: '/employees/peer-reviews', label: 'Peer Reviews', badge: 'PR', color: 'db-icon-indigo' },
      { to: '/employees/performance-report', label: 'Report', badge: 'RP', color: 'db-icon-orange' },
      { to: '/messaging', label: 'Messages', badge: 'MS', color: 'db-icon-blue' },
      { to: '/profile', label: 'My Profile', badge: 'ME', color: 'db-icon-slate' },
    ]),
  ];

  const buildActivityFeed = () => {
    const msgItems = recentMessages.slice(0, 4).map((m) => ({
      id: `msg-${m.id}`,
      type: 'message',
      title: m.subject || '(No subject)',
      sub: m.sender_details?.full_name || m.sender_details?.username || 'Unknown',
      date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      unread: !m.is_read,
      href: `/messaging/view/${m.id}`,
    }));
    const annItems = recentAnnouncements.slice(0, 3).map((a) => ({
      id: `ann-${a.id}`,
      type: 'announcement',
      title: a.title,
      sub: `By ${a.sender_details?.full_name || a.sender_details?.username || 'HR'} · ${a.priority || 'Normal'}`,
      date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      unread: false,
      href: '/messaging/announcements',
    }));
    return [...msgItems, ...annItems];
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-container">

      {/* ── Header Bar ──────────────────────────── */}
      <div className="db-header">
        <div className="db-header-greeting">
          <div className="db-avatar">
            {profile?.profile_photo_url ? (
              <img src={profile.profile_photo_url} alt="" />
            ) : (
              <div className="db-avatar-initials">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
            )}
          </div>
          <div className="db-greeting-text">
            <span className="db-time-greeting">{getTimeGreeting()}</span>
            <h1>{user?.first_name || user?.username}</h1>
            <span className={`db-role-pill${isHR ? ' db-role-hr' : ''}`}>
              {isHR ? 'HR Manager' : 'Employee'} &middot; {profile?.department || 'No dept'}
            </span>
          </div>
        </div>
        <div className="db-header-right">
          <div className="db-date-block">
            <span className="db-date-day">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
            <span className="db-date-full">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="db-status-dot" title="System online" />
        </div>
      </div>

      {/* ── KPI Stats ───────────────────────────── */}
      <div className="db-kpi-row">
        {overviewCards.map((card) => (
          <div key={card.label} className={`db-kpi-card db-kpi-${card.tone}`}>
            <span className="db-kpi-label">{card.label}</span>
            <span className="db-kpi-value">{card.value}</span>
            <span className="db-kpi-note">{card.note}</span>
          </div>
        ))}
      </div>

      {/* ── Executive Metrics (HR only) ──────────── */}
      {isHR && (
        <div className="db-exec-row">
          {executiveMetrics.map((metric) => (
            <div key={metric.label} className="db-exec-card">
              <span className="db-exec-label">{metric.label}</span>
              <span className="db-exec-value">{metric.value}</span>
              <span className="db-exec-meta">{metric.meta}</span>
              <em className={`db-exec-delta db-exec-delta-${metric.tone}`}>{metric.delta}</em>
            </div>
          ))}
        </div>
      )}

      {/* ── Main 2-Column Grid ───────────────────── */}
      <div className="db-main-grid">

        {/* Left: Activity Feed */}
        <div className="db-left-stack">
          <div className="db-panel">
            <div className="db-panel-header">
              <div>
                <span className="db-panel-kicker">Live Feed</span>
                <h3>Recent Activity</h3>
              </div>
              <Link to="/messaging" className="db-panel-link">
                View all {unreadMessages > 0 && `(${unreadMessages} new)`} &#8594;
              </Link>
            </div>
            <div className="db-panel-body">
              {(() => {
                const feed = buildActivityFeed();
                if (feed.length === 0) {
                  return (
                    <div className="db-empty">
                      <div className="db-empty-icon">MS</div>
                      <p>No recent activity</p>
                    </div>
                  );
                }
                return (
                  <div className="db-activity-list">
                    {feed.map((item) => (
                      <div
                        key={item.id}
                        className="db-activity-item"
                        onClick={() => { window.location.href = item.href; }}
                      >
                        <div className={`db-activity-dot${item.unread ? ' db-dot-unread' : item.type === 'announcement' ? ' db-dot-announcement' : ''}`} />
                        <div className="db-activity-content">
                          <div className="db-activity-title">{item.title}</div>
                          <div className="db-activity-sub">{item.sub}</div>
                        </div>
                        <div className="db-activity-right">
                          <span className={`db-activity-tag ${item.type === 'message' ? 'db-tag-msg' : 'db-tag-ann'}`}>
                            {item.type === 'message' ? 'MSG' : 'ANN'}
                          </span>
                          <span className="db-activity-meta">{item.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div className="db-focus-strip">
              {focusItems.map((item) => (
                <div key={item.label} className="db-focus-cell">
                  <div className="db-focus-badge">{item.value}</div>
                  <div className="db-focus-copy">
                    <strong>{item.label}</strong>
                    <span>{item.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions + Profile + Shortcuts */}
        <div className="db-right-stack">

          {/* Quick Actions */}
          <div className="db-panel">
            <div className="db-panel-header">
              <div>
                <span className="db-panel-kicker">Start Here</span>
                <h3>Quick Actions</h3>
              </div>
            </div>
            <div className="db-panel-body">
              <div className="db-actions-grid">
                {actionDefs.map((action) => (
                  <Link key={action.to} to={action.to} className="db-action-btn">
                    <div className={`db-action-icon ${action.color}`}>{action.badge}</div>
                    <span className="db-action-label">{action.label}</span>
                    {action.notify > 0 && <span className="db-action-notify">{action.notify}</span>}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="db-panel">
            <div className="db-panel-header">
              <div>
                <span className="db-panel-kicker">Account</span>
                <h3>Profile</h3>
              </div>
              <Link to="/profile" className="db-panel-link">Edit &#8594;</Link>
            </div>
            <div className="db-panel-body">
              <div className="db-profile-grid">
                <div className="db-profile-row">
                  <span className="db-profile-label">ID</span>
                  <span className="db-profile-value">{profile?.employee_id || `EMP${profile?.id || '000'}`}</span>
                </div>
                <div className="db-profile-row">
                  <span className="db-profile-label">Email</span>
                  <span className="db-profile-value db-profile-email">{profile?.email || '—'}</span>
                </div>
                <div className="db-profile-row">
                  <span className="db-profile-label">Department</span>
                  <span className="db-profile-value">{profile?.department || 'Unassigned'}</span>
                </div>
                <div className="db-profile-row">
                  <span className="db-profile-label">Hired</span>
                  <span className="db-profile-value">
                    {profile?.hire_date ? new Date(profile.hire_date).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="db-profile-row">
                  <span className="db-profile-label">Status</span>
                  <span className={`db-status-pill ${profile?.is_active ? 'db-status-active' : 'db-status-inactive'}`}>
                    &#9679; {profile?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shortcuts */}
          <div className="db-panel">
            <div className="db-panel-header">
              <div>
                <span className="db-panel-kicker">Navigate</span>
                <h3>Quick Links</h3>
              </div>
            </div>
            <div className="db-panel-body">
              <div className="db-shortcuts-list">
                {shortcutLinks.map((s) => (
                  <Link key={s.to} to={s.to} className="db-shortcut-link">
                    <div className={`db-shortcut-icon ${s.color}`}>{s.badge}</div>
                    <div className="db-shortcut-text">
                      <strong>{s.title}</strong>
                      <span>{s.meta}</span>
                    </div>
                    {s.notify > 0 && <span className="db-link-notify">{s.notify}</span>}
                    <span className="db-shortcut-arrow">&#8594;</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Charts Row ──────────────────────────── */}
      <div className="db-charts-row">
        {chartCards.map((chart) => {
          const maxVal = Math.max(...chart.bars.map((b) => b.value), 1);
          const barColor = chart.badge === 'AT'
            ? 'linear-gradient(180deg, #1d4ed8, #60a5fa)'
            : chart.badge === 'LV'
              ? 'linear-gradient(180deg, #047857, #34d399)'
              : 'linear-gradient(180deg, #334155, #94a3b8)';
          const iconColor = chart.badge === 'AT'
            ? 'db-icon-blue'
            : chart.badge === 'LV'
              ? 'db-icon-green'
              : 'db-icon-slate';
          return (
            <div key={chart.title} className="db-chart-card">
              <div className="db-chart-header">
                <div>
                  <div className="db-chart-title">{chart.title}</div>
                  <div className="db-chart-period">{chart.meta}</div>
                </div>
                <div className={`db-chart-badge2 ${iconColor}`}>{chart.badge}</div>
              </div>
              <div className="db-bar-chart">
                {chart.bars.map((bar) => (
                  <div key={`${chart.title}-${bar.label}`} className="db-bar-col">
                    <div
                      className="db-bar"
                      style={{
                        height: `${Math.max((bar.value / maxVal) * 100, bar.value > 0 ? 14 : 5)}%`,
                        background: barColor,
                      }}
                      title={`${bar.label}: ${bar.value}`}
                    />
                    <span className="db-bar-label">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Dashboard;
