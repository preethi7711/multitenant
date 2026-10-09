export function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function extractErrorMessage(error) {
  if (!error) return 'An unexpected error occurred'
  const data = error?.response?.data
  if (!data) return error.message || 'An unexpected error occurred'

  // FastAPI validation errors
  if (data.errors && Array.isArray(data.errors)) {
    return data.errors.map((e) => e.message).join(', ')
  }
  // FastAPI detail string
  if (data.detail) {
    return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
  }
  if (data.message) return data.message
  return 'An unexpected error occurred'
}
