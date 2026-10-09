import { useState, useEffect, useCallback } from 'react'
import { History, Search, Filter, Eye, User, Calendar, Activity } from 'lucide-react'
import { auditApi } from '@/services/api/audit.api'
import { Pagination } from '@/components/tasks/Pagination'
import { Button } from '@/components/ui/Button'
import { extractErrorMessage } from '@/utils/date'
import toast from 'react-hot-toast'

export function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState({
    page: 1, page_size: 20, total_items: 0, total_pages: 0,
    has_next: false, has_prev: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [entityType, setEntityType] = useState('')
  const [action, setAction] = useState('')
  const [page, setPage] = useState(1)

  // Selected log for detail view
  const [selectedLog, setSelectedLog] = useState(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await auditApi.list({
        page,
        limit: 20,
        entity_type: entityType || undefined,
        action: action || undefined,
      })
      setLogs(resp.data.data)
      setPagination(resp.data.pagination)
    } catch (err) {
      const msg = extractErrorMessage(err)
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [page, entityType, action])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const getActionColor = (action) => {
    switch (action) {
      case 'created': return '#4ade80' // green
      case 'updated': return '#60a5fa' // blue
      case 'deleted': return '#f87171' // red
      default: return 'var(--text-muted)'
    }
  }

  const formatChanges = (changes) => {
    if (!changes) return 'No data'
    if (changes.action === 'updated' && changes.changed_fields) {
      return Object.keys(changes.changed_fields).join(', ')
    }
    return changes.action
  }

  return (
    <div className="audit-page">
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Activity Logs</h1>
          <p className="page-header-desc">Complete audit trail of all actions in your organization</p>
        </div>
        <Button variant="secondary" icon={History} onClick={() => fetchLogs()} loading={loading}>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 24 }}>
        <div className="filter-group">
          <Filter size={14} className="filter-icon" />
          <select 
            value={entityType} 
            onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">All Entities</option>
            <option value="task">Tasks</option>
            <option value="user">Users</option>
            <option value="organization">Organization</option>
          </select>
        </div>

        <div className="filter-group">
          <Activity size={14} className="filter-icon" />
          <select 
            value={action} 
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">All Actions</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
              <th>Performed By</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && logs.length === 0 ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan={6}><div className="skeleton" style={{ height: 40 }}></div></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-empty">No activity logs found</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className="badge" style={{ 
                      background: `${getActionColor(log.action)}20`, 
                      color: getActionColor(log.action),
                      border: `1px solid ${getActionColor(log.action)}40`
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>
                        {log.entity_type}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell-truncate" title={formatChanges(log.changes)}>
                    {formatChanges(log.changes)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <User size={14} color="var(--text-muted)" />
                      <span>{log.user_name || 'System'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="icon-button" onClick={() => setSelectedLog(log)}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {logs.length > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          totalItems={pagination.total_items}
          pageSize={pagination.page_size}
          onPage={setPage}
        />
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Log Details</h2>
              <button className="modal-close" onClick={() => setSelectedLog(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Log ID</div>
                  <div className="detail-value" style={{ fontSize: 11, fontFamily: 'monospace' }}>{selectedLog.id}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Entity ID</div>
                  <div className="detail-value" style={{ fontSize: 11, fontFamily: 'monospace' }}>{selectedLog.entity_id}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">IP Address</div>
                  <div className="detail-value">{selectedLog.ip_address || 'Unknown'}</div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div className="detail-label">Changes Payload</div>
                <pre className="json-block">
                  {JSON.stringify(selectedLog.changes, null, 2)}
                </pre>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .audit-page { animation: fadeIn 0.3s ease-out; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .detail-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
        .detail-value { font-size: 13.5px; color: var(--text-primary); }
        .json-block { 
          background: #0f172a; 
          border: 1px solid var(--border-light); 
          border-radius: 8px; 
          padding: 12px; 
          font-size: 12px; 
          color: #e2e8f0; 
          overflow-x: auto; 
          max-height: 300px;
          margin: 0;
        }
        .table-cell-truncate { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
