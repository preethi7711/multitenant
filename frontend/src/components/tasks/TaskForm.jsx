import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { tasksApi } from '@/services/api/tasks.api'
import { extractErrorMessage } from '@/utils/date'
import { STATUS_FORM_OPTIONS, PRIORITY_FORM_OPTIONS } from '@/utils/constants'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export function TaskForm({ isOpen, onClose, task = null, onSuccess, members = [] }) {
  const user = useAuthStore((s) => s.user)
  const isEdit = !!task

  const emptyForm = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assigned_to: user?.id || '',
    due_date: '',
  }

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        assigned_to: task.assigned_to || user?.id || '',
        due_date: task.due_date ? task.due_date.slice(0, 10) : '',
      })
    } else {
      setForm(emptyForm)
    }
    setErrors({})
  }, [task, isOpen])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.assigned_to) e.assigned_to = 'Assignee is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      // Ensure assigned_to is present and valid
      if (!form.assigned_to) {
        setErrors({ assigned_to: 'Assignee is required' })
        return
      }

      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        status: form.status,
        priority: form.priority,
        assigned_to: form.assigned_to,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      }
      if (isEdit) {
        await tasksApi.update(task.id, payload)
        toast.success('Task updated')
      } else {
        await tasksApi.create(payload)
        toast.success('Task created')
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const assigneeOptions = [
    { value: '', label: 'Select assignee…' },
    ...members.map((m) => ({ value: m.id, label: m.full_name + (m.id === user?.id ? ' (You)' : '') })),
  ]

  // If no members list, default to current user only
  if (members.length === 0) {
    assigneeOptions.splice(1, 0, { value: user?.id, label: `${user?.full_name} (You)` })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit task' : 'Create task'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {isEdit ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Title *"
          type="text"
          placeholder="Task title"
          value={form.title}
          onChange={handleChange('title')}
          error={errors.title}
          autoFocus
        />
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="input"
            rows={3}
            placeholder="Add a description…"
            value={form.description}
            onChange={handleChange('description')}
            style={{ resize: 'vertical', minHeight: 72 }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Select
            label="Status"
            options={STATUS_FORM_OPTIONS}
            value={form.status}
            onChange={handleChange('status')}
          />
          <Select
            label="Priority"
            options={PRIORITY_FORM_OPTIONS}
            value={form.priority}
            onChange={handleChange('priority')}
          />
        </div>
        <Select
          label="Assignee *"
          options={assigneeOptions}
          value={form.assigned_to}
          onChange={handleChange('assigned_to')}
          error={errors.assigned_to}
        />
        <Input
          label="Due date"
          type="date"
          value={form.due_date}
          onChange={handleChange('due_date')}
        />
      </form>
    </Modal>
  )
}
