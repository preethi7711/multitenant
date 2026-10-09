import { cn } from '@/utils/cn'

const STATUS_MAP = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const PRIORITY_MAP = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export function StatusBadge({ status }) {
  return (
    <span className={cn('badge', `badge-${status}`)}>
      {STATUS_MAP[status] || status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  return (
    <span className={cn('badge', `badge-${priority}`)}>
      {PRIORITY_MAP[priority] || priority}
    </span>
  )
}
