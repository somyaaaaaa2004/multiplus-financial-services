# 🚀 Complete Deployment Guide - Multiplus Financial Services

This guide will walk you through deploying both the backend (Railway) and frontend (Vercel) step-by-step.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Railway)](#backend-deployment-railway)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Connecting Frontend to Backend](#connecting-frontend-to-backend)
5. [Testing Production Deployment](#testing-production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, make sure you have:

- ✅ Git repository with your code (GitHub, GitLab, or Bitbucket)
- ✅ Railway account ([railway.app](https://railway.app) - free tier available)
- ✅ Vercel account ([vercel.com](https://vercel.com) - free tier available)
- ✅ MySQL database (Railway can provision this for you)
- ✅ Gmail account for email services (or other SMTP provider)

---

## Backend Deployment (Railway)

### Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"** button
3. Select **"Deploy from GitHub repo"** (or your Git provider)
4. Choose your repository
5. Railway will automatically detect the `backend` folder

### Step 2: Configure Root Directory (if monorepo)

If your project has both `backend` and `frontend` folders:

1. Click on your project
2. Go to **Settings** tab
3. Scroll to **"Root Directory"**
4. Set it to: `backend`
5. Click **"Update"**

### Step 3: Provision MySQL Database

**Option A: Railway MySQL (Recommended for beginners)**

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add MySQL"**
3. Railway creates a MySQL database automatically
4. Click on the MySQL service
5. Go to **"Variables"** tab
6. Copy the connection details:
   - `MYSQLHOST` → This is your `DB_HOST`
   - `MYSQLUSER` → This is your `DB_USER`
   - `MYSQLPASSWORD` → This is your `DB_PASSWORD`
   - `MYSQLDATABASE` → This is your `DB_NAME`
   - `MYSQLPORT` → Usually 3306

### Step 4: Set Environment Variables

1. Click on your backend service (not the MySQL service)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** for each variable below:

#### Required Variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production
HOST=0.0.0.0

# Database Configuration (from MySQL service above)
DB_HOST=containers-us-west-xxx.railway.app
DB_USER=root
DB_PASSWORD=your-password-here
DB_NAME=railway
DB_PORT=3306

# JWT Secret (generate a strong random string - at least 32 characters)
# You can use: openssl rand -hex 32
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# CORS Configuration (we'll update this after frontend deployment)
# For now, set it temporarily to allow all (we'll change it later)
CORS_ORIGIN=*

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

**Important Notes:**
- **JWT_SECRET**: Generate a strong random string. Never commit this to Git!
- **CORS_ORIGIN**: We'll update this after deploying the frontend
- **SMTP_PASS**: This is NOT your Gmail password. See "Gmail App Password Setup" below

#### Gmail App Password Setup

1. Go to your Google Account settings
2. Enable **2-Factor Authentication**
3. Go to **Security** → **2-Step Verification**
4. Scroll to **"App passwords"**
5. Generate a new app password for "Mail"
6. Use this 16-character password as `SMTP_PASS`

### Step 5: Deploy

1. Railway automatically deploys when you connect the repo
2. Check the **"Deployments"** tab to see build progress
3. Wait for deployment to complete (usually 2-3 minutes)
4. Railway will assign a public URL (e.g., `https://your-backend.railway.app`)

### Step 6: Verify Backend Deployment

1. Open your Railway backend URL in a browser
2. Add `/api/health` to the URL:
   ```
   https://your-backend.railway.app/api/health
   ```
3. You should see:
   ```json
   {
     "success": true,
     "message": "Multiplus Financial Services API is running",
     "timestamp": "...",
     "environment": "production"
   }
   ```
4. ✅ Backend is deployed successfully!

**Copy your Railway backend URL** - you'll need it for the frontend configuration.

---

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will automatically detect React

### Step 2: Configure Build Settings

If your project has both `backend` and `frontend` folders:

1. In **"Configure Project"**:
   - **Root Directory**: Click **"Edit"** → Select `frontend` folder
   - **Framework Preset**: Create React App (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `build` (default)
   - **Install Command**: `npm install` (default)

2. Click **"Continue"**

### Step 3: Set Environment Variables

**Before deploying**, add the environment variable:

1. In the **"Environment Variables"** section
2. Click **"+ Add"**
3. Add this variable:

```env
REACT_APP_API_BASE_URL=https://your-backend.railway.app
```

**Important:**
- Replace `https://your-backend.railway.app` with your actual Railway backend URL
- ⚠️ **No trailing slash** (don't add `/` at the end)
- The `/api` suffix is automatically added by the frontend code

### Step 4: Deploy

1. Click **"Deploy"** button
2. Vercel will:
   - Install dependencies
   - Build the React app
   - Deploy to production
3. Wait 2-3 minutes for deployment to complete
4. Vercel will assign a URL (e.g., `https://your-app.vercel.app`)

**Copy your Vercel frontend URL** - you'll need it to update backend CORS.

### Step 5: Update Backend CORS

Now that both are deployed, update the backend to allow your frontend:

1. Go back to **Railway Dashboard**
2. Click on your backend service
3. Go to **"Variables"** tab
4. Find `CORS_ORIGIN` variable
5. Click **"Edit"**
6. Replace `*` with your Vercel URL:
   ```
   https://your-app.vercel.app
   ```
7. Click **"Update"**
8. Railway will automatically redeploy with the new CORS setting

**For multiple origins** (production + staging):
```
https://your-app.vercel.app,https://staging-your-app.vercel.app
```

---

## Connecting Frontend to Backend

### Step 1: Verify Environment Variables

**In Vercel:**
- ✅ `REACT_APP_API_BASE_URL` = `https://your-backend.railway.app`

**In Railway:**
- ✅ `CORS_ORIGIN` = `https://your-app.vercel.app`

### Step 2: Trigger Frontend Redeploy

After updating backend CORS, redeploy frontend to ensure fresh connection:

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **"Deployments"** tab
4. Click **"..."** (three dots) on latest deployment
5. Click **"Redeploy"**

### Step 3: Test Connection

1. Open your Vercel frontend URL
2. Open browser **Developer Tools** (F12)
3. Go to **"Console"** tab
4. Go to **"Network"** tab
5. Try to login or register
6. Check if API calls are going to your Railway backend URL
7. Verify there are no CORS errors

---

## Testing Production Deployment

### Test 1: Health Check

```bash
# Test backend health endpoint
curl https://your-backend.railway.app/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Multiplus Financial Services API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### Test 2: Frontend Login Flow

1. Visit: `https://your-app.vercel.app/login`
2. Try to register a new account
3. Check if OTP email is received
4. Verify OTP and reset password
5. Login with credentials
6. Check if dashboard loads

### Test 3: API Authentication

```bash
# Register a new user
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Login (save the token from response)
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Use token for authenticated request
curl https://your-backend.railway.app/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 4: HTTPS Security

1. Verify both URLs use **HTTPS** (not HTTP)
2. Check browser shows **lock icon** 🔒
3. Test that HTTP redirects to HTTPS (if configured)

### Test 5: Financial Health API

```bash
# Get demo data
curl https://your-backend.railway.app/api/financial-health/demo \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Calculate score
curl -X POST https://your-backend.railway.app/api/financial-health/score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "monthlyIncome": 50000,
    "monthlyExpenses": 30000,
    "totalDebt": 100000,
    "emergencyFundMonths": 6,
    "investmentAmount": 50000,
    "creditScoreRange": "high"
  }'
```

---

## Troubleshooting

### Backend Issues

**Problem: Build fails on Railway**
- ✅ Check Railway build logs for specific errors
- ✅ Verify `package.json` has correct dependencies
- ✅ Ensure `server.js` exists in backend root

**Problem: Database connection errors**
- ✅ Verify all DB_* environment variables are correct
- ✅ Check if MySQL service is running in Railway
- ✅ Ensure database credentials match Railway MySQL service

**Problem: Server won't start**
- ✅ Check Railway logs for error messages
- ✅ Verify `PORT` and `NODE_ENV` are set
- ✅ Ensure `JWT_SECRET` is set (at least 32 characters)

**Problem: CORS errors**
- ✅ Verify `CORS_ORIGIN` includes your Vercel URL exactly
- ✅ No trailing slash in CORS_ORIGIN
- ✅ Include protocol: `https://` (not just domain name)
- ✅ For multiple origins: separate with commas, no spaces

### Frontend Issues

**Problem: Build fails on Vercel**
- ✅ Check Vercel build logs
- ✅ Verify all React dependencies are in `package.json`
- ✅ Ensure Root Directory is set to `frontend` (if monorepo)

**Problem: API calls fail**
- ✅ Verify `REACT_APP_API_BASE_URL` is set in Vercel
- ✅ No trailing slash in API URL
- ✅ Check browser console for CORS errors
- ✅ Verify backend CORS includes your Vercel domain

**Problem: 404 on page refresh**
- ✅ Verify `vercel.json` exists in frontend root
- ✅ Check rewrite rules are correct

**Problem: Environment variables not working**
- ✅ Ensure variable name starts with `REACT_APP_`
- ✅ Redeploy after changing environment variables
- ✅ Variables are only available at build time

### Connection Issues

**Problem: CORS error in browser**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
1. Verify backend `CORS_ORIGIN` includes frontend URL
2. Check browser console for exact origin being blocked
3. Ensure both URLs use HTTPS in production
4. Redeploy backend after changing CORS_ORIGIN

**Problem: Network error or connection refused**
- ✅ Verify backend Railway URL is accessible (try `/api/health`)
- ✅ Check if backend is deployed and running
- ✅ Verify `REACT_APP_API_BASE_URL` points to correct backend

**Problem: 401 Unauthorized errors**
- ✅ Verify JWT token is being sent in requests
- ✅ Check if token is expired (login again)
- ✅ Verify `JWT_SECRET` is same in backend (if redeployed)

### Email Issues

**Problem: OTP emails not sending**
- ✅ Verify Gmail app password (not regular password)
- ✅ Check 2FA is enabled on Gmail account
- ✅ Verify SMTP credentials are correct
- ✅ Check Railway logs for SMTP errors

---

## Quick Reference

### Environment Variables Checklist

**Railway (Backend):**
- [ ] `PORT=5000`
- [ ] `NODE_ENV=production`
- [ ] `HOST=0.0.0.0`
- [ ] `DB_HOST` (from Railway MySQL)
- [ ] `DB_USER` (from Railway MySQL)
- [ ] `DB_PASSWORD` (from Railway MySQL)
- [ ] `DB_NAME` (from Railway MySQL)
- [ ] `JWT_SECRET` (random 32+ char string)
- [ ] `CORS_ORIGIN` (your Vercel URL)
- [ ] `SMTP_HOST=smtp.gmail.com`
- [ ] `SMTP_PORT=587`
- [ ] `SMTP_USER` (your Gmail)
- [ ] `SMTP_PASS` (Gmail app password)

**Vercel (Frontend):**
- [ ] `REACT_APP_API_BASE_URL` (your Railway backend URL)

### URLs After Deployment

- **Backend API**: `https://your-backend.railway.app`
- **Backend Health**: `https://your-backend.railway.app/api/health`
- **Frontend App**: `https://your-app.vercel.app`

### Important Commands

```bash
# Test backend health
curl https://your-backend.railway.app/api/health

# Generate JWT secret
openssl rand -hex 32

# Test API endpoint
curl https://your-backend.railway.app/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin.multiplus@gmail.com","password":"123456"}'
```

---

## Security Checklist

Before going live, ensure:

- [ ] `JWT_SECRET` is strong and unique (32+ characters)
- [ ] `CORS_ORIGIN` is set to specific domain(s), not `*` in production
- [ ] All environment variables are set (never commit `.env` files)
- [ ] HTTPS is enabled on both Railway and Vercel
- [ ] Database credentials are secure
- [ ] Admin password is changed from default `123456`
- [ ] Error messages don't expose sensitive information

---

## Support

If you encounter issues:

1. Check deployment logs (Railway/Vercel)
2. Verify all environment variables are set correctly
3. Test backend health endpoint independently
4. Check browser console for frontend errors
5. Review this guide's troubleshooting section

---

**🎉 Congratulations!** Your Multiplus Financial Services app is now live!

---

**Last Updated:** 2024
**Version:** 1.0
