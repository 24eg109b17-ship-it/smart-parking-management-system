/**
 * App.jsx - Main Application with React Router configuration
 *
 * React Router manages navigation between pages.
 * Instead of a server sending different HTML pages, React swaps components
 * based on the URL (Single Page Application / SPA pattern).
 *
 * Route structure:
 * / (public)          → LandingPage
 * /login (public)     → LoginPage
 * /register (public)  → RegisterPage
 * /dashboard          → UserDashboard (protected - must be logged in)
 * /vehicles           → VehiclesPage (protected)
 * ...etc.
 */
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/auth';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// User Pages
import UserDashboard from './pages/UserDashboard';
import VehiclesPage from './pages/VehiclesPage';
import ParkingAreasPage from './pages/ParkingAreasPage';
import ParkingSlotsPage from './pages/ParkingSlotsPage';
import ReservationsPage from './pages/ReservationsPage';
import ActiveSessionPage from './pages/ActiveSessionPage';
import ParkingHistoryPage from './pages/ParkingHistoryPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVehicles from './pages/admin/AdminVehicles';
import AdminParkingAreas from './pages/admin/AdminParkingAreas';
import AdminSlots from './pages/admin/AdminSlots';
import AdminReservations from './pages/admin/AdminReservations';
import AdminSessions from './pages/admin/AdminSessions';
import AdminTransactions from './pages/admin/AdminTransactions';

// Layout component that wraps pages with Sidebar
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';

import './styles/main.css';

/**
 * ProtectedRoute - Redirects to login if user is not authenticated.
 * Used to protect pages that require login.
 */
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <LoadingSpinner message="Restoring your session…" />;

  if (!isLoggedIn()) {
    // Redirect to login page if not logged in
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * AdminRoute - Redirects to dashboard if user is not an admin.
 */
function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner message="Restoring your session…" />;

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * UserLayout - Wraps user pages with Sidebar.
 * The Sidebar stays fixed on the left, content is on the right.
 */
function UserLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

/**
 * Main App Component
 * Sets up all the routes for the application.
 */
function AppRoutes() {
  return (
    <Routes>
      {/* ===== PUBLIC ROUTES (no login required) ===== */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ===== USER ROUTES (login required) ===== */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <UserLayout><UserDashboard /></UserLayout>
        </ProtectedRoute>
      } />

      <Route path="/vehicles" element={
        <ProtectedRoute>
          <UserLayout><VehiclesPage /></UserLayout>
        </ProtectedRoute>
      } />

      <Route path="/parking-areas" element={
        <ProtectedRoute>
          <UserLayout><ParkingAreasPage /></UserLayout>
        </ProtectedRoute>
      } />

      <Route path="/parking-slots/:areaId" element={
        <ProtectedRoute>
          <UserLayout><ParkingSlotsPage /></UserLayout>
        </ProtectedRoute>
      } />

      <Route path="/reservations" element={
        <ProtectedRoute>
          <UserLayout><ReservationsPage /></UserLayout>
        </ProtectedRoute>
      } />

      <Route path="/active-session" element={
        <ProtectedRoute>
          <UserLayout><ActiveSessionPage /></UserLayout>
        </ProtectedRoute>
      } />

      <Route path="/history" element={
        <ProtectedRoute>
          <UserLayout><ParkingHistoryPage /></UserLayout>
        </ProtectedRoute>
      } />

      {/* ===== ADMIN ROUTES (admin role required) ===== */}
      <Route path="/admin/dashboard" element={
        <AdminRoute>
          <UserLayout><AdminDashboard /></UserLayout>
        </AdminRoute>
      } />

      <Route path="/admin/users" element={
        <AdminRoute>
          <UserLayout><AdminUsers /></UserLayout>
        </AdminRoute>
      } />

      <Route path="/admin/vehicles" element={
        <AdminRoute>
          <UserLayout><AdminVehicles /></UserLayout>
        </AdminRoute>
      } />

      <Route path="/admin/parking-areas" element={
        <AdminRoute>
          <UserLayout><AdminParkingAreas /></UserLayout>
        </AdminRoute>
      } />

      <Route path="/admin/slots" element={
        <AdminRoute>
          <UserLayout><AdminSlots /></UserLayout>
        </AdminRoute>
      } />

      <Route path="/admin/reservations" element={
        <AdminRoute>
          <UserLayout><AdminReservations /></UserLayout>
        </AdminRoute>
      } />

      <Route path="/admin/sessions" element={
        <AdminRoute>
          <UserLayout><AdminSessions /></UserLayout>
        </AdminRoute>
      } />

      <Route path="/admin/transactions" element={
        <AdminRoute>
          <UserLayout><AdminTransactions /></UserLayout>
        </AdminRoute>
      } />

      {/* Catch-all redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * App - Root component that wraps everything with AuthProvider and Router.
 *
 * AuthProvider makes user data available to all components.
 * Router enables navigation between pages.
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
