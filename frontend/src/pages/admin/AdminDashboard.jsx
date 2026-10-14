import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/main.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(() => new Date());

  const fetchStats = useCallback(async () => {
    try {
      const res = await getDashboardStats();
      setError('');
      setStats(res.data);
      setLastRefresh(new Date());
    } catch {
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatRevenue = (amount) => {
    if (amount == null) return '₹0.00';
    return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const statCards = stats ? [
    { label: 'Total Users',         value: stats.totalUsers,         icon: '👥', color: 'blue'   },
    { label: 'Total Vehicles',      value: stats.totalVehicles,      icon: '🚗', color: 'teal'   },
    { label: 'Parking Areas',       value: stats.totalParkingAreas,  icon: '🏗️', color: 'purple' },
    { label: 'Total Slots',         value: stats.totalSlots,         icon: '🅿️', color: 'blue'   },
    { label: 'Available Slots',     value: stats.availableSlots,     icon: '✅', color: 'green'  },
    { label: 'Reserved Slots',      value: stats.reservedSlots,      icon: '🟡', color: 'orange' },
    { label: 'Occupied Slots',      value: stats.occupiedSlots,      icon: '🔴', color: 'red'    },
    { label: 'Active Sessions',     value: stats.activeSessions,     icon: '📊', color: 'blue'   },
    { label: 'Total Reservations',  value: stats.totalReservations,  icon: '📝', color: 'purple' },
    { label: 'Completed Sessions',  value: stats.completedSessions,  icon: '✅', color: 'green'  },
    { label: 'Total Revenue',       value: formatRevenue(stats.totalRevenue), icon: '💰', color: 'green'  },
    { label: 'System Status',       value: 'Operational',            icon: '🟢', color: 'green'  },
  ] : [];

  const quickNavCards = [
    { label: 'User Management',         icon: '👥', path: '/admin/users',         desc: 'View and manage registered users' },
    { label: 'Vehicle Management',      icon: '🚗', path: '/admin/vehicles',      desc: 'View all registered vehicles' },
    { label: 'Parking Areas',           icon: '🏗️', path: '/admin/parking-areas', desc: 'Add, edit and delete parking areas' },
    { label: 'Parking Slots',           icon: '🅿️', path: '/admin/slots',         desc: 'Manage individual parking slots' },
    { label: 'Reservations',            icon: '📝', path: '/admin/reservations',   desc: 'Monitor and manage reservations' },
    { label: 'Active Sessions',         icon: '📊', path: '/admin/sessions',       desc: 'View currently active parking sessions' },
    { label: 'Transaction History',     icon: '💰', path: '/admin/transactions',   desc: 'View completed sessions & revenue' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Overview of the Smart Parking Management System</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button className="btn btn-primary" onClick={fetchStats} disabled={loading}>
          🔄 {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error">⚠️ {error}</div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="stats-grid">
            {statCards.map((card) => (
              <div className="stat-card" key={card.label}>
                <div className={`stat-icon ${card.color}`}>{card.icon}</div>
                <div className="stat-info">
                  <div className="stat-value">{card.value ?? '—'}</div>
                  <div className="stat-label">{card.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Navigation */}
          <div className="card" style={{ marginTop: '8px' }}>
            <div className="card-header">
              <h2 className="card-title">Quick Navigation</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {quickNavCards.map((nav) => (
                <Link
                  key={nav.path}
                  to={nav.path}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,86,219,0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{nav.icon}</div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{nav.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{nav.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
