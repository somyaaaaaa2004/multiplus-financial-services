# 🚀 Koyeb Deployment Guide - Backend API

Complete guide to deploy the Multiplus Financial Services backend API to Koyeb.

## 📋 Prerequisites

1. **Koyeb Account** - Sign up at [koyeb.com](https://koyeb.com) (free tier available)
2. **Git Repository** - Your code must be in GitHub, GitLab, or Bitbucket
3. **MySQL Database** - Provisioned database (Koyeb, PlanetScale, or external)
4. **Gmail Account** - For SMTP email services (or other SMTP provider)

---

## 🚀 Step-by-Step Deployment

### Step 1: Connect Your Repository

1. Go to [Koyeb Dashboard](https://app.koyeb.com)
2. Click **"Create App"** button
3. Select **"GitHub"**, **"GitLab"**, or **"Bitbucket"** as your Git provider
4. Authorize Koyeb to access your repositories
5. Select your repository
6. Click **"Continue"**

### Step 2: Configure Application Settings

In the **"Configure your application"** section:

1. **Service Name**: Give your service a name (e.g., `multiplus-backend`)
2. **Region**: Choose a region closest to your users
3. **Runtime**: Koyeb auto-detects Node.js - verify it shows **"Node.js"**
4. **Build Command**: Leave empty (Koyeb auto-detects `npm install`)
5. **Run Command**: Set to `npm start`
6. **Root Directory**: If monorepo, set to `backend`

**Important Settings:**
- ✅ **Runtime**: Node.js (auto-detected)
- ✅ **Run Command**: `npm start` (runs `node server.js`)
- ✅ **Root Directory**: `backend` (if your backend is in a subdirectory)

### Step 3: Set Environment Variables

Click **"Environment Variables"** section and add all required variables:

#### Required Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=your-database-name

# JWT Secret (generate a strong random string - at least 32 characters)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# CORS Configuration (your frontend domain)
CORS_ORIGIN=https://your-frontend-domain.com

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

#### Multiple CORS Origins

If you need multiple frontend domains:
```env
CORS_ORIGIN=https://your-app.vercel.app,https://www.yourdomain.com,https://staging.yourdomain.com
```

**Note:** Separate multiple origins with commas (no spaces).

#### Generate JWT Secret

Generate a secure JWT secret (run in terminal):
```bash
openssl rand -hex 32
```

#### Gmail App Password Setup

1. Go to your Google Account settings
2. Enable **2-Factor Authentication**
3. Go to **Security** → **2-Step Verification**
4. Scroll to **"App passwords"**
5. Generate a new app password for "Mail"
6. Use this 16-character password as `SMTP_PASS` (not your regular Gmail password)

### Step 4: Provision Database

**Option A: Koyeb MySQL (Recommended)**

1. In Koyeb dashboard, create a new **MySQL** service
2. Koyeb will automatically create the database
3. Copy the connection details:
   - Host (usually something like `mysql.koyeb.app`)
   - Port (usually 3306)
   - User
   - Password
   - Database name
4. Add these as environment variables in your app

**Option B: External MySQL**

Use any MySQL provider:
- PlanetScale
- AWS RDS
- DigitalOcean Managed Databases
- Railway MySQL
- Any MySQL-compatible database

Add connection details as environment variables.

### Step 5: Deploy

1. Review all settings
2. Click **"Deploy"** button
3. Koyeb will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build your application
   - Start the server (`npm start`)
4. Wait 2-3 minutes for deployment to complete

### Step 6: Verify Deployment

1. Koyeb will assign a public URL (e.g., `https://your-app.koyeb.app`)
2. Test the health endpoint:
   ```
   https://your-app.koyeb.app/api/health
   ```
3. You should see:
   ```json
   {
     "success": true,
     "message": "API running",
     "time": "2024-01-01T00:00:00.000Z"
   }
   ```

✅ **Backend is deployed successfully!**

---

## 🔧 Configuration Details

### Port Configuration

The backend automatically uses `process.env.PORT` (provided by Koyeb) with fallback to 5000:
```javascript
const PORT = process.env.PORT || 5000;
```

### CORS Configuration

- **With CORS_ORIGIN set**: Only allows specified origins (comma-separated)
- **Without CORS_ORIGIN in development**: Allows all origins (`*`)
- **Without CORS_ORIGIN in production**: Allows all origins (not recommended - set CORS_ORIGIN)

### Health Endpoint

The health endpoint is available at:
```
GET /api/health
```

Returns:
```json
{
  "success": true,
  "message": "API running",
  "time": "ISO-8601 timestamp"
}
```

### Error Handling

All errors are handled safely:
- ✅ No server crashes on errors
- ✅ Structured error logging
- ✅ Production-safe error messages (no stack traces exposed)
- ✅ Graceful shutdown on SIGTERM/SIGINT

---

## 📝 Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `5000` (Koyeb sets automatically) |
| `NODE_ENV` | Environment mode | Yes | `production` |
| `DB_HOST` | MySQL host | Yes | `mysql.koyeb.app` |
| `DB_USER` | MySQL username | Yes | `root` |
| `DB_PASSWORD` | MySQL password | Yes | `your-password` |
| `DB_NAME` | Database name | Yes | `multiplus_db` |
| `JWT_SECRET` | JWT signing secret | Yes | `random-32-char-string` |
| `CORS_ORIGIN` | Allowed frontend origins | Yes | `https://app.vercel.app` |
| `SMTP_HOST` | SMTP server | Yes | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | Yes | `587` |
| `SMTP_USER` | SMTP username | Yes | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password | Yes | `gmail-app-password` |

---

## 🐛 Troubleshooting

### Build Fails

**Problem:** Build fails with errors

**Solutions:**
- Check Koyeb build logs for specific errors
- Verify `package.json` exists and has correct dependencies
- Ensure Node.js version is compatible (Koyeb auto-detects)
- Verify root directory is set correctly if monorepo

### Application Won't Start

**Problem:** Application starts then crashes

**Solutions:**
- Check application logs in Koyeb dashboard
- Verify all required environment variables are set
- Ensure `npm start` runs `node server.js` correctly
- Check database connection (verify DB_* variables)

### Database Connection Errors

**Problem:** `Database connection failed` errors

**Solutions:**
- Verify all DB_* environment variables are correct
- Check if database allows connections from Koyeb IPs
- Ensure database is running and accessible
- Test database connection independently

### CORS Errors

**Problem:** Frontend can't connect - CORS errors

**Solutions:**
- Verify `CORS_ORIGIN` includes your frontend domain exactly
- Include protocol (`https://`) - no trailing slash
- For multiple origins: separate with commas, no spaces
- Check browser console for exact origin being blocked
- Ensure frontend sends credentials: true in requests

### Health Endpoint Not Responding

**Problem:** `/api/health` returns 404 or connection refused

**Solutions:**
- Verify application is deployed and running
- Check Koyeb application logs
- Ensure PORT environment variable is set (Koyeb sets this automatically)
- Verify application started successfully

### Email Not Sending

**Problem:** OTP emails not received

**Solutions:**
- Verify Gmail app password (not regular password)
- Check SMTP credentials are correct
- Ensure 2FA is enabled on Gmail account
- Check application logs for SMTP errors
- Verify SMTP_PORT is 587 (not 465)

---

## 🔒 Security Checklist

Before going live:

- [ ] `JWT_SECRET` is strong and unique (32+ characters)
- [ ] `CORS_ORIGIN` is set to specific domain(s), not `*` in production
- [ ] All environment variables are set (never commit `.env` files)
- [ ] Database credentials are secure
- [ ] HTTPS is enabled (Koyeb provides this automatically)
- [ ] Admin password changed from default `123456`
- [ ] Error messages don't expose sensitive information

---

## 📊 Monitoring

Koyeb provides built-in monitoring:

1. **Logs**: View real-time application logs in Koyeb dashboard
2. **Metrics**: Monitor CPU, memory, and request metrics
3. **Health Checks**: Koyeb automatically monitors your application
4. **Alerts**: Set up alerts for application failures

---

## 🔄 Updating Your Application

To update your application:

1. Push changes to your Git repository
2. Koyeb automatically detects changes
3. Koyeb rebuilds and redeploys automatically
4. Zero-downtime deployment (new version starts before old one stops)

---

## 🎯 Production Checklist

Before marking as production-ready:

- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] Health endpoint responding
- [ ] CORS configured correctly
- [ ] Email service working (test OTP flow)
- [ ] Authentication working (test login/register)
- [ ] Error handling verified
- [ ] Security checklist completed
- [ ] Monitoring and logging enabled

---

## 📚 Additional Resources

- [Koyeb Documentation](https://www.koyeb.com/docs)
- [Node.js on Koyeb](https://www.koyeb.com/docs/quickstart/nodejs)
- [Environment Variables](https://www.koyeb.com/docs/apps/configuration/environment-variables)
- [MySQL on Koyeb](https://www.koyeb.com/docs/databases/mysql)

---

## 💡 Quick Start Commands

```bash
# Test health endpoint locally
curl http://localhost:5000/api/health

# Test health endpoint in production
curl https://your-app.koyeb.app/api/health

# Generate JWT secret
openssl rand -hex 32

# Test API endpoint
curl -X POST https://your-app.koyeb.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

---

**🎉 Congratulations!** Your backend API is now deployed on Koyeb!

---

**Last Updated:** 2024  
**Version:** 1.0
