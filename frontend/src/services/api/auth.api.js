import api from './axiosInstance'

export const authApi = {
  /**
   * POST /auth/register
   * Body: { email, password, full_name, organization_name }
   */
  register(data) {
    return api.post('/auth/register', data)
  },

  /**
   * POST /auth/login
   * Body: { email, password }
   */
  login(data) {
    return api.post('/auth/login', data)
  },

  /**
   * POST /auth/logout
   * Body: { refresh_token }
   */
  logout(refreshToken) {
    return api.post('/auth/logout', { refresh_token: refreshToken })
  },

  /**
   * POST /auth/refresh
   * Body: { refresh_token }
   */
  refresh(refreshToken) {
    return api.post('/auth/refresh', { refresh_token: refreshToken })
  },

  /**
   * GET /auth/google/login — redirects to Google consent screen
   * Used by window.location.href = ...
   */
  getGoogleLoginUrl() {
    const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '')
    return `${BASE_URL}/api/v1/auth/google/login`
  },

  /**
   * POST /auth/google/authenticate
   * Body: { code } — SPA-mode: frontend sends the code
   */
  googleAuthenticate(code) {
    return api.post('/auth/google/authenticate', { code })
  },
}
