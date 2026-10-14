import React, { useState, useEffect, useCallback } from 'react';
import { getAllVehicles } from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/main.css';

const VEHICLE_ICONS = {
  CAR: '🚗',
  BIKE: '🏍️',
  TRUCK: '🚛',
};

function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await getAllVehicles();
      const data = Array.isArray(res.data) ? res.data : [];
      setVehicles(data);
    } catch {
      setError('Failed to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const filtered = vehicles.filter(vehicle => (typeFilter === 'ALL' || vehicle.vehicleType === typeFilter) && [vehicle.vehicleNumber, vehicle.model, vehicle.user?.name].some(value => String(value || '').toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>Vehicle Management</h1>
        <p>View and manage all registered vehicles in the system</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card">
        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filtered.length}</strong> of <strong>{vehicles.length}</strong> vehicles
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="CAR">🚗 Car</option>
              <option value="BIKE">🏍️ Bike</option>
              <option value="TRUCK">🚛 Truck</option>
            </select>
            <input
              className="form-input"
              style={{ maxWidth: '260px' }}
              placeholder="🔍 Search by number, model, owner…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚗</div>
            <h3>{search || typeFilter !== 'ALL' ? 'No vehicles match your filters' : 'No vehicles found'}</h3>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle Number</th>
                  <th>Type</th>
                  <th>Model</th>
                  <th>Owner Name</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>#{vehicle.id}</td>
                    <td>
                      <span style={{ fontWeight: '700', fontFamily: 'monospace', color: 'var(--primary)' }}>
                        {vehicle.vehicleNumber || '—'}
                      </span>
                    </td>
                    <td>
                      <span>
                        {VEHICLE_ICONS[vehicle.vehicleType] || '🚘'}{' '}
                        {vehicle.vehicleType || '—'}
                      </span>
                    </td>
                    <td>{vehicle.model || '—'}</td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{vehicle.user?.name || '—'}</div>
                      {vehicle.user?.email && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{vehicle.user.email}</div>
                      )}
                    </td>
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

export default AdminVehicles;
