import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import FirstTimePasswordChange from '../pages/auth/FirstTimePasswordChange';

// Dashboard
import Dashboard from '../pages/Dashboard';

// Employee pages
import EmployeeList from '../pages/employees/EmployeeList';
import AddEmployee from '../pages/employees/AddEmployee';
import EditEmployee from '../pages/employees/EditEmployee';
import TrainingPortal from '../pages/training/TrainingPortal';
import PeerReview from '../pages/training/PeerReview';
import MyPerformanceReport from '../pages/performance/MyPerformanceReport';

// Leave pages
import LeaveList from '../pages/leaves/LeaveList';
import ApplyLeave from '../pages/leaves/ApplyLeave';
import ManageLeave from '../pages/leaves/ManageLeave';

// Attendance pages
import AttendanceList from '../pages/attendance/AttendanceList';
import MarkAttendance from '../pages/attendance/MarkAttendance';

// Profile page
import Profile from '../pages/profile/Profile';

// Messaging pages
import Inbox from '../pages/messaging/Inbox';
import ComposeMessage from '../pages/messaging/ComposeMessage';
import MessageView from '../pages/messaging/MessageView';
import SentMessages from '../pages/messaging/SentMessages';
import ManageAnnouncements from '../pages/messaging/ManageAnnouncements';
import Announcements from '../pages/messaging/Announcements';

// HR management pages
import RecruitmentManagement from '../pages/hr/RecruitmentManagement';
import TrainingDevelopment from '../pages/hr/TrainingDevelopment';
import PerformanceManagement from '../pages/hr/PerformanceManagement';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Force password change for users with temporary passwords
  // Allow access only to first-time-password-change page
  if (user.must_change_password && window.location.pathname !== '/first-time-password-change') {
    return <Navigate to="/first-time-password-change" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route path="/register" element={<Register />} />
      <Route
        path="/first-time-password-change"
        element={
          <ProtectedRoute>
            <FirstTimePasswordChange />
          </ProtectedRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Employee routes */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <EmployeeList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/add"
        element={
          <ProtectedRoute requiredRole="HR">
            <AddEmployee />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/edit/:id"
        element={
          <ProtectedRoute requiredRole="HR">
            <EditEmployee />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/training"
        element={
          <ProtectedRoute>
            <TrainingPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/peer-reviews"
        element={
          <ProtectedRoute>
            <PeerReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/performance-report"
        element={
          <ProtectedRoute>
            <MyPerformanceReport />
          </ProtectedRoute>
        }
      />

      {/* Leave routes */}
      <Route
        path="/leaves"
        element={
          <ProtectedRoute>
            <LeaveList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaves/apply"
        element={
          <ProtectedRoute>
            <ApplyLeave />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaves/manage"
        element={
          <ProtectedRoute requiredRole="HR">
            <ManageLeave />
          </ProtectedRoute>
        }
      />

      {/* Attendance routes */}
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <AttendanceList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/mark"
        element={
          <ProtectedRoute>
            <MarkAttendance />
          </ProtectedRoute>
        }
      />

      {/* Profile route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Messaging routes */}
      <Route
        path="/messaging"
        element={
          <ProtectedRoute>
            <Inbox />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messaging/compose"
        element={
          <ProtectedRoute>
            <ComposeMessage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messaging/view/:id"
        element={
          <ProtectedRoute>
            <MessageView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messaging/sent"
        element={
          <ProtectedRoute>
            <SentMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messaging/announcements/manage"
        element={
          <ProtectedRoute requiredRole="HR">
            <ManageAnnouncements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messaging/announcements"
        element={
          <ProtectedRoute>
            <Announcements />
          </ProtectedRoute>
        }
      />

      {/* HR Management routes */}
      <Route
        path="/hr/recruitment"
        element={
          <ProtectedRoute requiredRole="HR">
            <RecruitmentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/training"
        element={
          <ProtectedRoute requiredRole="HR">
            <TrainingDevelopment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/performance"
        element={
          <ProtectedRoute requiredRole="HR">
            <PerformanceManagement />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
