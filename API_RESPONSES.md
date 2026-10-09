# API Response Examples

## Success Responses

### 1. User Registration (201 Created)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@acme.com",
    "full_name": "John Doe",
    "role": "admin",
    "organization_id": "660e8400-e29b-41d4-a716-446655440000",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "bearer",
      "expires_in": 900
    }
  }
}
```

### 2. Login (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@acme.com",
    "full_name": "John Doe",
    "role": "admin",
    "organization_id": "660e8400-e29b-41d4-a716-446655440000",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "bearer",
      "expires_in": 900
    }
  }
}
```

### 3. Create Task (201 Created)
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "organization_id": "660e8400-e29b-41d4-a716-446655440000",
    "assigned_to": "550e8400-e29b-41d4-a716-446655440000",
    "created_by": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Implement authentication module",
    "description": "Build JWT-based authentication with refresh tokens",
    "status": "pending",
    "priority": "high",
    "due_date": "2024-12-31T23:59:59Z",
    "created_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z",
    "assignee_name": "John Doe",
    "creator_name": "admin@acme.com"
  }
}
```

### 4. List Tasks with Pagination (200 OK)
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "organization_id": "660e8400-e29b-41d4-a716-446655440000",
      "assigned_to": "550e8400-e29b-41d4-a716-446655440000",
      "created_by": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Implement authentication module",
      "description": "Build JWT-based authentication",
      "status": "in_progress",
      "priority": "high",
      "due_date": "2024-12-31T23:59:59Z",
      "created_at": "2024-01-15T11:00:00Z",
      "updated_at": "2024-01-16T09:30:00Z",
      "assignee_name": "John Doe",
      "creator_name": "admin@acme.com"
    },
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "organization_id": "660e8400-e29b-41d4-a716-446655440000",
      "assigned_to": "550e8400-e29b-41d4-a716-446655440000",
      "created_by": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Design database schema",
      "description": "Create multi-tenant database schema",
      "status": "completed",
      "priority": "medium",
      "due_date": "2024-01-20T23:59:59Z",
      "created_at": "2024-01-14T10:00:00Z",
      "updated_at": "2024-01-15T16:00:00Z",
      "assignee_name": "John Doe",
      "creator_name": "admin@acme.com"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total_items": 25,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

### 5. Update Task (200 OK)
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "organization_id": "660e8400-e29b-41d4-a716-446655440000",
    "assigned_to": "550e8400-e29b-41d4-a716-446655440000",
    "created_by": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Implement authentication module",
    "description": "Build JWT-based authentication with refresh tokens",
    "status": "completed",
    "priority": "high",
    "due_date": "2024-12-31T23:59:59Z",
    "created_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-17T14:30:00Z",
    "assignee_name": "John Doe",
    "creator_name": "admin@acme.com"
  }
}
```

## Error Responses

### 1. Validation Error (422 Unprocessable Entity)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "value is not a valid email address",
      "code": "value_error.email"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter",
      "code": "value_error"
    }
  ]
}
```

### 2. Authentication Error (401 Unauthorized)
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 3. Authorization Error (403 Forbidden)
```json
{
  "success": false,
  "message": "Insufficient permissions. Required role: admin"
}
```

### 4. Not Found (404 Not Found)
```json
{
  "success": false,
  "message": "Task not found"
}
```

### 5. Rate Limit Exceeded (429 Too Many Requests)
```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again in a minute."
}
```

### 6. Bad Request (400 Bad Request)
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 7. Internal Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Response Headers

All responses include:
```
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

Rate-limited responses include:
```
Retry-After: 60
```

## Filtering Examples

### Filter by status
```
GET /api/v1/tasks?status=completed
```

### Filter by priority and status
```
GET /api/v1/tasks?status=in_progress&priority=high
```

### Search in title/description
```
GET /api/v1/tasks?search=authentication
```

### Pagination
```
GET /api/v1/tasks?page=2&limit=20
```

### Sort by due date
```
GET /api/v1/tasks?sort_by=due_date&sort_order=asc
```

### Combined filters
```
GET /api/v1/tasks?status=in_progress&priority=high&search=auth&page=1&limit=10&sort_by=due_date&sort_order=asc
```

## Member Role Example

When a member (non-admin) queries tasks, they only see their assigned tasks:

```bash
# Member A's request
GET /api/v1/tasks
Authorization: Bearer <member_token>

# Response (only shows tasks assigned to Member A)
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": "...",
      "assigned_to": "member-a-user-id",
      "title": "Task assigned to Member A",
      ...
    }
  ],
  "pagination": {...}
}
```

## Admin Role Example

Admin users see all tasks in their organization:

```bash
# Admin's request
GET /api/v1/tasks
Authorization: Bearer <admin_token>

# Response (shows all tasks in organization)
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": "...",
      "assigned_to": "member-a-user-id",
      "title": "Task assigned to Member A",
      ...
    },
    {
      "id": "...",
      "assigned_to": "member-b-user-id",
      "title": "Task assigned to Member B",
      ...
    }
  ],
  "pagination": {...}
}
```
