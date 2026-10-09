import { useState, useEffect, useCallback } from 'react'
import { Plus, ClipboardList, WifiOff } from 'lucide-react'
import { tasksApi } from '@/services/api/tasks.api'
import { usersApi } from '@/services/api/users.api'
import { useAuthStore } from '@/store/authStore'
import { useDebounce } from '@/hooks/useDebounce'
import { TaskTable } from '@/components/tasks/TaskTable'
import { TaskForm } from '@/components/tasks/TaskForm'
import { FilterBar } from '@/components/tasks/FilterBar'
import { Pagination } from '@/components/tasks/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { extractErrorMessage } from '@/utils/date'
import toast from 'react-hot-toast'

export function TasksPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'

  // ─── Task List State ────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([])
  const [pagination, setPagination] = useState({
    page: 1, page_size: 10, total_items: 0, total_pages: 0,
    has_next: false, has_prev: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ─── Filter State ───────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, 400)

  // ─── Modal State ────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ─── Org members (for assignee dropdown) ───────────────────────────────
  const [orgMembers, setOrgMembers] = useState([])

  // ─── Stats ──────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 })

  // ─── Fetch tasks ────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await tasksApi.list({
        page,
        limit: 10,
        status,
        priority,
        search: debouncedSearch,
        sort_by: sortBy,
        sort_order: sortOrder,
      })
      setTasks(resp.data.data)
      setPagination(resp.data.pagination)
    } catch (err) {
      const msg = extractErrorMessage(err)
      setError(msg)
      setLoading(false)
      // Don't toast here — network errors on initial load are shown inline
      return
    } finally {
      setLoading(false)
    }
  }, [page, status, priority, debouncedSearch, sortBy, sortOrder])

  // Fetch stats (total by status) separately so filter doesn't reset them
  const fetchStats = useCallback(async () => {
    if (!isAdmin) return
    try {
      const [all, pend, inProg, comp] = await Promise.all([
        tasksApi.list({ limit: 1, page: 1 }),
        tasksApi.list({ limit: 1, page: 1, status: 'pending' }),
        tasksApi.list({ limit: 1, page: 1, status: 'in_progress' }),
        tasksApi.list({ limit: 1, page: 1, status: 'completed' }),
      ])
      setStats({
        total: all.data.pagination.total_items,
        pending: pend.data.pagination.total_items,
        in_progress: inProg.data.pagination.total_items,
        completed: comp.data.pagination.total_items,
      })
    } catch {
      // Stats are non-critical
    }
  }, [isAdmin])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, priority, sortBy, sortOrder])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Fetch org members on mount (best-effort — non-critical)
  useEffect(() => {
    usersApi.listOrgMembers().then(setOrgMembers).catch(() => {})
  }, [])

  useEffect(() => {
    fetchStats()
  }, []) // Only on mount

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleSort = (field, order) => {
    setSortBy(field)
    setSortOrder(order)
  }

  const handleReset = () => {
    setSearch('')
    setStatus('')
    setPriority('')
    setSortBy('created_at')
    setSortOrder('desc')
    setPage(1)
  }

  const handleCreateClick = () => {
    setEditingTask(null)
    setFormOpen(true)
  }

  const handleEditClick = (task) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const handleDeleteClick = (task) => {
    setDeleteTarget(task)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await tasksApi.delete(deleteTarget.id)
      toast.success('Task deleted')
      setDeleteTarget(null)
      fetchTasks()
      fetchStats()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleFormSuccess = () => {
    fetchTasks()
    fetchStats()
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Tasks</h1>
          <p className="page-header-desc">
            {isAdmin ? 'Manage all tasks across your organization' : 'View and manage your assigned tasks'}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleCreateClick}>
          New task
        </Button>
      </div>

      {/* Stats cards (admin only) */}
      {isAdmin && (
        <div className="stat-grid">
          {[
            { label: 'Total', value: stats.total, color: 'var(--text-primary)' },
            { label: 'Pending', value: stats.pending, color: '#94a3b8' },
            { label: 'In Progress', value: stats.in_progress, color: '#818cf8' },
            { label: 'Completed', value: stats.completed, color: '#4ade80' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ marginBottom: 20 }}>
        <FilterBar
          search={search}
          onSearch={setSearch}
          status={status}
          onStatus={setStatus}
          priority={priority}
          onPriority={setPriority}
          sortBy={sortBy}
          onSortBy={setSortBy}
          sortOrder={sortOrder}
          onSortOrder={setSortOrder}
          onReset={handleReset}
        />
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ color: 'var(--danger)', background: 'rgba(239,68,68,0.1)' }}>
            <WifiOff size={24} />
          </div>
          <div className="empty-state-title">Could not load tasks</div>
          <div className="empty-state-desc">{error}</div>
          <Button variant="secondary" onClick={fetchTasks}>Try again</Button>
        </div>
      )}

      {/* Table or Empty state (only when no error) */}
      {!error && !loading && tasks.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <ClipboardList size={24} />
          </div>
          <div className="empty-state-title">No tasks found</div>
          <div className="empty-state-desc">
            {search || status || priority
              ? 'No tasks match your filters. Try adjusting or resetting them.'
              : 'Get started by creating your first task.'}
          </div>
          {!search && !status && !priority && (
            <Button variant="primary" icon={Plus} onClick={handleCreateClick}>
              Create first task
            </Button>
          )}
        </div>
      )}

      {!error && (loading || tasks.length > 0) && (
        <>
          <TaskTable
            tasks={tasks}
            loading={loading}
            isAdmin={isAdmin}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
          <Pagination
            page={pagination.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total_items}
            pageSize={pagination.page_size}
            onPage={setPage}
          />
        </>
      )}

      {/* Create / Edit modal */}
      <TaskForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        task={editingTask}
        onSuccess={handleFormSuccess}
        members={orgMembers}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete task?"
        message={`"${deleteTarget?.title}" will be permanently deleted. This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  )
}
