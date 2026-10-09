# Cloud Deployment Guide

This document explains how to deploy the Multi-Tenant Task Management SaaS Platform using free-tier cloud services.

## 1. Prerequisites

- GitHub account
- MongoDB Atlas account (Free Tier)
- Render account (Free Tier for Backend)
- Vercel or Netlify account (Free Tier for Frontend)

## 2. MongoDB Atlas Setup (Database Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a new free cluster (M0).
2. Choose a cloud provider (AWS/GCP/Azure) and a region close to your users.
3. Under **Database Access**, create a database user and securely copy the password.
4. Under **Network Access**, add `0.0.0.0/0` (or the specific IP of your Render backend) to allow inbound connections.
5. Go to **Databases** > **Connect** > **Drivers** and copy the connection string. Replace `<password>` with your database user password.
6. Note this connection string as `MONGODB_URI`.

## 3. GitHub Setup (Source Control)

1. Initialize a Git repository if not already done.
2. Commit all project files (ensure `.env` is ignored via `.gitignore`).
3. Push the repository to GitHub.

## 4. Backend Deployment (Render)

1. In Render, choose **New > Blueprint** and select the GitHub repository.
2. Confirm the `render.yaml` service, which uses the repository `Dockerfile`.
3. Set `MONGODB_URI` to the Atlas connection string and `ALLOWED_ORIGINS` to the expected Vercel URL.
4. Deploy and wait for `GET /health` to become healthy.
5. Copy the assigned API URL, for example `https://taskflow-api.onrender.com`.

The Docker image reads Render's `PORT` environment variable and falls back to
port `8000` for local Docker Compose.

## 5. Frontend Deployment (Vercel)

1. Go to [Vercel](https://vercel.com/) and create a new **Project**.
2. Connect the GitHub repository and set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**. The frontend `vercel.json` handles SPA refreshes.
4. Add Environment Variables:
   - `VITE_API_BASE_URL` = `<Your Render backend URL>` (without `/api/v1`)
5. Click **Deploy**.
6. Once deployed, note the frontend URL and update the `ALLOWED_ORIGINS` on Render if necessary.

## 6. Testing Production Deployment

1. Visit your frontend Vercel URL.
2. Register a new user and create an organization.
3. Log out and try to access restricted routes to test RBAC and authentication.
4. Navigate to the **Cloud Control Center** to verify MongoDB counts, backend request metrics, service health, and bounded simulations.

## 7. Demo accounts

For a classroom demonstration, seed repeatable MongoDB data with:

```powershell
docker compose exec app python seed_demo.py
```

All demo accounts use `Password123!`:

- `admin_a@demo.com` — Organization A admin
- `member_a@demo.com` — Organization A member
- `admin_b@demo.com` — Organization B admin

The login page includes buttons that fill these credentials automatically.

## 8. Troubleshooting Common Errors

- **500 Internal Server Error on Login:** Check Render logs. Likely an issue with `MONGODB_URI` or database network access. Ensure IP `0.0.0.0/0` is whitelisted in Atlas.
- **CORS Error in Browser Console:** Ensure the frontend URL in Vercel exactly matches the `ALLOWED_ORIGINS` environment variable in Render (no trailing slash).
- **Frontend failing to build:** Ensure all dependencies in `frontend/package.json` are correct and `VITE_API_BASE_URL` is properly prefixed.
