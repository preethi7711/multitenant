import { Modal } from './Modal'
import { Button } from './Button'
import { AlertTriangle } from 'lucide-react'

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <span style={{
          width: 40, height: 40, borderRadius: 'var(--radius-sm)',
          background: 'rgba(239,68,68,0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          color: 'var(--danger)',
        }}>
          <AlertTriangle size={20} />
        </span>
        <div>
          <p style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
            {title}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
            {message || 'This action cannot be undone.'}
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
