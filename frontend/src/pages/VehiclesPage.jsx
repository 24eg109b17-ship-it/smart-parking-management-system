import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/auth';
import { getVehiclesByUser, addVehicle, updateVehicle, deleteVehicle } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';

const VEHICLE_ICONS = { CAR: '🚗', BIKE: '🏍️', TRUCK: '🚛' };

function VehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const emptyForm = { vehicleNumber: '', vehicleType: 'CAR', model: '' };
  const [form, setForm] = useState(emptyForm);


  const loadVehicles = useCallback(async () => {
    try {
      const res = await getVehiclesByUser(user.id);
      setVehicles(res.data);
    } catch {
      setError('Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadVehicles(); }, [loadVehicles]);

  const openAddModal = () => {
    setEditingVehicle(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setForm({ vehicleNumber: vehicle.vehicleNumber, vehicleType: vehicle.vehicleType, model: vehicle.model || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.vehicleNumber || !form.vehicleType) {
      setError('Vehicle number and type are required.');
      return;
    }

    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, { ...form, userId: user.id });
        setSuccess('Vehicle updated successfully!');
      } else {
        await addVehicle({ ...form, userId: user.id });
        setSuccess('Vehicle added successfully!');
      }
      setShowModal(false);
      loadVehicles();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save vehicle.');
    }

    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = async () => {
    try {
      await deleteVehicle(deleteConfirm.id);
      setSuccess('Vehicle deleted successfully!');
      setDeleteConfirm(null);
      loadVehicles();
    } catch {
      setError('Failed to delete vehicle.');
    }
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) return <LoadingSpinner message="Loading your vehicles..." />;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h1>🚗 My Vehicles</h1>
          <p>Manage your registered vehicles for parking</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add Vehicle</button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {vehicles.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🚗</div>
            <h3>No vehicles registered</h3>
            <p>Add your first vehicle to start reserving parking slots</p>
            <button className="btn btn-primary" onClick={openAddModal}>+ Add Vehicle</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ fontSize: '3rem' }}>{VEHICLE_ICONS[vehicle.vehicleType] || '🚗'}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(vehicle)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(vehicle)}>🗑️</button>
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{vehicle.vehicleNumber}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {vehicle.vehicleType} {vehicle.model ? `• ${vehicle.model}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingVehicle ? '✏️ Edit Vehicle' : '+ Add New Vehicle'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Vehicle Number *</label>
                <input className="form-input" placeholder="e.g. TS09AB1234" value={form.vehicleNumber}
                  onChange={e => setForm({ ...form, vehicleNumber: e.target.value.toUpperCase() })} />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Type *</label>
                <select className="form-select" value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })}>
                  <option value="CAR">🚗 Car</option>
                  <option value="BIKE">🏍️ Bike</option>
                  <option value="TRUCK">🚛 Truck</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Model</label>
                <input className="form-input" placeholder="e.g. Honda City" value={form.model}
                  onChange={e => setForm({ ...form, model: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingVehicle ? 'Update' : 'Add Vehicle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete Vehicle"
        message={`Are you sure you want to delete vehicle ${deleteConfirm?.vehicleNumber}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Delete"
      />
    </div>
  );
}

export default VehiclesPage;
