# Postman Test Guide - Multiplus Financial Services API

Complete step-by-step guide for testing all backend endpoints using Postman.

## Table of Contents
1. [Setup](#setup)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Protected Endpoints](#protected-endpoints)
4. [Financial Health Endpoints](#financial-health-endpoints)

---

## Setup

### Base URL
```
http://localhost:5000
```

### Environment Variables (Optional in Postman)
Create a Postman environment with:
- `base_url`: `http://localhost:5000`
- `token`: (will be set after login)

---

## Authentication Endpoints

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "email": "john.doe@example.com",
      "role": "user",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Steps:**
1. Select `POST` method
2. Enter URL: `http://localhost:5000/api/auth/register`
3. Go to Headers tab, add `Content-Type: application/json`
4. Go to Body tab, select `raw` and `JSON`
5. Paste the request body above (modify email if needed)
6. Click Send
7. **Save the token** from response for later use

**Note:** Password must be at least 6 characters. Email must be valid format.

---

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "email": "john.doe@example.com",
      "role": "user"
    }
  }
}
```

**Steps:**
1. Select `POST` method
2. Enter URL: `http://localhost:5000/api/auth/login`
3. Add Header: `Content-Type: application/json`
4. Add Body: `raw` → `JSON` → paste request body
5. Click Send
6. **Copy the token** from response

---

### 3. Admin Login

**Endpoint:** `POST /api/auth/login` (Same as user login)

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin.multiplus@gmail.com",
  "password": "123456"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin.multiplus@gmail.com",
      "role": "admin"
    }
  }
}
```

**Steps:**
1. Use the same steps as User Login
2. Use admin credentials: `admin.multiplus@gmail.com` / `123456`
3. Note the `role: "admin"` in response

---

### 4. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, an OTP has been sent",
  "data": null
}
```

**Steps:**
1. Select `POST` method
2. Enter URL: `http://localhost:5000/api/auth/forgot-password`
3. Add Header: `Content-Type: application/json`
4. Add Body with email address
5. Click Send
6. **Check your email** for the 6-digit OTP code
7. Note: This endpoint doesn't reveal if email exists (security)

**Important:** Make sure SMTP is configured in `.env` file:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

### 5. Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "email": "john.doe@example.com",
    "verified": true
  }
}
```

**Error Response (400) - Expired OTP:**
```json
{
  "success": false,
  "message": "OTP has expired"
}
```

**Error Response (400) - Invalid OTP:**
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

**Steps:**
1. Select `POST` method
2. Enter URL: `http://localhost:5000/api/auth/verify-otp`
3. Add Header: `Content-Type: application/json`
4. Add Body with email and OTP from email
5. Click Send
6. OTP expires in 5 minutes

---

### 6. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null
}
```

**Error Response (400) - Expired OTP:**
```json
{
  "success": false,
  "message": "OTP has expired"
}
```

**Error Response (400) - Invalid OTP:**
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

**Steps:**
1. First, call forgot-password endpoint
2. Get OTP from email
3. Select `POST` method
4. Enter URL: `http://localhost:5000/api/auth/reset-password`
5. Add Header: `Content-Type: application/json`
6. Add Body with email, OTP, and new password (min 6 characters)
7. Click Send
8. After successful reset, OTP is cleared

---

## Protected Endpoints

All protected endpoints require JWT authentication token in the Authorization header.

### 7. Get Current User Profile (ME)

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:** None

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": 2,
    "email": "john.doe@example.com",
    "role": "user",
    "created_at": "2024-01-15T10:30:00.000Z",
    "is_verified": false
  }
}
```

**Error Response (401) - Missing Token:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**Error Response (401) - Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid token."
}
```

**Error Response (401) - Expired Token:**
```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```

**Steps:**
1. First, login to get a token
2. Select `GET` method
3. Enter URL: `http://localhost:5000/api/auth/me`
4. Go to Headers tab
5. Add Header: `Authorization: Bearer <paste-your-token-here>`
   - Example: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
6. Click Send

