import { Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge'
import { TableRowSkeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/utils/date'

export function TaskTable({
  tasks = [],
  loading = false,
  isAdmin = false,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}) {
  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      onSort(field, 'desc')
    }
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th style={{ minWidth: 200 }}>Title</th>
            <th
              className="sortable"
              onClick={() => handleSort('status')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Status <SortIcon field="status" />
              </span>
            </th>
            <th
              className="sortable"
              onClick={() => handleSort('priority')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Priority <SortIcon field="priority" />
              </span>
            </th>
            <th>Assignee</th>
            <th
              className="sortable"
              onClick={() => handleSort('due_date')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Due Date <SortIcon field="due_date" />
              </span>
            </th>
            <th
              className="sortable"
              onClick={() => handleSort('created_at')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Created <SortIcon field="created_at" />
              </span>
            </th>
            <th style={{ width: 80 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && tasks.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={7} />
              ))
            : tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                        {task.description}
                      </div>
                    )}
                  </td>
                  <td><StatusBadge status={task.status} /></td>
                  <td><PriorityBadge priority={task.priority} /></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {task.assignee_name || '—'}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {formatDate(task.due_date)}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {formatDate(task.created_at)}
                  </td>
                  <td>
                    <div className="action-menu">
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => onEdit(task)}
                        title="Edit task"
                        aria-label="Edit task"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => onDelete(task)}
                        title="Delete task"
                        aria-label="Delete task"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}
