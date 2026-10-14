import React from 'react';

function StatusBadge({ status }) {
  const classes = {
    AVAILABLE: 'badge badge-available',
    RESERVED: 'badge badge-reserved',
    OCCUPIED: 'badge badge-occupied',
    ACTIVE: 'badge badge-active',
    COMPLETED: 'badge badge-completed',
    CANCELLED: 'badge badge-cancelled',
    USER: 'badge badge-user',
    ADMIN: 'badge badge-admin',
  };
  const icons = {
    AVAILABLE: '✅', RESERVED: '🟡', OCCUPIED: '🔴',
    ACTIVE: '🔵', COMPLETED: '✅', CANCELLED: '❌',
    USER: '👤', ADMIN: '🔐'
  };
  return (
    <span className={classes[status] || 'badge'}>
      {icons[status]} {status}
    </span>
  );
}

export default StatusBadge;
