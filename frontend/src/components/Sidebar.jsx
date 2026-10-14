import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

/**
 * Sidebar - Navigation component that stays fixed on the left side.
 *
 * - Shows different menu items for USER vs ADMIN
 * - Highlights the currently active page
 * - Shows logged-in user info at the bottom
 * - Has a logout button
 */
function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Navigation items for regular users
  const userNavItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/vehicles', icon: '🚗', label: 'My Vehicles' },
    { path: '/parking-areas', icon: '🅿️', label: 'Parking Areas' },
    { path: '/reservations', icon: '📋', label: 'Reservations' },
    { path: '/active-session', icon: '🔵', label: 'Active Session' },
    { path: '/history', icon: '📜', label: 'Parking History' },
  ];

  // Navigation items for admin
  const adminNavItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/vehicles', icon: '🚗', label: 'Vehicles' },
    { path: '/admin/parking-areas', icon: '🏗️', label: 'Parking Areas' },
    { path: '/admin/slots', icon: '🅿️', label: 'Parking Slots' },
    { path: '/admin/reservations', icon: '📋', label: 'Reservations' },
    { path: '/admin/sessions', icon: '🔴', label: 'Active Sessions' },
    { path: '/admin/transactions', icon: '💰', label: 'Transactions' },
  ];

  const navItems = isAdmin() ? adminNavItems : userNavItems;

  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <span className="logo-icon">🅿️</span>
        <h2>Smart <span>Parking</span><br />Management System</h2>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">
          {isAdmin() ? 'Admin Menu' : 'Main Menu'}
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Info and Logout */}
      <div className="sidebar-user">
        <div className="user-name">{user?.name}</div>
        <div className="user-role">{user?.role}</div>
        <button className="sidebar-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
