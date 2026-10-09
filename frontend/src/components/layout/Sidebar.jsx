import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, LogOut, Settings, Zap, History, Server } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function Sidebar() {
  const { user, isAdmin, logout } = useAuth()

  const navItems = [
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  ]

  if (isAdmin) {
    navItems.push({ to: '/audit', icon: History, label: 'Activity Logs' })
    navItems.push({ to: '/cloud', icon: Server, label: 'Cloud Control Center' })
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={18} color="white" />
        </div>
        <div>
          <div className="sidebar-logo-text">TaskFlow</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p className="nav-section-label">Workspace</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item${isActive ? ' active' : ''}`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {user && (
          <div style={{ marginBottom: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
              {user.full_name}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user.role}
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="nav-item"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
