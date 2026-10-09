# Testing Guide

## Prerequisites
- System is running (`./start.sh` or `docker-compose up`)
- curl or Postman installed

## Complete Test Workflow

### Step 1: Verify System Health

```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy",...}
```

### Step 2: Register First User (Admin)

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@acme.com",
    "password": "SecurePass123!",
    "full_name": "Admin User",
    "organization_name": "Acme Corporation"
  }' | jq

# Save the access_token from response
export ADMIN_TOKEN="<access_token_from_response>"
export ADMIN_USER_ID="<user_id_from_response>"
```

### Step 3: Register Second User (Member)

First login as admin, then you'd typically create users via an admin endpoint. For this demo, register another user:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@acme.com",
    "password": "SecurePass123!",
    "full_name": "Member User",
    "organization_name": "Acme Corporation"
  }' | jq

export MEMBER_TOKEN="<access_token_from_response>"
export MEMBER_USER_ID="<user_id_from_response>"
```

**Note**: In production, you'd have a user creation endpoint that enforces same organization.

### Step 4: Test Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@acme.com",
    "password": "SecurePass123!"
  }' | jq
```

### Step 5: Create Tasks (As Admin)

```bash
# Task 1 - Assigned to Admin
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"title\": \"Design database schema\",
    \"description\": \"Create multi-tenant PostgreSQL schema with RBAC\",
    \"assigned_to\": \"$ADMIN_USER_ID\",
    \"priority\": \"high\",
    \"status\": \"in_progress\"
  }" | jq

export TASK1_ID="<id_from_response>"

# Task 2 - Assigned to Member
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"title\": \"Implement authentication API\",
    \"description\": \"Build JWT-based auth with refresh tokens\",
    \"assigned_to\": \"$MEMBER_USER_ID\",
    \"priority\": \"urgent\",
    \"status\": \"pending\",
    \"due_date\": \"2024-12-31T23:59:59Z\"
  }" | jq

export TASK2_ID="<id_from_response>"

# Task 3 - Another task for filtering tests
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"title\": \"Write API documentation\",
    \"description\": \"Document all endpoints with examples\",
    \"assigned_to\": \"$ADMIN_USER_ID\",
    \"priority\": \"medium\",
    \"status\": \"completed\"
  }" | jq
```

### Step 6: List Tasks (Admin sees all)

```bash
curl -X GET "http://localhost:8000/api/v1/tasks?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

### Step 7: List Tasks (Member sees only assigned)

```bash
curl -X GET "http://localhost:8000/api/v1/tasks" \
  -H "Authorization: Bearer $MEMBER_TOKEN" | jq

# Should only return tasks assigned to MEMBER_USER_ID
```

### Step 8: Test Filtering

```bash
# Filter by status
curl "http://localhost:8000/api/v1/tasks?status=completed" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Filter by priority
curl "http://localhost:8000/api/v1/tasks?priority=high" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Search in title/description
curl "http://localhost:8000/api/v1/tasks?search=authentication" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Combined filters
curl "http://localhost:8000/api/v1/tasks?status=in_progress&priority=high&sort_by=created_at&sort_order=desc" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

### Step 9: Update Task

```bash
curl -X PUT "http://localhost:8000/api/v1/tasks/$TASK1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "completed",
    "priority": "medium"
  }' | jq
```

### Step 10: Get Single Task

```bash
curl "http://localhost:8000/api/v1/tasks/$TASK1_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

### Step 11: Test RBAC - Member tries to access admin's task

```bash
# This should fail if the member tries to access a task not assigned to them
curl "http://localhost:8000/api/v1/tasks/$TASK1_ID" \
  -H "Authorization: Bearer $MEMBER_TOKEN" | jq

# Expected: 404 Not Found (task exists but member doesn't have access)
```

### Step 12: Test RBAC - Member tries to delete task

```bash
curl -X DELETE "http://localhost:8000/api/v1/tasks/$TASK2_ID" \
  -H "Authorization: Bearer $MEMBER_TOKEN" | jq

# Expected: 403 Forbidden (only admins can delete)
```

