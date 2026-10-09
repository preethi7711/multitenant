import { Outlet } from 'react-router-dom'
import { Zap } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Zap size={20} color="white" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>TaskFlow</span>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
