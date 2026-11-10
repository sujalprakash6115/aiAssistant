export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} className="fade-in" onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button onClick={onCancel} style={styles.cancel}>
            Cancel
          </button>
          <button onClick={onConfirm} style={styles.confirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 16
  },
  modal: {
    background: 'var(--surface)',
    borderRadius: 14,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border)'
  },
  title: {
    fontSize: 17,
    fontWeight: 600,
    marginBottom: 8
  },
  message: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    marginBottom: 20,
    lineHeight: 1.5
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10
  },
  cancel: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: 14
  },
  confirm: {
    padding: '8px 16px',
    borderRadius: 8,
    background: '#ef4444',
    color: '#fff',
    fontSize: 14,
    fontWeight: 500
  }
};
