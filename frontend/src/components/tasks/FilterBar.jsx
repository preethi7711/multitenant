import { Search, X } from 'lucide-react'
import { STATUS_OPTIONS, PRIORITY_OPTIONS, SORT_OPTIONS } from '@/utils/constants'

export function FilterBar({
  search,
  onSearch,
  status,
  onStatus,
  priority,
  onPriority,
  sortBy,
  onSortBy,
  sortOrder,
  onSortOrder,
  onReset,
}) {
  const hasFilters = search || status || priority || sortBy !== 'created_at'

  return (
    <div className="filter-bar">
      {/* Search */}
      <div className="search-wrapper" style={{ flex: '1 1 220px', minWidth: 0 }}>
        <Search size={14} className="search-icon" />
        <input
          className="input"
          type="search"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          style={{ paddingLeft: 34 }}
        />
      </div>

      {/* Status */}
      <select
        className="select"
        value={status}
        onChange={(e) => onStatus(e.target.value)}
        style={{ flex: '0 0 140px', height: 36, padding: '0 32px 0 12px' }}
        aria-label="Filter by status"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Priority */}
      <select
        className="select"
        value={priority}
        onChange={(e) => onPriority(e.target.value)}
        style={{ flex: '0 0 140px', height: 36, padding: '0 32px 0 12px' }}
        aria-label="Filter by priority"
      >
        {PRIORITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Sort by */}
      <select
        className="select"
        value={sortBy}
        onChange={(e) => onSortBy(e.target.value)}
        style={{ flex: '0 0 140px', height: 36, padding: '0 32px 0 12px' }}
        aria-label="Sort by"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Sort direction */}
      <button
        className="btn btn-secondary btn-sm"
        style={{ height: 36, minWidth: 68, fontSize: 12 }}
        onClick={() => onSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
      >
        {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
      </button>

      {/* Reset */}
      {hasFilters && (
        <button
          className="btn btn-ghost btn-sm"
          style={{ height: 36, color: 'var(--text-muted)', gap: 4 }}
          onClick={onReset}
        >
          <X size={13} /> Reset
        </button>
      )}
    </div>
  )
}
