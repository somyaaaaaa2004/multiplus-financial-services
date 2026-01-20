# Multiplus Financial Services - Backend API

Backend API server for Multiplus Financial Services platform built with Node.js, Express, and MySQL.

## 🚀 Railway Deployment

### Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. A MySQL database (can be provisioned via Railway or external provider)
3. Git repository with backend code

### Step-by-Step Deployment

#### 1. Connect Repository to Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or your Git provider)
4. Choose your repository
5. Railway will automatically detect Node.js and start building

**Note:** This project includes a `railway.json` configuration file in the root directory that specifies:
- **Build Command:** `npm install`
- **Start Command:** `npm start`

However, **you must still set the Root Directory** in Railway dashboard for monorepo setup.

#### 2. Configure Root Directory (Required for Monorepo)

**This step is essential** - Railway needs to know to deploy only the backend folder:

1. Click on your project in Railway dashboard
2. Go to **Settings** tab
3. Scroll to **"Root Directory"** section
4. Set it to: `backend`
5. Click **"Update"**

This ensures Railway:
- ✅ Only deploys the backend folder (ignores frontend)
- ✅ Looks for `package.json` in the backend folder
- ✅ Runs build/start commands from the backend directory

The `railway.json` file specifies the build and start commands that Railway will use once the root directory is set.

#### 3. Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

**Required Environment Variables:**

```env
# Server Configuration
PORT=5000
NODE_ENV=production
HOST=0.0.0.0

# Database Configuration
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=your-database-name

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# CORS Configuration (Vercel frontend domain)
# Separate multiple origins with commas
CORS_ORIGIN=https://your-vercel-app.vercel.app

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**For Multiple CORS Origins:**
```env
CORS_ORIGIN=https://your-app.vercel.app,https://www.yourdomain.com,https://staging.yourdomain.com
```

**CORS Behavior:**
- **Development:** `http://localhost:3000` is automatically allowed, plus any origins from `CORS_ORIGIN`
- **Production:** Only origins specified in `CORS_ORIGIN` are allowed (comma-separated)
- Supports: GET, POST, PUT, DELETE, OPTIONS methods
- Credentials enabled for authenticated requests
- Preflight OPTIONS requests are cached for 24 hours

#### 4. Provision MySQL Database

**Option A: Railway MySQL Plugin**
1. In Railway project, click "+ New"
2. Select "MySQL" from the database options
3. Railway will automatically create and link the database
4. Copy the connection details to environment variables

**Option B: External MySQL**
- Use any MySQL provider (PlanetScale, AWS RDS, DigitalOcean, etc.)
- Add connection details as environment variables

#### 5. Deploy

Railway will automatically:
- Read `railway.json` configuration (sets root to `backend` folder)
- Install dependencies (`npm install` in backend folder)
- Run start script (`npm start` from backend folder)
- Expose your service on a public URL

**Configuration File (`railway.json`):**
The `railway.json` file in the project root ensures Railway:
- ✅ Only deploys the backend (ignores frontend folder)
- ✅ Uses correct build and start commands
- ✅ Works seamlessly in a monorepo setup

#### 6. Verify Deployment

1. Check Railway logs for successful startup
2. Visit your health endpoint: `https://your-app.railway.app/api/health`
3. You should see:
```json
{
  "success": true,
  "message": "Multiplus Financial Services API is running",
  "timestamp": "...",
  "environment": "production"
}
```

### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `HOST` | Server host | No | 0.0.0.0 |
| `NODE_ENV` | Environment mode | Yes | production |
| `DB_HOST` | MySQL host | Yes | - |
| `DB_USER` | MySQL username | Yes | - |
| `DB_PASSWORD` | MySQL password | Yes | - |
| `DB_NAME` | MySQL database name | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `CORS_ORIGIN` | Allowed CORS origins | Yes | - |
| `SMTP_HOST` | SMTP server host | Yes | smtp.gmail.com |
| `SMTP_PORT` | SMTP server port | Yes | 587 |
| `SMTP_USER` | SMTP username | Yes | - |
| `SMTP_PASS` | SMTP app password | Yes | - |

### Production Checklist

- ✅ Environment variables configured
- ✅ Database connection tested
- ✅ CORS origins set correctly
- ✅ JWT_SECRET is strong (32+ characters)
- ✅ Email SMTP credentials valid
- ✅ Health endpoint responding
- ✅ Error handling doesn't expose sensitive info

### Database Initialization

The server automatically:
- Creates required tables on startup
- Seeds admin user if not exists:
  - Email: `admin.multiplus@gmail.com`
  - Password: `123456`
  - Role: `admin`

⚠️ **Security Note:** Change admin password immediately after first deployment!

### API Endpoints

#### Health Check
```
GET /api/health
```

#### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/verify-otp
POST /api/auth/reset-password
GET  /api/auth/me
```

#### Financial Health
```
GET  /api/financial-health/demo
POST /api/financial-health/score
```

### Troubleshooting

**Server won't start:**
- Check Railway logs for errors
- Verify all required environment variables are set
- Ensure database is accessible from Railway

**Database connection errors:**
- Verify DB credentials are correct
- Check if database allows connections from Railway IPs
- Ensure database is running

**CORS errors:**
- Verify CORS_ORIGIN matches your frontend domain exactly
- Include protocol (https://) - no trailing slash
- For multiple origins, separate with commas (no spaces around commas)
- In development, `http://localhost:3000` is automatically allowed
- Check backend logs for CORS rejection details
- Ensure your frontend sends credentials: true in axios/fetch requests

**Email not sending:**
- Verify Gmail app password (not regular password)
- Check SMTP credentials
- Ensure 2FA is enabled on Gmail account

### Local Development

```bash
# Install dependencies
npm install

# Create .env file (see .env.example)
cp .env.example .env

# Start development server
npm run dev
```

### Project Structure

```
backend/
├── src/
│   ├── app.js              # Express app configuration
│   ├── config/             # Database and config files
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Express middlewares
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
├── server.js               # Server entry point
├── package.json            # Dependencies
└── README.md               # This file
```

### Support

For issues or questions:
1. Check Railway deployment logs
2. Verify environment variables
3. Test database connectivity
4. Review API health endpoint

---

**Built with:** Node.js, Express, MySQL, JWT, Nodemailer
