import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { getParkingAreaById, getSlotsByArea, getVehiclesByUser, createReservation } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';

const SLOT_TYPE_ICONS = { CAR: '🚗', BIKE: '🏍️', TRUCK: '🚛' };

function ParkingSlotsPage() {
  const { areaId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [area, setArea] = useState(null);
  const [slots, setSlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [reserving, setReserving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');


  const loadData = useCallback(async () => {
    try {
      const [areaRes, slotsRes, vehiclesRes] = await Promise.all([
        getParkingAreaById(areaId),
        getSlotsByArea(areaId),
        getVehiclesByUser(user.id),
      ]);
      setArea(areaRes.data);
      setSlots(slotsRes.data);
      setVehicles(vehiclesRes.data);
    } catch {
      setError('Failed to load parking data.');
    } finally {
      setLoading(false);
    }
  }, [areaId, user.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSlotClick = (slot) => {
    if (slot.status !== 'AVAILABLE') return;
    setSelectedSlot(slot);
    const matching = vehicles.find(vehicle => vehicle.vehicleType === slot.slotType);
    setSelectedVehicle(matching ? String(matching.id) : '');
    setError('');
  };

  const handleReserve = async () => {
    if (!selectedVehicle) {
      setError('Please select a vehicle.');
      return;
    }
    if (vehicles.length === 0) {
      setError('Please add a vehicle first before reserving.');
      return;
    }

    setReserving(true);
    setError('');
    try {
      await createReservation({
        userId: user.id,
        vehicleId: parseInt(selectedVehicle),
        parkingSlotId: selectedSlot.id,
      });
      setSuccess(`Slot ${selectedSlot.slotNumber} reserved successfully! Go to Reservations to view it.`);
      setSelectedSlot(null);
      loadData(); // Refresh slots to show updated status
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reserve slot.');
    } finally {
      setReserving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading parking slots..." />;

  const availableCount = slots.filter(s => s.status === 'AVAILABLE').length;
  const reservedCount = slots.filter(s => s.status === 'RESERVED').length;
  const occupiedCount = slots.filter(s => s.status === 'OCCUPIED').length;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/parking-areas')}
          style={{ marginBottom: '12px' }}
        >
          ← Back to Areas
        </button>
        <h1>🅿️ {area?.name}</h1>
        <p>📍 {area?.location} • 💰 ₹{area?.pricePerHour}/hour</p>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Slot Counts */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon green">✅</div>
          <div className="stat-info"><div className="stat-value">{availableCount}</div><div className="stat-label">Available</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon orange">🟡</div>
          <div className="stat-info"><div className="stat-value">{reservedCount}</div><div className="stat-label">Reserved</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon red">🔴</div>
          <div className="stat-info"><div className="stat-value">{occupiedCount}</div><div className="stat-label">Occupied</div></div>
        </div>
      </div>

      <div className="card">
        {/* Slot Legend */}
        <div className="slot-legend">
          <div className="legend-item"><div className="legend-dot available"></div>Available (Click to Reserve)</div>
          <div className="legend-item"><div className="legend-dot reserved"></div>Reserved</div>
          <div className="legend-item"><div className="legend-dot occupied"></div>Occupied</div>
        </div>

        {/* Visual Slot Grid */}
        <div className="slot-grid">
          {slots.map(slot => (
            <div
              key={slot.id}
              className={`parking-slot ${slot.status.toLowerCase()}`}
              role="button"
              tabIndex={slot.status === 'AVAILABLE' ? 0 : -1}
              aria-disabled={slot.status !== 'AVAILABLE'}
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleSlotClick(slot); } }}
              onClick={() => handleSlotClick(slot)}
              title={slot.status === 'AVAILABLE' ? `Click to reserve ${slot.slotNumber}` : `${slot.slotNumber} is ${slot.status}`}
            >
              <div className="slot-icon">{SLOT_TYPE_ICONS[slot.slotType] || '🚗'}</div>
              <div className="slot-number">{slot.slotNumber}</div>
              <div className="slot-status-text">{slot.status}</div>
            </div>
          ))}
        </div>

        {slots.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🅿️</div>
            <h3>No slots configured</h3>
            <p>Admin needs to add parking slots to this area</p>
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {selectedSlot && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">🅿️ Reserve Slot {selectedSlot.slotNumber}</h3>
              <button className="modal-close" onClick={() => setSelectedSlot(null)}>×</button>
            </div>

            {/* Slot Info */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.875rem' }}>
                <div><strong>Slot:</strong> {selectedSlot.slotNumber}</div>
                <div><strong>Type:</strong> {selectedSlot.slotType}</div>
                <div><strong>Rate:</strong> ₹{area?.pricePerHour}/hr</div>
              </div>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            {vehicles.length === 0 ? (
              <div className="alert alert-warning">
                ⚠️ You have no registered vehicles.{' '}
                <a href="/vehicles" style={{ color: 'var(--primary)' }}>Add a vehicle first</a>.
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Select Vehicle *</label>
                <select className="form-select" value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
                  {vehicles.filter(v => v.vehicleType === selectedSlot.slotType).map(v => (
                    <option key={v.id} value={v.id}>{v.vehicleNumber} ({v.vehicleType})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedSlot(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleReserve}
                disabled={reserving || vehicles.length === 0}
              >
                {reserving ? '⏳ Reserving...' : '✅ Confirm Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParkingSlotsPage;
