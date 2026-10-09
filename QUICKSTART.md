# QUICK START GUIDE

## 🚀 Get Running in 2 Minutes

### Step 1: Navigate to Project
```bash
cd task-management-system
```

### Step 2: Configure Environment
```bash
cp .env.example .env

# Edit .env and set a secure JWT secret:
# JWT_SECRET_KEY=<generate-random-64-char-string>

# On Linux/Mac, generate secure key:
openssl rand -hex 32
```

### Step 3: Start System
```bash
chmod +x start.sh
./start.sh
```

### Step 4: Test API
```bash
# Health check
curl http://localhost:8000/health

# View docs
open http://localhost:8000/docs
```

## 📝 First API Call

```bash
# Register admin user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePass123!",
    "full_name": "Admin User",
    "organization_name": "My Company"
  }'

# Copy the access_token from response
export TOKEN="<paste_access_token_here>"

# Create a task
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "My First Task",
    "description": "Testing the API",
    "assigned_to": "<paste_user_id_from_register>",
    "priority": "high",
    "status": "pending"
  }'

# List tasks
curl "http://localhost:8000/api/v1/tasks" \
  -H "Authorization: Bearer $TOKEN"
```

## 📚 Documentation Files

- **README.md** - Complete setup and feature documentation
- **TESTING.md** - Comprehensive testing guide with curl commands
- **API_RESPONSES.md** - Example request/response payloads
- **CRITICAL_REVIEW.md** - Professional code review with ratings

## 🔧 Useful Commands

```bash
# View logs
docker-compose logs -f app

# Access PostgreSQL
docker-compose exec postgres psql -U taskuser -d taskdb

# Stop services
docker-compose down

# Reset everything (WARNING: deletes data)
docker-compose down -v
```

## 📊 What's Included

✅ Multi-tenant task management  
✅ JWT authentication with refresh tokens  
✅ Role-based access control (Admin/Member)  
✅ Pagination, filtering, search  
✅ Audit logging  
✅ Rate limiting  
✅ Structured logging  
✅ Google OAuth ready  
✅ Dockerized deployment  

## 🎯 Architecture Highlights

- **Clean Architecture**: Routes → Controllers → Services → Repositories
- **Tenant Isolation**: Every query enforced at repository layer
- **Security Layers**: Middleware (auth) → RBAC → Repository (org_id filtering)
- **Production-Ready**: Async/await, connection pooling, health checks

## ⚠️ Before Production

1. Change `JWT_SECRET_KEY` to secure random value (min 64 chars)
2. Set `DEBUG=False`
3. Add database migrations (Alembic)
4. Write tests (see TESTING.md for examples)
5. Set up monitoring and logging aggregation
6. Review CRITICAL_REVIEW.md for improvement areas

## 📞 Support

For detailed explanations, see:
- Architecture decisions → README.md
- API endpoints → API_RESPONSES.md
- Testing procedures → TESTING.md
- Code quality review → CRITICAL_REVIEW.md

---

**Built for:** Software Engineering Internship  
**Standard:** Production-Grade Backend System  
**Tech Stack:** FastAPI • PostgreSQL • SQLAlchemy • Docker • JWT
