import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { getReservationsByUser, cancelReservation, recordEntry } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

function ReservationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');


  const loadReservations = useCallback(async () => {
    try {
      const res = await getReservationsByUser(user.id);
      setReservations(res.data);
    } catch {
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadReservations(); }, [loadReservations]);

  const handleRecordEntry = async (reservation) => {
    setActionLoading(reservation.id);
    setError('');
    try {
      await recordEntry({
        userId: user.id,
        vehicleId: reservation.vehicle.id,
        parkingSlotId: reservation.parkingSlot.id,
        reservationId: reservation.id,
      });
      setSuccess(`Vehicle entry recorded for slot ${reservation.parkingSlot.slotNumber}! Session is now active.`);
      setTimeout(() => { navigate('/active-session'); }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record entry.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (reservation) => {
    if (!window.confirm(`Cancel reservation for slot ${reservation.parkingSlot?.slotNumber}?`)) return;
    setActionLoading(reservation.id);
    try {
      await cancelReservation(reservation.id);
      setSuccess('Reservation cancelled.');
      loadReservations();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel reservation.');
    } finally {
      setActionLoading(null);
    }
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) return <LoadingSpinner message="Loading reservations..." />;

  return (
    <div>
      <div className="page-header">
        <h1>📋 My Reservations</h1>
        <p>View and manage your parking slot reservations</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {reservations.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No reservations found</h3>
            <p>Reserve a parking slot from the Parking Areas page</p>
            <button className="btn btn-primary" onClick={() => navigate('/parking-areas')}>
              🅿️ Find Parking
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Parking Slot</th>
                  <th>Area</th>
                  <th>Vehicle</th>
                  <th>Reserved At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text-secondary)' }}>#{r.id}</td>
                    <td><strong>{r.parkingSlot?.slotNumber}</strong></td>
                    <td>{r.parkingSlot?.parkingArea?.name || '—'}</td>
                    <td>{r.vehicle?.vehicleNumber}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(r.reservationTime).toLocaleString('en-IN')}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      {r.status === 'ACTIVE' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleRecordEntry(r)}
                            disabled={actionLoading === r.id}
                          >
                            {actionLoading === r.id ? '⏳' : '🚗'} Entry
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancel(r)}
                            disabled={actionLoading === r.id}
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="alert alert-info" style={{ marginTop: '16px' }}>
        💡 <strong>Workflow:</strong> Reserve a slot → Click "Entry" when your vehicle arrives → Session starts → Click "Exit" in Active Session to complete
      </div>
    </div>
  );
}

export default ReservationsPage;
