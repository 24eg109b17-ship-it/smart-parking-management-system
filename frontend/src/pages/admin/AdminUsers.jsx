import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers } from '../../api/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/main.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getAllUsers();
      const data = Array.isArray(res.data) ? res.data : [];
      setUsers(data);
    } catch {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter(user => [user.name, user.email].some(value => String(value || '').toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>User Management</h1>
        <p>View and manage all registered users in the system</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card">
        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filtered.length}</strong> of <strong>{users.length}</strong> users
          </span>
          <input
            className="form-input"
            style={{ maxWidth: '280px' }}
            placeholder="🔍 Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>{search ? 'No users match your search' : 'No users found'}</h3>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>#{user.id}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{user.name || '—'}</div>
                    </td>
                    <td>{user.email || '—'}</td>
                    <td>{user.phone || '—'}</td>
                    <td>
                      <StatusBadge status={user.role || 'USER'} />
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

export default AdminUsers;
