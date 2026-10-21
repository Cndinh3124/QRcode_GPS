import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

import Login from '../features/auth/pages/Login';

import Dashboard from '../features/dashboard/pages/Dashboard';
import Users from '../features/users/pages/Users';
import Events from '../features/events/pages/Events';
import Attendance from '../features/attendance/pages/Attendance';
import ParticipantsPage from '../features/attendance/pages/ParticipantsPage';
import Reports from '../features/reports/pages/Reports';
import Settings from '../features/settings/pages/Settings';
import AiFraudDashboard from '../features/ai-fraud/pages/AiFraudDashboard';

import CheckIn from '../features/checkin/pages/CheckIn';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/check-in/:qrToken"
          element={<CheckIn />}
        />

        {/* =====================================================
            PROTECTED ADMIN ROUTES
        ===================================================== */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >

          {/* Root -> Dashboard */}

          <Route
            index
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* Dashboard */}

          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          {/* Users */}

          <Route
            path="users"
            element={<Users />}
          />

          {/* Events */}

          <Route
            path="events"
            element={<Events />}
          />

          {/* Event Participants */}

          <Route
            path="events/:id/participants"
            element={<ParticipantsPage />}
          />

          {/* Attendance */}

          <Route
            path="attendance"
            element={<Attendance />}
          />

          {/* Reports */}

          <Route
            path="reports"
            element={<Reports />}
          />

          <Route
            path="ai-fraud"
            element={<AiFraudDashboard />}
          />

          {/* Settings */}

          <Route
            path="settings"
            element={<Settings />}
          />

        </Route>

        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
