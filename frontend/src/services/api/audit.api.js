import api from './axiosInstance'

/**
 * Audit Logs API
 */
export const auditApi = {
  /**
   * List audit logs with filtering and pagination
   * @param {Object} params - { page, limit, entity_type, action, user_id }
   */
  list: (params = {}) => {
    return api.get('/tasks/audit-logs', { params })
  },
}
