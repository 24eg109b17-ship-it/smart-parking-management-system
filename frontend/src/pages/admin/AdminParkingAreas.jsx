import React, { useState, useEffect, useCallback } from 'react';
import { getAllParkingAreas, addParkingArea, updateParkingArea, deleteParkingArea } from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';

const emptyForm = { name: '', location: '', totalSlots: '', pricePerHour: '', description: '' };

function AdminParkingAreas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');


  const loadAreas = useCallback(async () => {
    try { const res = await getAllParkingAreas(); setAreas(res.data); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAreas(); }, [loadAreas]);

  const openAdd = () => { setEditingArea(null); setForm(emptyForm); setShowModal(true); setError(''); };
  const openEdit = (area) => {
    setEditingArea(area);
    setForm({ name: area.name, location: area.location, totalSlots: area.totalSlots, pricePerHour: area.pricePerHour, description: area.description || '' });
    setShowModal(true); setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.totalSlots || !form.pricePerHour) { setError('All required fields must be filled.'); return; }
    try {
      const payload = { ...form, totalSlots: parseInt(form.totalSlots), pricePerHour: parseFloat(form.pricePerHour) };
      if (editingArea) { await updateParkingArea(editingArea.id, payload); setSuccess('Area updated!'); }
      else { await addParkingArea(payload); setSuccess('Area added!'); }
      setShowModal(false); loadAreas();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save.'); }
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = async () => {
    try { await deleteParkingArea(deleteTarget.id); setSuccess('Area deleted!'); setDeleteTarget(null); loadAreas(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to delete.'); }
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) return <LoadingSpinner message="Loading parking areas..." />;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div><h1>🏗️ Parking Area Management</h1><p>{areas.length} parking areas configured</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Area</button>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && !showModal && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Location</th><th>Total Slots</th><th>Price/Hour</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {areas.map(a => (
                <tr key={a.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>#{a.id}</td>
                  <td><strong>{a.name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.description}</div></td>
                  <td>📍 {a.location}</td>
                  <td>{a.totalSlots}</td>
                  <td>₹{a.pricePerHour}/hr</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(a)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {areas.length === 0 && <div className="empty-state"><div className="empty-state-icon">🏗️</div><h3>No parking areas</h3></div>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingArea ? '✏️ Edit Parking Area' : '+ Add Parking Area'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Main Block Parking" /></div>
              <div className="form-group"><label className="form-label">Location *</label><input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Main Block, Gate 1" /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Total Slots *</label><input type="number" className="form-input" value={form.totalSlots} onChange={e => setForm({ ...form, totalSlots: e.target.value })} placeholder="10" /></div>
                <div className="form-group"><label className="form-label">Price Per Hour (₹) *</label><input type="number" step="0.5" className="form-input" value={form.pricePerHour} onChange={e => setForm({ ...form, pricePerHour: e.target.value })} placeholder="20" /></div>
              </div>
              <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingArea ? 'Update' : 'Add Area'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteTarget} title="Delete Parking Area" message={`Delete "${deleteTarget?.name}"? All associated slots may also be affected.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} confirmText="Delete Area" />
    </div>
  );
}

export default AdminParkingAreas;
