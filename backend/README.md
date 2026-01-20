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

**Note:** This project includes configuration files to ensure proper Railway deployment:
- `railway.json` - Forces Railway to use Nixpacks (not Docker)
- `nixpacks.toml` - Explicitly configures Node.js, npm, and backend directory

#### 2. Configure Root Directory (Required for Monorepo)

**This step is essential** - Railway needs to know to deploy only the backend folder:

1. Click on your project in Railway dashboard
2. Go to **Settings** tab
3. Scroll to **"Root Directory"** section
4. Set it to: `backend`
5. Click **"Update"**

**Alternative:** The `nixpacks.toml` file handles the backend directory automatically, but setting Root Directory in Railway dashboard is recommended for clarity.

This ensures Railway:
- ✅ Only deploys the backend folder (ignores frontend)
- ✅ Uses Nixpacks builder (not Docker)
- ✅ Installs Node.js 18.x and npm automatically
- ✅ Runs `npm install` in the backend directory
- ✅ Starts with `npm start` from backend directory

**Configuration Files:**
- `railway.json` - Forces Nixpacks builder (prevents Docker detection)
- `nixpacks.toml` - Specifies Node.js version, install commands, and start command

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

#### 5. Verify Build Configuration

Before deploying, ensure Railway will use Nixpacks (not Docker):

1. In Railway dashboard, click on your service
2. Go to **Settings** tab
3. Check **"Builder"** setting - it should show **"Nixpacks"** (not Dockerfile)
4. If it shows Dockerfile, Railway detected a Dockerfile in your repo
   - Check for any `Dockerfile` in root or backend folder
   - Delete it if found (or move to a different location if needed elsewhere)
   - Railway will then use Nixpacks automatically

**Configuration Files:**
- `railway.json` - Forces Railway to use Nixpacks builder (prevents Docker detection)
- `nixpacks.toml` - Explicitly configures Node.js 18.x, npm, and backend directory

#### 6. Deploy

Railway will automatically:
- Read `railway.json` (forces Nixpacks builder, prevents Docker)
- Read `nixpacks.toml` (configures Node.js 18.x and npm installation)
- Set root directory to `backend` (from dashboard setting)
- Install Node.js 18.x and npm automatically
- Run `npm install` in backend directory
- Run `npm start` from backend directory (executes `node server.js`)
- Expose your service on a public URL

**What happens during build:**
1. ✅ Railway detects `railway.json` → Forces Nixpacks builder (not Docker)
2. ✅ Railway reads `nixpacks.toml` → Installs Node.js 18.x and npm
3. ✅ Railway uses Root Directory setting → Changes to `backend` folder
4. ✅ Runs `npm install` → Installs all dependencies from `backend/package.json`
5. ✅ Runs `npm start` → Executes `node server.js` from backend folder

**Troubleshooting:**
- If build fails with "npm: command not found" → Railway is using Docker instead of Nixpacks
- Solution: Verify no Dockerfile exists in root or backend folder
- Ensure `railway.json` has `"builder": "NIXPACKS"`
- Check Railway Settings → Builder shows "Nixpacks"

#### 7. Verify Deployment

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

**Build fails with "npm: command not found":**
- Railway is trying to use Docker instead of Nixpacks
- **Solution 1:** Check if Dockerfile exists in root or backend folder - delete it
- **Solution 2:** Verify `railway.json` exists in root with `"builder": "NIXPACKS"`
- **Solution 3:** In Railway dashboard → Settings → Builder should show "Nixpacks"
- **Solution 4:** Ensure `nixpacks.toml` exists in root directory
- Railway will use Nixpacks automatically if no Dockerfile is found

**Build fails - Root directory issues:**
- Ensure Root Directory is set to `backend` in Railway Settings
- Verify `backend/package.json` exists
- Check that `backend/server.js` exists
- Railway should detect backend folder automatically with root directory setting

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
