import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Dashboard
import Dashboard from '../pages/Dashboard';

// Employee pages
import EmployeeList from '../pages/employees/EmployeeList';
import AddEmployee from '../pages/employees/AddEmployee';
import EditEmployee from '../pages/employees/EditEmployee';

// Leave pages
import LeaveList from '../pages/leaves/LeaveList';
import ApplyLeave from '../pages/leaves/ApplyLeave';
import ManageLeave from '../pages/leaves/ManageLeave';

// Attendance pages
import AttendanceList from '../pages/attendance/AttendanceList';
import MarkAttendance from '../pages/attendance/MarkAttendance';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
