import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * Wraps any route that requires authentication.
 * Unauthenticated users are redirected to /login with the original
 * destination saved in location state so we can redirect back after login.
 */
export function ProtectedRoute({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
