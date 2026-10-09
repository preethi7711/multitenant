import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          background: 'var(--accent-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          color: 'var(--accent)',
        }}
      >
        <Zap size={28} />
      </div>
      <h1
        style={{
          fontSize: 80,
          fontWeight: 800,
          color: 'var(--bg-tertiary)',
          lineHeight: 1,
          marginBottom: 12,
          letterSpacing: '-0.04em',
        }}
      >
        404
      </h1>
      <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        Page not found
      </p>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 320 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/tasks" className="btn btn-primary">
        Back to Tasks
      </Link>
    </div>
  )
}
