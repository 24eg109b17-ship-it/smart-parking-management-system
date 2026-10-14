import React from 'react';

/**
 * ConfirmModal - A reusable confirmation dialog component.
 * Used before deleting or performing critical actions.
 *
 * Props:
 * - isOpen: boolean - whether the modal is visible
 * - title: string - modal title
 * - message: string - confirmation message
 * - onConfirm: function - called when user confirms
 * - onCancel: function - called when user cancels
 * - confirmText: string - text for confirm button (default: 'Confirm')
 * - confirmClass: string - CSS class for confirm button (default: 'btn btn-danger')
 */
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmClass = 'btn btn-danger' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{message}</p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={confirmClass} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
