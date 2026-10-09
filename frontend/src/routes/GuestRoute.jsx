import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * Wraps routes that should only be reachable by authenticated users
 * who already have a valid session (login / register pages).
 * If already authenticated, redirect straight to /tasks.
 */
export function GuestRoute({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)

  if (accessToken && user) {
    return <Navigate to="/tasks" replace />
  }

  return children
}
