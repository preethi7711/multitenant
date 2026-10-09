import { useAuthStore } from '@/store/authStore'
import { getInitials } from '@/utils/date'
import { Bell } from 'lucide-react'

export function Topbar({ title = 'Tasks' }) {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="topbar">
      <div>
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-right">
        {user && (
          <>
            <div className="user-info">
              <div className="user-name">{user.full_name}</div>
              <div className="user-role">{user.role}</div>
            </div>
            <div className="user-avatar" title={user.email}>
              {getInitials(user.full_name)}
            </div>
          </>
        )}
      </div>
    </header>
  )
}
