# Cloud Computing Micro Project Report
## Multi-Tenant Task Management SaaS Platform

### 1. Introduction
This project demonstrates a fully functional, cloud-based Multi-Tenant Task Management SaaS platform. It is designed to showcase real-world cloud computing concepts including managed cloud databases, containerized backend services, edge CDN frontend delivery, and logical multi-tenancy.

### 2. Problem Statement
Traditional local web applications fail to demonstrate the distributed, scalable, and isolated nature of cloud software. The goal was to transform a basic task management system into a cloud-native SaaS application where multiple organizations can securely manage their tasks on shared infrastructure without data leakage.

### 3. Objectives
- Implement a **Multi-Tenant Architecture** using a shared database with logical isolation.
- Deploy a separated frontend and backend on distinct cloud platforms.
- Utilize a fully managed cloud database (MongoDB Atlas).
- Implement strict Role-Based Access Control (RBAC) and IDOR prevention.
- Build a **Cloud Control Center** to simulate and monitor load, failures, and multi-tenant scaling.

### 4. Cloud Architecture & Technology Stack
- **Frontend:** React, Vite, Tailwind CSS (Deployed on Vercel/Netlify)
- **Backend:** FastAPI, Python (Containerized, Deployed on Render)
- **Database:** MongoDB Atlas (Free Tier)
- **Authentication:** JWT (JSON Web Tokens)
- **Source Control & CI/CD:** GitHub

### 5. Multi-Tenant Architecture and Tenant Isolation
The system uses a **Shared Database + Shared Collection** model.
Every document (task, user, project) contains a `tenant_id` field. The backend middleware automatically extracts the user's `tenant_id` from their secure JWT and forcefully injects it into every database query.
This ensures that Tenant A can never query, update, or delete Tenant B's data, providing robust logical isolation over shared physical cloud resources.

### 6. Cloud Services and Integration
- **Vercel -> Render:** The React frontend communicates over HTTPS REST APIs to the Render backend.
- **Render -> MongoDB Atlas:** The FastAPI backend uses the Motor asynchronous driver to maintain a secure, connection-pooled TLS link to the Atlas cluster.
- **GitHub -> Cloud Providers:** Pushing code to GitHub triggers automated build and deployment pipelines on both Vercel and Render.

### 7. Cloud Simulation & Monitoring
To fulfill academic evaluation requirements, a **Cloud Control Center** was implemented. This module allows evaluators to:
1. Generate multiple dummy tenants and simulate user load.
2. View real-time simulated API latency and success rates.
3. Check the health status of the Frontend, Backend, and Database.
4. Verify tenant isolation dynamically.

### 8. Security
- **Authentication:** Secure password hashing and stateless JWTs.
- **Environment Variables:** Credentials like `MONGODB_URI` are securely stored in cloud provider settings, never committed to the repository.
- **Cross-Origin Resource Sharing (CORS):** Backend only accepts requests from the authenticated Vercel domain.

### 9. Results
The application successfully operates as a cloud-native SaaS. It demonstrates elasticity (stateless backend), broad network access (HTTPS/internet availability), resource pooling (multi-tenancy), and measured service (simulated monitoring).

### 10. Conclusion
This project successfully transitions a local web application into a verifiable Cloud Computing architecture, highlighting the complexities and benefits of managed databases, distributed deployment, and logical tenant isolation.
