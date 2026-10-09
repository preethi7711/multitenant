# TaskFlow Frontend

A **production-grade SaaS frontend** for the multi-tenant FastAPI task management system. Built with React + Vite + Tailwind CSS + Zustand + Axios.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 8 |
| Styling | Tailwind CSS v4 + Custom Design System |
| State | Zustand (persisted to localStorage) |
| Routing | React Router v6 |
| HTTP | Axios with request/response interceptors |
| Icons | Lucide React |
| Toasts | react-hot-toast |
| Font | Inter (Google Fonts) |

---

## Setup

### Prerequisites
- Node.js 18+
- The FastAPI backend running on port `8000`

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

The default `.env` is pre-configured for local development:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=        # Optional: fill in for Google OAuth
```

### 3. Start the dev server
```bash
npm run dev
```
Opens at **http://localhost:5173**

### 4. Production build
```bash
npm run build       # outputs to dist/
npm run preview     # preview the production build locally
```

---

## Backend Connection

All API calls proxy through Vite's dev server to `http://localhost:8000`.
The Axios base URL is `${VITE_API_BASE_URL}/api/v1`.

| Frontend Action | Method | Endpoint |
|---|---|---|
| Register + create org | POST | `/api/v1/auth/register` |
| Login | POST | `/api/v1/auth/login` |
| Logout | POST | `/api/v1/auth/logout` |
| Silent token refresh | POST | `/api/v1/auth/refresh` |
| Google OAuth redirect | GET | `/api/v1/auth/google/login` |
| List tasks (filtered) | GET | `/api/v1/tasks` |
| Get one task | GET | `/api/v1/tasks/{id}` |
| Create task | POST | `/api/v1/tasks` |
| Update task | PUT | `/api/v1/tasks/{id}` |
| Delete task | DELETE | `/api/v1/tasks/{id}` |

---

## Features

### Authentication
- Email + password login with JWT (access + refresh tokens)
- Auto token refresh via Axios interceptor — seamless for the user
- If refresh fails, logs out automatically and redirects to `/login`
- Google OAuth button redirects to the backend OAuth flow
- Tokens stored in `localStorage` via Zustand `persist`

### Task Management
- Create, view, edit, and delete tasks
- Fields: title, description, status, priority, assignee, due date
- Status: `pending` / `in_progress` / `completed` / `cancelled`
- Priority: `low` / `medium` / `high` / `urgent`

### Filtering & Search
- Debounced search (400ms) on title + description
- Filter by status, filter by priority
- Sort by: created date, updated date, due date, priority, status
- Toggle ascending / descending

### Pagination
- Smart page-number display with ellipsis for large page counts
- Shows "Showing X–Y of N" item count

### RBAC (Role-Based Access Control)
| Feature | Admin | Member |
|---|---|---|
| See all org tasks | Yes | No (own only, backend enforced) |
| Create task | Yes | Yes |
| Edit any task | Yes | Own assigned only |
| Delete task | Yes | No (button hidden) |
| Stats dashboard | Yes | No |

### UX Polish
- Skeleton shimmer rows while loading
- Empty state with contextual CTA
- Toast notifications for all actions (success + error)
- Form validation with inline field-level errors
- Confirm dialog for destructive delete
- Keyboard-closeable modals (Escape key)
- Micro-animations on modals, badges, hover states

---

## Password Requirements

The backend enforces strict password complexity. Passwords must have:
- Minimum 8 characters
- At least one **uppercase** letter
- At least one **lowercase** letter
- At least one **number**
- At least one **special character** (`!@#$%^&*` etc.)

The registration form validates all five rules client-side before any API call.

---

## Project Structure

```
src/
├── main.jsx                   # App entry point
├── App.jsx                    # BrowserRouter + Toaster
├── index.css                  # Full design system (CSS vars + component styles)
│
├── routes/
│   ├── index.jsx              # Route tree
│   ├── ProtectedRoute.jsx     # Requires auth
│   └── GuestRoute.jsx         # Redirects authed users to /tasks
│
├── layouts/
│   ├── AuthLayout.jsx
│   └── AppLayout.jsx          # Sidebar + Topbar + Outlet
│
├── pages/
│   ├── auth/LoginPage.jsx
│   ├── auth/RegisterPage.jsx
│   ├── tasks/TasksPage.jsx
│   └── NotFoundPage.jsx
│
├── components/
│   ├── ui/                    # Button, Input, Select, Badge, Spinner,
│   │                          # Skeleton, Modal, ConfirmDialog
│   ├── layout/                # Sidebar, Topbar
│   └── tasks/                 # TaskTable, TaskForm, FilterBar, Pagination
│
├── services/api/
│   ├── axiosInstance.js       # Interceptors + silent refresh queue
│   ├── auth.api.js
│   ├── tasks.api.js
│   └── users.api.js           # Derives org members from task data
│
├── store/authStore.js         # Zustand + localStorage persist
│
├── hooks/
│   ├── useAuth.js
│   └── useDebounce.js
│
└── utils/
    ├── cn.js                  # clsx wrapper
    ├── date.js                # formatDate, getInitials, extractErrorMessage
    └── constants.js           # Dropdown option arrays
```

---

## Design System

Inspired by **Linear** and **Notion** — dark slate base with an indigo accent.

| Token | Value |
|---|---|
| Background primary | `#0f172a` |
| Background secondary | `#1e293b` |
| Accent | `#6366f1` |
| Text primary | `#f1f5f9` |
| Text muted | `#64748b` |
| Danger | `#ef4444` |
| Success | `#22c55e` |

All tokens live in CSS custom properties in `src/index.css`.
