import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { getActiveSession, recordExit } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';

function ActiveSessionPage() {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [completedSession, setCompletedSession] = useState(null);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0); // seconds elapsed since entry
  const timerRef = useRef(null);


  // Update timer every second
  useEffect(() => {
    if (session) {
      // Calculate initial elapsed
      const entryTime = new Date(session.entryTime);
      const updateElapsed = () => {
        const now = new Date();
        const diffMs = now - entryTime;
        setElapsed(Math.max(0, Math.floor(diffMs / 1000)));
      };
      updateElapsed();
      timerRef.current = setInterval(updateElapsed, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [session]);

  const loadSession = useCallback(async () => {
    try {
      const res = await getActiveSession(user.id);
      setSession(res.data);
    } catch (err) {
      if (err.response?.status !== 404) setError('Unable to load your session. Try refreshing.');
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadSession(); }, [loadSession]);

  const handleExit = async () => {
    if (!window.confirm('Record vehicle exit and calculate parking fee?')) return;
    setExiting(true);
    setError('');
    try {
      const res = await recordExit(session.id);
      setCompletedSession(res.data);
      setSession(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record exit.');
    } finally {
      setExiting(false);
    }
  };

  // Format seconds to HH:MM:SS
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Calculate estimated fee based on current elapsed time
  const estimateFee = () => {
    if (!session) return 0;
    const hours = Math.ceil(elapsed / 3600) || 1;
    const pricePerHour = session.pricePerHour ?? session.parkingSlot?.parkingArea?.pricePerHour ?? 0;
    return (hours * pricePerHour).toFixed(2);
  };

  if (loading) return <LoadingSpinner message="Loading active session..." />;

  // Show completed session fee summary
  if (completedSession) {
    return (
      <div>
        <div className="page-header">
          <h1>✅ Parking Session Completed</h1>
          <p>Your vehicle has exited. Here is your fee summary.</p>
        </div>

        <div className="card" style={{ maxWidth: '500px' }}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ marginBottom: '8px' }}>Session Ended</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Slot {completedSession.parkingSlot?.slotNumber} is now available</p>
          </div>

          <hr className="divider" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Entry Time</div>
              <div style={{ fontWeight: '600' }}>{new Date(completedSession.entryTime).toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Exit Time</div>
              <div style={{ fontWeight: '600' }}>{new Date(completedSession.exitTime).toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Duration</div>
              <div style={{ fontWeight: '600' }}>{Math.floor(completedSession.durationMinutes / 60)}h {completedSession.durationMinutes % 60}m</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Rate</div>
              <div style={{ fontWeight: '600' }}>₹{completedSession.pricePerHour ?? completedSession.parkingSlot?.parkingArea?.pricePerHour}/hr</div>
            </div>
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Total Parking Fee</span>
            <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)' }}>
              ₹{completedSession.totalAmount?.toFixed(2)}
            </span>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <Link to="/history" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              📜 View History
            </Link>
            <Link to="/parking-areas" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              🅿️ Park Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No active session
  if (!session) {
    return (
      <div>
        <div className="page-header">
          <h1>🔵 Active Session</h1>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🔵</div>
            <h3>No Active Parking Session</h3>
            <p>Reserve a slot and record vehicle entry to start a parking session</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/parking-areas" className="btn btn-primary">🅿️ Find Parking</Link>
              <Link to="/reservations" className="btn btn-secondary">📋 My Reservations</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>🟢 Active Parking Session</h1>
        <p>Your vehicle is currently parked</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Session Card */}
      <div className="session-card" style={{ marginBottom: '24px' }}>
        <div className="session-card-header">
          <div>
            <h3 style={{ color: 'white', marginBottom: '4px', fontSize: '1.2rem' }}>🟢 Currently Parked</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>Session #{session.id}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>ELAPSED TIME</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white', fontFamily: 'monospace' }}>
              {formatTime(elapsed)}
            </div>
          </div>
        </div>

        <div className="session-info-grid">
          <div className="session-info-item">
            <div className="label">Parking Slot</div>
            <div className="value">{session.parkingSlot?.slotNumber}</div>
          </div>
          <div className="session-info-item">
            <div className="label">Area</div>
            <div className="value">{session.parkingSlot?.parkingArea?.name}</div>
          </div>
          <div className="session-info-item">
            <div className="label">Vehicle</div>
            <div className="value">{session.vehicle?.vehicleNumber}</div>
          </div>
          <div className="session-info-item">
            <div className="label">Entry Time</div>
            <div className="value">{new Date(session.entryTime).toLocaleTimeString('en-IN')}</div>
          </div>
          <div className="session-info-item">
            <div className="label">Rate</div>
            <div className="value">₹{session.pricePerHour ?? session.parkingSlot?.parkingArea?.pricePerHour}/hr</div>
          </div>
          <div className="session-info-item">
            <div className="label">Est. Fee (so far)</div>
            <div className="value">₹{estimateFee()}</div>
          </div>
        </div>
      </div>

      {/* Exit Button */}
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚗💨</div>
        <h3 style={{ marginBottom: '8px' }}>Ready to leave?</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Click below to record your exit. The parking fee will be calculated automatically.
        </p>
        <button
          className="btn btn-danger btn-lg"
          onClick={handleExit}
          disabled={exiting}
          style={{ fontSize: '1rem', padding: '14px 32px' }}
        >
          {exiting ? '⏳ Processing...' : '🚪 Record Exit & Calculate Fee'}
        </button>
      </div>
    </div>
  );
}

export default ActiveSessionPage;
