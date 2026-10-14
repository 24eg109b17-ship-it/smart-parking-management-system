import { useCallback, useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import StatusBadge from './StatusBadge';
import ConfirmModal from './ConfirmModal';
import { getAllReservations, cancelReservation, getAllActiveSessions, getAllCompletedSessions, recordExit } from '../api/api';
import { money, dateTime, downloadCsv } from '../lib/format';

const configurations = {
  reservations: { title: 'Reservations', subtitle: 'Manage arrivals and reserved spaces.', load: getAllReservations },
  sessions: { title: 'Active sessions', subtitle: 'Vehicles currently on campus. Record departure to release a space.', load: getAllActiveSessions },
  transactions: { title: 'Parking receipts', subtitle: 'Completed stays and calculated parking charges. No online payments are collected.', load: getAllCompletedSessions },
};

export default function AdminRecords({ type }) {
  const config = configurations[type];
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [target, setTarget] = useState(null);
  const load = useCallback(async () => {
    try { setRecords((await config.load()).data); setError(''); }
    catch (err) { setError(err.response?.data?.error || 'Could not load records. Try refreshing.'); }
    finally { setLoading(false); }
  }, [config]);
  useEffect(() => { load(); }, [load]);

  const filtered = records.filter(record =>
    (status === 'ALL' || record.status === status) &&
    [record.user?.name, record.user?.email, record.vehicle?.vehicleNumber,
      record.parkingSlot?.slotNumber, record.parkingSlot?.parkingArea?.name]
      .some(value => String(value || '').toLowerCase().includes(query.toLowerCase())));
  const total = filtered.reduce((sum, record) => sum + Number(record.totalAmount || 0), 0);

  const act = async () => {
    setBusy(true);
    setError('');
    try {
      if (type === 'reservations') await cancelReservation(target.id);
      else await recordExit(target.id);
      setTarget(null);
      setNotice(type === 'reservations' ? 'Reservation cancelled and slot released.' : 'Departure recorded and parking receipt calculated.');
      await load();
    } catch (err) {
      setTarget(null);
      setError(err.response?.data?.error || 'Action failed. Refresh and try again.');
    } finally { setBusy(false); }
  };

  const exportRecords = () => downloadCsv('parking-receipts.csv',
    ['Receipt', 'Driver', 'Vehicle', 'Area', 'Slot', 'Entry', 'Exit', 'Minutes', 'Amount INR'],
    filtered.map(record => [record.id, record.user?.name, record.vehicle?.vehicleNumber,
      record.parkingSlot?.parkingArea?.name, record.parkingSlot?.slotNumber,
      record.entryTime, record.exitTime, record.durationMinutes, record.totalAmount]));

  return <section>
    <div className="page-header records-header">
      <div><span className="eyebrow">PARKING OPERATIONS</span><h1>{config.title}</h1><p>{config.subtitle}</p></div>
      <div className="action-row">
        {type === 'transactions' && <button className="btn btn-secondary" onClick={exportRecords} disabled={!filtered.length}>Export CSV</button>}
        <button className="btn btn-primary" onClick={load} disabled={busy}>Refresh</button>
      </div>
    </div>
    {error && <div className="alert alert-error" role="alert">{error}</div>}
    {notice && <div className="alert alert-success" role="status">{notice}</div>}
    <div className="card">
      <div className="records-toolbar">
        <label className="search-label">Search records<input className="form-input" placeholder="Driver, vehicle, area, or slot" value={query} onChange={event => setQuery(event.target.value)} /></label>
        {type === 'reservations' && <label>Status<select className="form-select" value={status} onChange={event => setStatus(event.target.value)}>{['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(value => <option key={value}>{value}</option>)}</select></label>}
        <div className="records-total"><strong>{filtered.length}</strong> records{type === 'transactions' && <span> · {money(total)} charges</span>}</div>
      </div>
      {loading ? <LoadingSpinner /> : <div className="table-container"><table>
        <thead><tr><th>Reference</th><th>Driver / vehicle</th><th>Area / slot</th><th>{type === 'reservations' ? 'Reserved at' : 'Entry'}</th>
          {type === 'transactions' && <><th>Exit / duration</th><th>Charge</th></>}<th>Status</th>{type !== 'transactions' && <th>Action</th>}</tr></thead>
        <tbody>{filtered.map(record => <tr key={record.id}>
          <td>#{record.id}</td><td><strong>{record.user?.name}</strong><div className="muted">{record.vehicle?.vehicleNumber}</div></td>
          <td>{record.parkingSlot?.parkingArea?.name}<div className="muted">Slot {record.parkingSlot?.slotNumber}</div></td>
          <td>{dateTime(type === 'reservations' ? record.reservationTime : record.entryTime)}</td>
          {type === 'transactions' && <><td>{dateTime(record.exitTime)}<div className="muted">{record.durationMinutes} min</div></td><td className="history-amount">{money(record.totalAmount)}</td></>}
          <td><StatusBadge status={record.status} /></td>
          {type !== 'transactions' && <td>{record.status === 'ACTIVE' && <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => setTarget(record)}>{type === 'reservations' ? 'Cancel booking' : 'Record exit'}</button>}</td>}
        </tr>)}</tbody>
      </table>{!filtered.length && <div className="empty-state"><h3>No matching records</h3><p>{query ? 'Try a different search.' : 'Records appear here as drivers use the parking system.'}</p></div>}</div>}
    </div>
    <ConfirmModal isOpen={Boolean(target)} title={type === 'reservations' ? 'Cancel reservation?' : 'Record departure?'} message={`This releases slot ${target?.parkingSlot?.slotNumber || ''}.`} onConfirm={act} onCancel={() => !busy && setTarget(null)} confirmText={busy ? 'Working…' : 'Confirm'} />
  </section>;
}