**Pro Tip:** In Postman, you can:
- Use environment variable: `Authorization: Bearer {{token}}`
- Set token as environment variable after login
- Use Postman's "Tests" tab to auto-save token:
  ```javascript
  if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.token) {
      pm.environment.set("token", jsonData.data.token);
    }
  }
  ```

---

## Financial Health Endpoints

### 8. Get Demo Financial Profile

**Endpoint:** `GET /api/financial-health/demo`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:** None

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Demo financial profile retrieved successfully",
  "data": {
    "monthlyIncome": 7500,
    "monthlyExpenses": 5000,
    "totalSavings": 30000,
    "totalDebt": 15000,
    "emergencyFund": 18000,
    "investments": 45000,
    "creditScore": 720,
    "monthlyDebtPayments": 800,
    "age": 32,
    "monthsOfExpenses": 6
  }
}
```

**Steps:**
1. First, login to get a token
2. Select `GET` method
3. Enter URL: `http://localhost:5000/api/financial-health/demo`
4. Add Header: `Authorization: Bearer <your-token>`
5. Click Send

---

### 9. Calculate Financial Health Score

**Endpoint:** `POST /api/financial-health/score`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "monthlyIncome": 7500,
  "monthlyExpenses": 5000,
  "totalSavings": 30000,
  "totalDebt": 15000,
  "emergencyFund": 18000,
  "investments": 45000,
  "creditScore": 720,
  "monthlyDebtPayments": 800,
  "age": 32,
  "monthsOfExpenses": 6
}
```

**Minimal Request Body (only required field):**
```json
{
  "monthlyIncome": 5000
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Financial health score calculated successfully",
  "data": {
    "healthScore": 75,
    "grade": "Good",
    "categoryScores": {
      "Savings": 80,
      "Debt": 70,
      "Emergency": 90,
      "Investing": 65,
      "Credit": 90
    },
    "riskFlags": [
      {
        "severity": "Medium",
        "category": "Savings",
        "message": "Your savings rate is below recommended levels, which may impact your long-term financial security."
      }
    ],
    "recommendations": [
      {
        "priority": "Medium",
        "category": "Savings",
        "title": "Increase Your Savings Rate",
        "description": "Target saving at least $1,500 per month (20% of income) to build wealth over time.",
        "actionSteps": [
          "Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
          "Automate savings transfers on payday",
          "Review and cut unnecessary subscriptions or services",
          "Build savings before increasing lifestyle expenses"
        ]
      },
      {
        "priority": "Medium",
        "category": "Investing",
        "title": "Start Building Your Investment Portfolio",
        "description": "Begin investing regularly to grow your wealth and prepare for long-term financial goals like retirement.",
        "actionSteps": [
          "Open a retirement account (401(k) or IRA) and contribute regularly",
          "Consider low-cost index funds for broad market exposure",
          "Diversify across asset classes based on your risk tolerance",
          "Take advantage of employer matching contributions if available"
        ]
      }
    ]
  }
}
```

**Error Response (400) - Missing Required Field:**
```json
{
  "success": false,
  "message": "monthlyIncome is required"
}
```

**Error Response (400) - Invalid Number:**
```json
{
  "success": false,
  "message": "monthlyIncome must be a valid positive number"
}
```

**Steps:**
1. First, login to get a token
2. Select `POST` method
3. Enter URL: `http://localhost:5000/api/financial-health/score`
4. Add Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-token>`
5. Add Body: `raw` → `JSON` → paste request body
6. Click Send

**Request Body Field Descriptions:**
- `monthlyIncome` (required): Monthly income in dollars
- `monthlyExpenses` (optional): Monthly expenses in dollars
- `totalSavings` (optional): Total savings amount in dollars
- `totalDebt` (optional): Total debt amount in dollars
- `emergencyFund` (optional): Emergency fund amount in dollars
- `investments` (optional): Total investments value in dollars
- `creditScore` (optional): Credit score (300-850)
- `monthlyDebtPayments` (optional): Monthly debt payments in dollars
- `age` (optional): Age of the user (default: 30)
- `monthsOfExpenses` (optional): Target months for emergency fund (default: 6)

---

## Testing Workflow Examples

### Complete User Registration & Profile Flow
1. Register new user → Save token
2. Use token to call `/api/auth/me` → Verify user data
3. Use token to call `/api/financial-health/demo` → Get demo profile
4. Use demo profile data to call `/api/financial-health/score` → Get health assessment

### Password Reset Flow
1. Login with existing credentials → Save token
2. Call `/api/auth/forgot-password` → Check email for OTP
3. Call `/api/auth/verify-otp` → Verify OTP is valid
4. Call `/api/auth/reset-password` → Reset password with OTP
5. Login with new password → Verify reset worked

### Admin Access Flow
1. Login as admin (`admin.multiplus@gmail.com` / `123456`) → Save token
2. Use admin token for any protected endpoint
3. Note the `role: "admin"` in `/api/auth/me` response

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```
**Solution:** Add `Authorization: Bearer <token>` header

