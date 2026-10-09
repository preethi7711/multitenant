import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { extractErrorMessage } from '@/utils/date'
import toast from 'react-hot-toast'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization_name: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.organization_name.trim()) e.organization_name = 'Organization name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'At least 8 characters'
    else if (!/[A-Z]/.test(form.password)) e.password = 'Must contain an uppercase letter'
    else if (!/[a-z]/.test(form.password)) e.password = 'Must contain a lowercase letter'
    else if (!/[0-9]/.test(form.password)) e.password = 'Must contain a number'
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) e.password = 'Must contain a special character (!@#$%…)'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
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
      const { confirmPassword, ...payload } = form
      await register(payload)
      toast.success('Account created! Welcome to TaskFlow 🎉')
      navigate('/tasks', { replace: true })
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2 className="auth-title">Create your workspace</h2>
      <p className="auth-subtitle">Set up your organization and get started</p>

      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Full name"
          type="text"
          placeholder="John Doe"
          value={form.full_name}
          onChange={handleChange('full_name')}
          error={errors.full_name}
          autoFocus
        />
        <Input
          label="Organization name"
          type="text"
          placeholder="Acme Inc."
          value={form.organization_name}
          onChange={handleChange('organization_name')}
          error={errors.organization_name}
        />
        <Input
          label="Work email"
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min 8 chars, uppercase, number, symbol"
          value={form.password}
          onChange={handleChange('password')}
          error={errors.password}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
        />
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          loading={loading}
          style={{ marginTop: 8 }}
        >
          Create account
        </Button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
          Sign in
        </Link>
      </p>
    </>
  )
}