### Step 13: Delete Task (As Admin)

```bash
curl -X DELETE "http://localhost:8000/api/v1/tasks/$TASK2_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# Expected: 200 OK with success message
```

### Step 14: Test Token Refresh

```bash
# Get refresh token from login response
export REFRESH_TOKEN="<refresh_token_from_login>"

curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refresh_token\": \"$REFRESH_TOKEN\"
  }" | jq
```

### Step 15: Test Logout

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d "{
    \"refresh_token\": \"$REFRESH_TOKEN\"
  }" | jq
```

## Security Test Cases

### Test 1: Invalid JWT Token
```bash
curl "http://localhost:8000/api/v1/tasks" \
  -H "Authorization: Bearer invalid_token" | jq

# Expected: 401 Unauthorized
```

### Test 2: Missing Authorization Header
```bash
curl "http://localhost:8000/api/v1/tasks" | jq

# Expected: 401 Unauthorized
```

### Test 3: Weak Password Registration
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "weak",
    "full_name": "Test User",
    "organization_name": "Test Org"
  }' | jq

# Expected: 422 Validation Error
```

### Test 4: Cross-Tenant Access Attempt

Register a user in different organization and try to access tasks:

```bash
# Register user in different org
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "attacker@evil.com",
    "password": "SecurePass123!",
    "full_name": "Attacker",
    "organization_name": "Evil Corp"
  }' | jq

export ATTACKER_TOKEN="<access_token>"

# Try to access Acme Corp's tasks
curl "http://localhost:8000/api/v1/tasks/$TASK1_ID" \
  -H "Authorization: Bearer $ATTACKER_TOKEN" | jq

# Expected: 404 Not Found (task doesn't exist in their org)
```

## Rate Limiting Tests

```bash
# Send 70 requests in quick succession
for i in {1..70}; do
  curl -s "http://localhost:8000/api/v1/tasks" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -o /dev/null -w "Request $i: %{http_code}\n"
  sleep 0.1
done

# After 60 requests per minute, should see 429 Too Many Requests
```

## Pagination Tests

```bash
# Create multiple tasks first
for i in {1..25}; do
  curl -X POST http://localhost:8000/api/v1/tasks \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{
      \"title\": \"Task $i\",
      \"description\": \"Test task for pagination\",
      \"assigned_to\": \"$ADMIN_USER_ID\",
      \"priority\": \"medium\",
      \"status\": \"pending\"
    }" -s > /dev/null
done

# Test pagination
curl "http://localhost:8000/api/v1/tasks?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.pagination'

curl "http://localhost:8000/api/v1/tasks?page=2&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.pagination'

curl "http://localhost:8000/api/v1/tasks?page=3&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.pagination'
```

## Audit Log Verification

Check database for audit logs:

```bash
docker-compose exec postgres psql -U taskuser -d taskdb -c "
  SELECT 
    entity_type, 
    action, 
    created_at,
    changes->>'action' as change_action
  FROM audit_logs 
  ORDER BY created_at DESC 
  LIMIT 10;
"
```

## Performance Test (Simple)

```bash
# Test concurrent requests
time seq 1 100 | xargs -P 10 -I {} curl -s \
  "http://localhost:8000/api/v1/tasks?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -o /dev/null
```

## Expected Behaviors

### ✅ Success Cases
- Admin can create/read/update/delete all tasks
- Member can create/read/update only assigned tasks
- Member cannot delete tasks
- Users can only see tasks in their organization
- Pagination returns correct metadata
- Filtering works correctly
- Search works across title and description
- Audit logs track all changes

### ❌ Failure Cases (Expected to fail)
- Invalid JWT returns 401
- Missing auth returns 401
- Cross-tenant access returns 404
- Member deleting task returns 403
- Weak password returns 422
- Rate limit exceeded returns 429
- Invalid email format returns 422

## Clean Up

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v
```