### 401 Invalid Token
```json
{
  "success": false,
  "message": "Invalid token."
}
```
**Solution:** Login again to get a fresh token

### 401 Token Expired
```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```
**Solution:** Tokens expire in 1 day. Login again.

### 400 Validation Error
```json
{
  "success": false,
  "message": "Email and password are required"
}
```
**Solution:** Check request body includes all required fields

### 404 Not Found
```json
{
  "success": false,
  "message": "Route GET /api/invalid-route not found"
}
```
**Solution:** Check the endpoint URL is correct

### 500 Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```
**Solution:** Check server logs, ensure database is running

---

## Postman Collection Setup Tips

### 1. Create Environment
- Click "Environments" → "Create Environment"
- Add variables:
  - `base_url`: `http://localhost:5000`
  - `token`: (leave empty, will be set automatically)

### 2. Use Variables in Requests
- URL: `{{base_url}}/api/auth/login`
- Header: `Authorization: Bearer {{token}}`

### 3. Auto-Save Token (Tests Tab)
Add this to login/register requests:
```javascript
if (pm.response.code === 200) {
  const jsonData = pm.response.json();
  if (jsonData.data && jsonData.data.token) {
    pm.environment.set("token", jsonData.data.token);
    console.log("Token saved to environment");
  }
}
```

### 4. Pre-request Script (Optional)
For protected endpoints, add pre-request script:
```javascript
if (!pm.environment.get("token")) {
  pm.test("Token required", function () {
    pm.expect.fail("Please login first to get a token");
  });
}
```

---

## Health Check

**Endpoint:** `GET /api/health`

**Headers:** None required

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Multiplus Financial Services API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

**Use this endpoint to verify the server is running before testing other endpoints.**

---

## Notes

1. **Token Expiry:** JWT tokens expire after 1 day. Re-login if token expires.

2. **Password Requirements:** Minimum 6 characters

3. **Email Format:** Must be valid email format

4. **OTP Expiry:** OTP codes expire after 5 minutes

5. **Database:** Ensure MySQL database is running and configured in `.env`

6. **SMTP:** For password reset to work, configure SMTP in `.env`

7. **Admin User:** Admin user is automatically created on server startup with:
   - Email: `admin.multiplus@gmail.com`
   - Password: `123456`

---

## Troubleshooting

### Cannot connect to server
- Check if server is running: `npm run dev`
- Verify port 5000 is not in use
- Check firewall settings

### Database connection errors
- Verify MySQL is running
- Check `.env` file has correct database credentials
- Verify database exists

### Email not sending (OTP)
- Check SMTP configuration in `.env`
- For Gmail, use App Password (not regular password)
- Check SMTP credentials are correct

### Token not working
- Tokens are valid for 1 day
- Ensure `Authorization: Bearer <token>` header format is correct
- Token should not include quotes

---

## Support

For issues or questions, check:
- Server logs for detailed error messages
- Database connection status
- Environment variable configuration
- API response error messages

Happy Testing! 🚀
