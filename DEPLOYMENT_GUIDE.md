# 🚀 Zimyo SaaS Enterprise HRMS — Production Deployment Guide

This document provides complete instructions for deploying the **Zimyo-Style Multi-Tenant SaaS HRMS Platform** to production environments.

---

## 📌 Architecture Overview

```
                      [ Internet Traffic ]
                               │
               ┌───────────────┴───────────────┐
               │                               │
       [ Frontend (SPA) ]              [ Backend API ]
      React 19 + Vite + Nginx          NestJS v12 + Express
         Port: 80 / 443                    Port: 5002
               │                               │
               └───────────────┬───────────────┘
                               │
                       [ MongoDB Database ]
                    MongoDB Atlas / Local Mongo
                           Port: 27017
```

---

## Option 1: 1-Click Docker Compose (Recommended for VPS / Cloud VMs)

### Prerequisites
- Docker engine & Docker Compose installed (`docker --version`, `docker compose version`).

### Steps:
1. Clone the repository to your server:
   ```bash
   git clone https://github.com/harshshaah/hrms-enterprise-system.git
   cd hrms-enterprise-system
   ```

2. (Optional) Provide custom environment values in `backend/.env` or edit `docker-compose.yml`.

3. Launch all containers in detached mode:
   ```bash
   docker compose up -d --build
   ```

4. Verify status:
   ```bash
   docker compose ps
   docker compose logs -f backend
   ```

5. Access your platform:
   - **Frontend UI:** `http://<your-server-ip>`
   - **Backend API:** `http://<your-server-ip>:5002/api/v1`

---

## Option 2: Cloud Managed Deployment (Vercel + Render / Railway)

### 1. Database (MongoDB Atlas)
- Create a free or dedicated cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Whitelist all IPs (`0.0.0.0/0`) under Network Access.
- Obtain the connection URI:
  ```
  mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/hrms_enterprise?retryWrites=true&w=majority
  ```

### 2. Backend (Render / Railway / AWS App Runner)
- **Root Directory:** `backend`
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm run start:prod`
- **Environment Variables:**
  ```env
  PORT=5002
  NODE_ENV=production
  MONGODB_URI=your_mongodb_atlas_uri
  JWT_SECRET=generate_a_random_32_char_secret
  JWT_EXPIRES_IN=7d
  FRONTEND_URL=https://your-frontend-domain.vercel.app
  CLOUDINARY_CLOUD_NAME=your_cloudinary_name
  CLOUDINARY_API_KEY=your_cloudinary_key
  CLOUDINARY_API_SECRET=your_cloudinary_secret
  RAZORPAY_KEY_ID=rzp_live_your_key_id
  RAZORPAY_KEY_SECRET=your_razorpay_secret
  SMTP_HOST=smtp.sendgrid.net
  SMTP_PORT=587
  SMTP_USER=apikey
  SMTP_PASS=your_sendgrid_api_key
  ```

### 3. Frontend (Vercel / Netlify / Cloudflare Pages)
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  ```env
  VITE_API_BASE_URL=https://your-backend-api.onrender.com/api/v1
  ```
- Configure SPA Rewrites (for Vercel create `vercel.json`):
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

## Option 3: Production Ubuntu VPS (Nginx + PM2 + SSL)

### 1. Setup Node.js & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2
```

### 2. Run Backend with PM2
```bash
cd backend
npm ci
npm run build
pm2 start dist/main.js --name "hrms-backend"
pm2 save
pm2 startup
```

### 3. Build & Serve Frontend with Nginx
```bash
cd ../frontend
npm ci
VITE_API_BASE_URL="https://yourdomain.com/api/v1" npm run build
sudo cp -r dist/* /var/www/hrms/
```

### 4. Nginx Reverse Proxy Configuration
Add to `/etc/nginx/sites-available/hrms`:
```nginx
server {
    server_name yourdomain.com;

    root /var/www/hrms;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/v1/ {
        proxy_pass http://localhost:5002/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and activate free SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/hrms /etc/nginx/sites-enabled/
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
sudo systemctl restart nginx
```

---

## 🔐 Production Health & Verification Checklist

- [ ] Multi-tenant isolation active across all endpoints.
- [ ] MongoDB compound indexes created for attendance and payroll uniqueness.
- [ ] JWT tokens using strong production secret (`JWT_SECRET`).
- [ ] SSL/TLS HTTPS certificate enabled for secure communication.
- [ ] Razorpay webhook and webhook secret verified.
- [ ] SMTP email dispatch verified with live email address.

