import { cn } from '@/utils/cn'

export function Spinner({ size = 'md', className }) {
  return (
    <span
      className={cn(
        'spinner',
        size === 'sm' && 'w-3 h-3',
        size === 'lg' && 'spinner-lg',
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

export function PageSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '60px' }}>
      <Spinner size="lg" style={{ color: 'var(--accent)' }} />
    </div>
  )
}
