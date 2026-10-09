import api from './axiosInstance'

export const tasksApi = {
  /**
   * GET /tasks
   * Params: page, limit, status, priority, assigned_to, search, sort_by, sort_order
   */
  list(params = {}) {
    // Remove empty string params so they don't confuse the backend
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    )
    return api.get('/tasks', { params: cleanParams })
  },

  /**
   * GET /tasks/:id
   */
  getById(taskId) {
    return api.get(`/tasks/${taskId}`)
  },

  /**
   * POST /tasks
   * Body: { title, description, status, priority, assigned_to, due_date }
   */
  create(data) {
    return api.post('/tasks', data)
  },

  /**
   * PUT /tasks/:id
   * Body: partial task fields
   */
  update(taskId, data) {
    return api.put(`/tasks/${taskId}`, data)
  },

  /**
   * DELETE /tasks/:id
   * Admin only
   */
  delete(taskId) {
    return api.delete(`/tasks/${taskId}`)
  },
}
