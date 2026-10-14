import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { getParkingHistory } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

function ParkingHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);


  const loadHistory = useCallback(async () => {
    try {
      const res = await getParkingHistory(user.id);
      setHistory(res.data);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const formatDuration = (minutes) => {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const completedSessions = history.filter(h => h.status === 'COMPLETED');
  const totalAmount = completedSessions.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalMinutes = completedSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

  if (loading) return <LoadingSpinner message="Loading parking history..." />;

  return (
    <div>
      <div className="page-header">
        <h1>📜 Parking History</h1>
        <p>Your complete parking session records</p>
      </div>

      {/* Summary Stats */}
      {completedSessions.length > 0 && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-icon blue">📊</div>
            <div className="stat-info">
              <div className="stat-value">{completedSessions.length}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon teal">⏱️</div>
            <div className="stat-info">
              <div className="stat-value">{formatDuration(totalMinutes)}</div>
              <div className="stat-label">Total Time Parked</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">💰</div>
            <div className="stat-info">
              <div className="stat-value">₹{totalAmount.toFixed(2)}</div>
              <div className="stat-label">Total Paid</div>
            </div>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📜</div>
            <h3>No parking history</h3>
            <p>Your completed parking sessions will appear here</p>
            <Link to="/parking-areas" className="btn btn-primary">🅿️ Find Parking</Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Slot</th>
                  <th>Area</th>
                  <th>Vehicle</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>#{s.id}</td>
                    <td><strong>{s.parkingSlot?.slotNumber}</strong></td>
                    <td style={{ fontSize: '0.8rem' }}>{s.parkingSlot?.parkingArea?.name}</td>
                    <td>{s.vehicle?.vehicleNumber}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(s.entryTime).toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {s.exitTime ? new Date(s.exitTime).toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="history-duration">{formatDuration(s.durationMinutes)}</td>
                    <td className="history-amount">
                      {s.totalAmount ? `₹${s.totalAmount.toFixed(2)}` : '—'}
                    </td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParkingHistoryPage;
