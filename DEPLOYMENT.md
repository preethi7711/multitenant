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
3. Set `MONGODB_URI` to the Atlas connection string and `ALLOWED_ORIGINS` to the deployed frontend origin. For Netlify, use the full site URL, such as `https://your-site.netlify.app` (without a trailing slash).
4. Deploy and wait for `GET /health` to become healthy.
5. Copy the assigned API URL, for example `https://taskflow-api.onrender.com`.

The Docker image reads Render's `PORT` environment variable and falls back to
port `8000` for local Docker Compose.

## 5. Frontend Deployment (Netlify)

1. In [Netlify](https://app.netlify.com/), choose **Add new site > Import an existing project**.
2. Select the GitHub repository.
3. Set **Base directory** to `frontend`.
4. Set **Build command** to `npm run build`.
5. Set **Publish directory** to `frontend/dist` when the base directory is blank, or `dist` when the base directory is `frontend`.
6. Add the environment variable:
   - `VITE_API_BASE_URL` = `<Your Render backend URL>` (without `/api/v1`)
7. Deploy and copy the generated `https://...netlify.app` URL.
8. In Render, set `ALLOWED_ORIGINS` to that exact Netlify URL and redeploy the API.

For Netlify deploy previews, set Render's optional `ALLOWED_ORIGIN_REGEX` to a
restricted pattern for your site, for example:

```text
^https://([a-z0-9-]+--)?chic-cannoli-f6588f\.netlify\.app$
```

Keep the production Netlify URL in `ALLOWED_ORIGINS` as well. Never use `.*`
as a global origin pattern.

Important: `VITE_API_BASE_URL` is compiled into the frontend at build time.
Changing it in Netlify requires a new deploy. If it is missing, the local
development fallback (`http://localhost:8000`) is used, which cannot work for
visitors to the deployed site.

The repository includes [`netlify.toml`](./netlify.toml) and
[`frontend/public/_redirects`](./frontend/public/_redirects) so React routes
continue working when a page is refreshed directly.

## 6. Frontend Deployment (Vercel)

1. Go to [Vercel](https://vercel.com/) and create a new **Project**.
2. Connect the GitHub repository and set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**. The frontend `vercel.json` handles SPA refreshes.
4. Add Environment Variables:
   - `VITE_API_BASE_URL` = `<Your Render backend URL>` (without `/api/v1`)
5. Click **Deploy**.
6. Once deployed, note the frontend URL and update `ALLOWED_ORIGINS` on Render if necessary.

## 7. Testing Production Deployment

1. Visit your frontend Vercel URL.
2. Register a new user and create an organization.
3. Log out and try to access restricted routes to test RBAC and authentication.
4. Navigate to the **Cloud Control Center** to verify MongoDB counts, backend request metrics, service health, and bounded simulations.

## 8. Demo accounts

For a classroom demonstration, seed repeatable MongoDB data with:

```powershell
docker compose exec app python seed_demo.py
```

All demo accounts use `Password123!`:

- `admin_a@demo.com` — Organization A admin
- `member_a@demo.com` — Organization A member
- `admin_b@demo.com` — Organization B admin

The login page includes buttons that fill these credentials automatically.

## 9. Troubleshooting Common Errors

- **500 Internal Server Error on Login:** Check Render logs. Likely an issue with `MONGODB_URI` or database network access. Ensure IP `0.0.0.0/0` is whitelisted in Atlas.
- **CORS Error in Browser Console:** Ensure the frontend URL in Netlify exactly matches the `ALLOWED_ORIGINS` environment variable in Render (no trailing slash), then redeploy the Render service.
- **Netlify CORS Error:** Add both the Netlify production URL and any Netlify deploy-preview URL you use as comma-separated origins in Render, for example `https://app.netlify.app,https://deploy-preview-42--app.netlify.app`.
- **Requests go to `localhost:8000`:** Set `VITE_API_BASE_URL` in Netlify to the Render URL, trigger a new deploy, and confirm the browser request starts with `https://<your-render-service>.onrender.com/api/v1`.
- **Frontend failing to build:** Ensure all dependencies in `frontend/package.json` are correct and `VITE_API_BASE_URL` is properly prefixed.
