import React, { useState, useEffect, useCallback } from 'react';
import { getAllSlots, getAllParkingAreas, addParkingSlot, updateParkingSlot, deleteParkingSlot } from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';
import StatusBadge from '../../components/StatusBadge';

const emptyForm = { slotNumber: '', slotType: 'CAR', status: 'AVAILABLE', parkingAreaId: '' };

function AdminSlots() {
  const [slots, setSlots] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');


  const loadData = useCallback(async () => {
    try {
      const [slotsRes, areasRes] = await Promise.all([getAllSlots(), getAllParkingAreas()]);
      setSlots(slotsRes.data); setAreas(areasRes.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openAdd = () => {
    setEditingSlot(null);
    setForm({ ...emptyForm, parkingAreaId: areas.length > 0 ? String(areas[0].id) : '' });
    setShowModal(true); setError('');
  };

  const openEdit = (slot) => {
    setEditingSlot(slot);
    setForm({ slotNumber: slot.slotNumber, slotType: slot.slotType, status: slot.status, parkingAreaId: String(slot.parkingArea?.id || '') });
    setShowModal(true); setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.slotNumber || !form.parkingAreaId) { setError('Slot number and area are required.'); return; }
    try {
      const payload = { slotNumber: form.slotNumber, slotType: form.slotType, status: form.status };
      if (editingSlot) { await updateParkingSlot(editingSlot.id, payload); setSuccess('Slot updated!'); }
      else { await addParkingSlot(form.parkingAreaId, payload); setSuccess('Slot added!'); }
      setShowModal(false); loadData();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save.'); }
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = async () => {
    try { await deleteParkingSlot(deleteTarget.id); setSuccess('Slot deleted!'); setDeleteTarget(null); loadData(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to delete slot.'); }
    setTimeout(() => setSuccess(''), 3000);
  };

  const filtered = filterStatus === 'ALL' ? slots : slots.filter(s => s.status === filterStatus);

  if (loading) return <LoadingSpinner message="Loading parking slots..." />;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div><h1>🅿️ Parking Slot Management</h1><p>{slots.length} total slots</p></div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select className="form-select" style={{ width: '160px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="OCCUPIED">Occupied</option>
          </select>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Slot</button>
        </div>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && !showModal && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>ID</th><th>Slot Number</th><th>Type</th><th>Status</th><th>Parking Area</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>#{s.id}</td>
                  <td><strong>{s.slotNumber}</strong></td>
                  <td>{s.slotType}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>{s.parkingArea?.name || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(s)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state"><div className="empty-state-icon">🅿️</div><h3>No slots found</h3></div>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingSlot ? '✏️ Edit Slot' : '+ Add Parking Slot'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <form onSubmit={handleSave}>
              {!editingSlot && (
                <div className="form-group">
                  <label className="form-label">Parking Area *</label>
                  <select className="form-select" value={form.parkingAreaId} onChange={e => setForm({ ...form, parkingAreaId: e.target.value })}>
                    {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group"><label className="form-label">Slot Number *</label><input className="form-input" value={form.slotNumber} onChange={e => setForm({ ...form, slotNumber: e.target.value })} placeholder="e.g. A01" /></div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Slot Type</label>
                  <select className="form-select" value={form.slotType} onChange={e => setForm({ ...form, slotType: e.target.value })}>
                    <option value="CAR">🚗 Car</option><option value="BIKE">🏍️ Bike</option><option value="TRUCK">🚛 Truck</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" disabled title="Status is managed by the reservation workflow" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="AVAILABLE">Available</option><option value="RESERVED">Reserved</option><option value="OCCUPIED">Occupied</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingSlot ? 'Update' : 'Add Slot'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteTarget} title="Delete Slot" message={`Delete slot ${deleteTarget?.slotNumber}?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} confirmText="Delete" />
    </div>
  );
}

export default AdminSlots;
