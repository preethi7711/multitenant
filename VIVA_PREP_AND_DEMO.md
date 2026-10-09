# Viva Preparation & Demonstration Flow

## K. Viva Preparation (20 Likely Questions)

### Cloud Architecture & Concepts
1. **What makes this application a "Cloud" application rather than just a hosted website?**
   *Answer:* It utilizes cloud-native patterns like stateless backend containers (Render), edge-delivered frontend (Vercel), and a fully managed Database-as-a-Service (MongoDB Atlas). It demonstrates resource pooling via multi-tenancy.
2. **Explain the NIST cloud characteristics demonstrated in your project.**
   *Answer:* Broad network access (HTTPS), Resource Pooling (Multi-tenancy), On-demand self-service (tenant registration), Elasticity (stateless backend can scale), and Measured service (Cloud Control Center metrics).
3. **Why did you separate the frontend and backend onto different cloud providers?**
   *Answer:* To utilize the best tool for the job. Vercel optimizes static asset delivery via edge CDNs, while Render provides containerized environments for backend compute processes.

### Database & MongoDB Atlas
4. **Where is your data physically stored?**
   *Answer:* In MongoDB Atlas, a fully managed cloud database.
5. **Why did you choose MongoDB over a relational database like MySQL?**
   *Answer:* Its document-based model is flexible for rapid SaaS iteration, and MongoDB Atlas provides an excellent free-tier cloud environment with built-in security and scaling.
6. **How does your backend connect to the cloud database?**
   *Answer:* Using a secure connection string (URI) stored in environment variables, utilizing the asynchronous Motor driver for Python.
7. **What happens if the cloud database goes down?**
   *Answer:* The backend health check will report DB failure, and API requests will return 500 errors. Atlas provides high availability, so true downtime is rare.

### Multi-Tenancy & Tenant Isolation
8. **What does "Multi-Tenancy" mean in your architecture?**
   *Answer:* Multiple organizations (tenants) use the exact same cloud infrastructure and application instance, but their data and workflows are completely isolated from each other.
9. **How did you achieve tenant isolation?**
   *Answer:* Through logical isolation using a `tenant_id` field on every MongoDB document. The backend automatically injects this ID into all database queries based on the authenticated user.
10. **Can Tenant A access Tenant B's data by guessing a URL or ID?**
   *Answer:* No. This is prevented by IDOR (Insecure Direct Object Reference) protection. The backend query will look for `id = X AND tenant_id = A`, which will return null for Tenant B's data.

### Deployment & CI/CD
11. **How is the application deployed?**
   *Answer:* The code is pushed to GitHub, which triggers webhooks on Vercel and Render. They automatically pull the new code, build it, and deploy it.
12. **What are Environment Variables and why are they important?**
   *Answer:* They store configuration and secrets (like DB passwords) outside the codebase. This prevents exposing credentials if the source code is compromised.
13. **Why did you use Docker / Containerization?**
   *Answer:* It ensures the application runs exactly the same way in the cloud (Render) as it does on a local machine, eliminating "it works on my machine" errors.

### Security
14. **How do you authenticate users?**
   *Answer:* Using JSON Web Tokens (JWT). The token contains the user's ID, role, and tenant ID, signed securely by the backend.
15. **What is RBAC and how is it implemented?**
   *Answer:* Role-Based Access Control. Users are assigned roles (Admin, Member). The backend checks the role before allowing actions like creating or deleting tasks.
16. **Is it safe to store the database password in the frontend code?**
   *Answer:* No, that is highly insecure. The database is only accessed by the backend; the frontend only communicates with the backend via REST API.

### Simulation & Monitoring
17. **How does your Cloud Control Center simulate load?**
   *Answer:* It generates synthetic API requests and mock tenant data to demonstrate how the system handles multiple organizations and tracks metrics like latency and success rates.
18. **Why is application logging important in the cloud?**
   *Answer:* Since you don't have access to the physical server, centralized logs are the only way to debug errors, track user actions (audit logs), and monitor security events.
19. **What metrics are you monitoring?**
   *Answer:* Service health status (DB, API, Frontend), active tenants, active users, total tasks, and API request statistics (success/fail/latency).
20. **What was the most challenging part of migrating this to the cloud?**
   *Answer:* Ensuring strict tenant isolation in the database queries and configuring CORS (Cross-Origin Resource Sharing) between the frontend and backend domains.

---

## L. Demonstration Flow (5-10 Minutes)

1. **Architecture Overview (1 min):**
   - Briefly show the `CLOUD_ARCHITECTURE.md` diagram.
   - Explain the 3 cloud components: Vercel (Frontend), Render (Backend), MongoDB Atlas (Database).

2. **System Health & Simulation (2 mins):**
   - Open the **Cloud Control Center**.
   - Show the Health Status (All green/connected).
   - Click "Generate Demo Tenants" to simulate multi-tenant onboarding.
   - Click "Run Load Simulation" and show the metrics updating.

3. **Multi-Tenancy & Isolation Demo (3 mins):**
   - Log in as a user from **Tenant A (Acme Corp)**.
   - Create a task: "Acme Cloud Migration".
   - Open a private/incognito window.
   - Log in as a user from **Tenant B (TechSoft)**.
   - Show that Tenant B **cannot** see the "Acme Cloud Migration" task.
   - Copy the Task ID from Tenant A and try to access it directly via API/URL in Tenant B to prove IDOR protection works (it will fail).

4. **Cloud Database Verification (1 min):**
   - (Optional if evaluator asks) Open MongoDB Atlas web interface.
   - Show the `tasks` collection and point out the `tenant_id` field on the documents, proving data is actually in the cloud and how it's isolated.

5. **Deployment & CI/CD Verification (1 min):**
   - Show the GitHub repository.
   - Point out that there are no passwords in the code.
   - Briefly explain how pushing to GitHub automatically updates the live Vercel/Render URLs.
