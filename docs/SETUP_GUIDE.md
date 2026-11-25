# Setup & Deployment Guide

This guide describes how to install, configure, run, and deploy the Enterprise HRMS application in local and production environments.

---

## 1. Local Environment Requirements

Ensure the host system has the following installed:
- **Node.js:** v18.18.0 or newer (v20.x LTS recommended)
- **npm:** v9.x or newer
- **MongoDB:** MongoDB Atlas account or local MongoDB 6+ community server
- **Cloudinary Account:** For cloud file storage (free tier works)

---

## 2. Step-by-Step Local Setup

### Step 2.1: Clone and Review
```bash
git clone https://github.com/harshshaah/hrms-enterprise-system.git
cd hrms-enterprise-system
```

### Step 2.2: Backend Configuration & Startup
1. Navigate into the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Populate `.env` with actual credentials:
   - Set `MONGODB_URI` to your MongoDB connection string.
   - Set `JWT_SECRET` to a 32+ character random string.
   - Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
4. Build and start the development server:
   ```bash
   npm run start:dev
   ```
   The NestJS API will be available at `http://localhost:5002/api/v1`.

### Step 2.3: Frontend Configuration & Startup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   npm install
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The web application will open at `http://localhost:5173`.

---

## 3. Production Build Instructions

### Backend Production Build
```bash
cd backend
npm run build
npm run start:prod
```
The compiled output is located in `backend/dist/main.js`.

### Frontend Production Build
```bash
cd frontend
npm run build
```
The production bundle is generated in `frontend/dist/`. Serve this directory using Nginx, Cloudflare Pages, Vercel, or AWS S3 + CloudFront.

---

## 4. Production Security Checklist

1. Replace default JWT secret with a cryptographically generated 256-bit key.
2. Restrict CORS origins in `backend/src/main.ts` to your production frontend domain.
3. Configure MongoDB IP access lists in MongoDB Atlas to permit only backend server IPs.
4. Ensure TLS/HTTPS is active across all endpoints.

