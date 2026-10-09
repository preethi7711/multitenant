import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/services/api/auth.api'
import { extractErrorMessage } from '@/utils/date'
import toast from 'react-hot-toast'

/**
 * Convenience hook that surfaces auth state and actions.
 */
export function useAuth() {
  const store = useAuthStore()
  const navigate = useNavigate()

  const login = async (email, password) => {
    const response = await authApi.login({ email, password })
    const { tokens, ...userData } = response.data.data
    store.setAuth(userData, tokens)
    return userData
  }

  const register = async (payload) => {
    const response = await authApi.register(payload)
    const { tokens, ...userData } = response.data.data
    store.setAuth(userData, tokens)
    return userData
  }

  const logout = async () => {
    try {
      if (store.refreshToken) {
        await authApi.logout(store.refreshToken)
      }
    } catch {
      // Swallow — always log out locally
    } finally {
      store.logout()
      navigate('/login', { replace: true })
      toast.success('Logged out successfully')
    }
  }

  return {
    user: store.user,
    accessToken: store.accessToken,
    isAuthenticated: store.isAuthenticated(),
    isAdmin: store.isAdmin(),
    isMember: store.isMember(),
    login,
    register,
    logout,
  }
}
