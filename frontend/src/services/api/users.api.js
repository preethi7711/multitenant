import api from './axiosInstance'

/**
 * The backend has no dedicated /users endpoint.
 * We derive org members by fetching a broad task list and extracting
 * unique (assigned_to, assignee_name) pairs — a read-only member roster
 * sufficient for the assignee dropdown.
 *
 * For a production upgrade, add GET /api/v1/users to the backend.
 */
export const usersApi = {
  /**
   * Returns an array of { id, full_name } for users in the organisation,
   * derived from task assignments.
   */
  async listOrgMembers() {
    const resp = await api.get('/tasks', { params: { limit: 100, page: 1 } })
    const tasks = resp.data.data || []

    const seen = new Map()
    tasks.forEach((t) => {
      if (t.assigned_to && t.assignee_name && !seen.has(t.assigned_to)) {
        seen.set(t.assigned_to, { id: t.assigned_to, full_name: t.assignee_name })
      }
      // Also capture creator
      if (t.created_by && t.creator_name && !seen.has(t.created_by)) {
        seen.set(t.created_by, { id: t.created_by, full_name: t.creator_name })
      }
    })
    return Array.from(seen.values())
  },
}
