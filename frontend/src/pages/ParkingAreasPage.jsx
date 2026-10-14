import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllParkingAreas, getSlotsByArea } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';

function ParkingAreasPage() {
  const [areas, setAreas] = useState([]);
  const [slotCounts, setSlotCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const loadAreas = useCallback(async () => {
    try {
      const res = await getAllParkingAreas();
      const areasData = res.data;
      setAreas(areasData);

      // Load slot counts for each area
      const counts = {};
      await Promise.all(
        areasData.map(async (area) => {
          try {
            const slotsRes = await getSlotsByArea(area.id);
            const slots = slotsRes.data;
            counts[area.id] = {
              total: slots.length,
              available: slots.filter(s => s.status === 'AVAILABLE').length,
              reserved: slots.filter(s => s.status === 'RESERVED').length,
              occupied: slots.filter(s => s.status === 'OCCUPIED').length,
            };
          } catch {
            counts[area.id] = { total: 0, available: 0, reserved: 0, occupied: 0 };
          }
        })
      );
      setSlotCounts(counts);
    } catch (err) {
      console.error('Failed to load parking areas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAreas(); }, [loadAreas]);

  if (loading) return <LoadingSpinner message="Loading parking areas..." />;

  return (
    <div>
      <div className="page-header">
        <h1>🅿️ Parking Areas</h1>
        <p>Select a parking area to view and reserve available slots</p>
      </div>

      {areas.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🅿️</div>
            <h3>No parking areas available</h3>
            <p>Parking areas will appear here once configured by admin</p>
          </div>
        </div>
      ) : (
        <div className="area-cards-grid">
          {areas.map(area => {
            const counts = slotCounts[area.id] || {};
            return (
              <div
                key={area.id}
                className="area-card"
                onClick={() => navigate(`/parking-slots/${area.id}`)}
              >
                <div className="area-card-header">
                  <div className="area-card-icon">🏢</div>
                  <div className="area-card-name">{area.name}</div>
                  <div className="area-card-location">📍 {area.location}</div>
                </div>
                <div className="area-card-body">
                  <div className="area-card-stats">
                    <div className="area-stat">
                      <div className="area-stat-value" style={{ color: 'var(--success)' }}>{counts.available ?? '—'}</div>
                      <div className="area-stat-label">Available</div>
                    </div>
                    <div className="area-stat">
                      <div className="area-stat-value" style={{ color: 'var(--warning)' }}>{counts.reserved ?? '—'}</div>
                      <div className="area-stat-label">Reserved</div>
                    </div>
                    <div className="area-stat">
                      <div className="area-stat-value" style={{ color: 'var(--danger)' }}>{counts.occupied ?? '—'}</div>
                      <div className="area-stat-label">Occupied</div>
                    </div>
                    <div className="area-stat">
                      <div className="area-stat-value">{counts.total ?? area.totalSlots}</div>
                      <div className="area-stat-label">Total</div>
                    </div>
                  </div>
                  <div className="area-price">
                    💰 ₹{area.pricePerHour}/hour
                  </div>
                  {area.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '8px' }}>
                      {area.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ParkingAreasPage;
