import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { GuestRoute } from './GuestRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { TasksPage } from '@/pages/tasks/TasksPage'
import { AuditLogsPage } from '@/pages/tasks/AuditLogsPage'
import { CloudControlCenter } from '@/pages/CloudControlCenter'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      {/* ── Public / guest-only routes ───────────────────────────── */}
      <Route
        element={
          <GuestRoute>
            <AuthLayout />
          </GuestRoute>
        }
      >
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* ── Protected app routes ─────────────────────────────────── */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/audit" element={<AuditLogsPage />} />
        <Route path="/cloud" element={<CloudControlCenter />} />
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/tasks" replace />} />
      </Route>

      {/* ── 404 ──────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
