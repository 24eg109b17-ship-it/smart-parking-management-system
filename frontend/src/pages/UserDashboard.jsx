import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { getVehiclesByUser, getReservationsByUser, getActiveSession, getParkingHistory } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

function UserDashboard() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);


  const loadDashboardData = useCallback(async () => {
    try {
      // Load all data in parallel for better performance
      const [vehiclesRes, reservationsRes, historyRes] = await Promise.all([
        getVehiclesByUser(user.id),
        getReservationsByUser(user.id),
        getParkingHistory(user.id),
      ]);

      setVehicles(vehiclesRes.data);
      setReservations(reservationsRes.data);
      setHistory(historyRes.data);

      // Load active session (may return 404 if no active session)
      try {
        const sessionRes = await getActiveSession(user.id);
        setActiveSession(sessionRes.data);
      } catch {
        setActiveSession(null);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  const activeReservations = reservations.filter(r => r.status === 'ACTIVE');
  const [todayDate] = useState(() => new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>👋 Welcome, {user?.name}!</h1>
        <p>{todayDate}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon blue">🚗</div>
          <div className="stat-info">
            <div className="stat-value">{vehicles.length}</div>
            <div className="stat-label">My Vehicles</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">📋</div>
          <div className="stat-info">
            <div className="stat-value">{activeReservations.length}</div>
            <div className="stat-label">Active Reservations</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: activeSession ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)', color: activeSession ? 'var(--success)' : 'var(--secondary)' }}>
            {activeSession ? '🟢' : '⚫'}
          </div>
          <div className="stat-info">
            <div className="stat-value">{activeSession ? 'Active' : 'None'}</div>
            <div className="stat-label">Current Session</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📜</div>
          <div className="stat-info">
            <div className="stat-value">{history.filter(h => h.status === 'COMPLETED').length}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
        </div>
      </div>

      {/* Active Session Card */}
      {activeSession && (
        <div className="session-card" style={{ marginBottom: '24px' }}>
          <div className="session-card-header">
            <div>
              <h3 style={{ color: 'white', marginBottom: '4px' }}>🟢 Active Parking Session</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>Your vehicle is currently parked</p>
            </div>
            <Link to="/active-session" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              View Session →
            </Link>
          </div>
          <div className="session-info-grid">
            <div className="session-info-item">
              <div className="label">Parking Slot</div>
              <div className="value">{activeSession.parkingSlot?.slotNumber}</div>
            </div>
            <div className="session-info-item">
              <div className="label">Vehicle</div>
              <div className="value">{activeSession.vehicle?.vehicleNumber}</div>
            </div>
            <div className="session-info-item">
              <div className="label">Entry Time</div>
              <div className="value">{new Date(activeSession.entryTime).toLocaleTimeString('en-IN')}</div>
            </div>
            <div className="session-info-item">
              <div className="label">Price/Hour</div>
              <div className="value">₹{activeSession.parkingSlot?.parkingArea?.pricePerHour}/hr</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <Link to="/parking-areas" className="card" style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s' }}
          onMouseOver={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'}
          onMouseOut={e => e.currentTarget.style.boxShadow = ''}>
          <div style={{ fontSize: '2.5rem' }}>🅿️</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>Find Parking</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Browse available parking areas</div>
          </div>
        </Link>
        <Link to="/vehicles" className="card" style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '2.5rem' }}>🚗</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>My Vehicles</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage your registered vehicles</div>
          </div>
        </Link>
      </div>

      {/* Recent Reservations */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">📋 Recent Reservations</h3>
          <Link to="/reservations" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        {reservations.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <div className="empty-state-icon">📋</div>
            <h3>No reservations yet</h3>
            <p>Reserve a parking slot to get started</p>
            <Link to="/parking-areas" className="btn btn-primary btn-sm">Find Parking</Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>Vehicle</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.slice(0, 5).map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.parkingSlot?.slotNumber}</strong></td>
                    <td>{r.vehicle?.vehicleNumber}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(r.reservationTime).toLocaleString('en-IN')}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Parking History */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📜 Recent Parking History</h3>
          <Link to="/history" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        {history.filter(h => h.status === 'COMPLETED').length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <div className="empty-state-icon">📜</div>
            <h3>No parking history</h3>
            <p>Completed sessions will appear here</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>Vehicle</th>
                  <th>Duration</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {history.filter(h => h.status === 'COMPLETED').slice(0, 5).map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.parkingSlot?.slotNumber}</strong></td>
                    <td>{s.vehicle?.vehicleNumber}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {s.durationMinutes ? `${Math.floor(s.durationMinutes / 60)}h ${s.durationMinutes % 60}m` : '-'}
                    </td>
                    <td className="history-amount">₹{s.totalAmount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
