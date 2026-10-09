# Cloud Architecture

This document describes the architectural design and integration of the Multi-Tenant Task Management SaaS platform.

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Client
        User[Browser / Client]
    end

    subgraph Frontend Cloud (Vercel)
        UI[React + Vite Frontend]
    end

    subgraph Backend Cloud (Render)
        API[FastAPI REST API]
        Auth[Authentication & RBAC]
        TenantMgr[Tenant Isolation Layer]
        TaskEng[Task Engine]
        CloudSim[Cloud Control Center]
    end

    subgraph Database Cloud (MongoDB Atlas)
        DB[(MongoDB Cluster)]
    end

    subgraph Monitoring & CI/CD
        GH[GitHub Actions CI/CD]
    end

    User -- HTTPS --> UI
    UI -- REST API / HTTPS --> API
    API --> Auth
    API --> CloudSim
    Auth --> TenantMgr
    TenantMgr --> TaskEng
    TaskEng -- Secure Connection --> DB
    CloudSim -- Read Metrics --> DB
    
    GH -- Deploy --> UI
    GH -- Deploy --> API
```

## Cloud Services

- **Vercel / Netlify:** Hosts the React frontend as static assets globally via CDN, ensuring high availability and low latency for clients.
- **Render:** Runs the FastAPI backend in a containerized Docker environment, automatically building from GitHub and handling TLS routing.
- **MongoDB Atlas:** Managed cloud database. Provides automated backups, high availability, scaling, and secure network access.
- **GitHub:** Source control and deployment triggering via webhooks.

## Multi-Tenancy Model

The application uses a **Shared Database, Shared Schema** architecture. All tenants (organizations) share the same MongoDB database and collections.

### Logical Isolation

Isolation is achieved logically through a `tenant_id` (or `organization_id`) field on every document. 
The backend middleware intercepts every request, validates the JWT, extracts the user's `organization_id`, and automatically scopes all database queries to that specific ID. 
This prevents Insecure Direct Object Reference (IDOR) and cross-tenant data leakage.

```json
{
  "_id": "648a1b2c...",
  "tenant_id": "org_789",
  "assigned_to": "user_456",
  "title": "Implement API",
  "status": "in_progress"
}
```

## Data Flow

1. **Client Request:** User authenticates via the React frontend.
2. **API Processing:** The frontend sends an HTTPS REST request to the FastAPI backend with the JWT in the Authorization header.
3. **Authentication Layer:** FastAPI validates the JWT, extracting user context and `tenant_id`.
4. **RBAC Validation:** The request route checks the user's role (Admin, Member, Viewer) against the required permissions.
5. **Database Operation:** Motor (PyMongo) constructs an asynchronous query, strictly appending the `tenant_id` filter, and executes it against MongoDB Atlas.
6. **Audit & Response:** The operation is logged in the `audit_logs` collection, and a sanitized JSON response is returned to the client.

## Security Mechanisms

- **HTTPS Only:** All client-server and server-database communication is encrypted in transit.
- **Stateless Authentication:** JWT-based authentication allows backend servers to scale horizontally without maintaining session state.
- **Environment Variables:** All secrets (Database URIs, JWT Secrets) are stored securely in cloud provider environment variables, not in code.
- **CORS Policies:** The backend only accepts cross-origin requests from explicitly configured frontend domains.

## Scalability & Failure Handling

- The frontend is served via Edge CDN (Vercel), which handles arbitrary traffic spikes gracefully.
- The FastAPI backend is entirely stateless, allowing Render to scale out instances behind a load balancer if needed.
- MongoDB Atlas manages replication and failover automatically.
- The **Cloud Control Center** provides simulation mechanisms to test database unavailability, API latency, and tenant load scaling.
