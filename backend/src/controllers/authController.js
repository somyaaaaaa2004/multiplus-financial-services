const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/emailService');

/**
 * Register a new user
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Please provide a valid email address', 400);
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    // Check if user already exists
    const [existingUsers] = await query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (existingUsers.length > 0) {
      return sendError(res, 'User with this email already exists', 400);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await query(
      `INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'user')`,
      [email.toLowerCase().trim(), hashedPassword]
    );

    // Get the created user (without password)
    const [users] = await query(
      'SELECT id, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = users[0];

    // Generate JWT token (expires in 1 day)
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    // Return success response
    return sendSuccess(res, 'User registered successfully', {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Login user (works for both regular users and admin)
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    // Find user by email
    const [users] = await query(
      'SELECT id, email, password_hash, role FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Generate JWT token (expires in 1 day)
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    // Return success response (password is never included)
    return sendSuccess(res, 'Login successful', {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate 6-digit OTP code
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Forgot Password - Send OTP to email
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return sendError(res, 'Email is required', 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Invalid email format', 400);
    }

    // Find user by email (show minimal error for security)
    const [users] = await query(
      'SELECT id, email FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    // Always return success message for security (don't reveal if email exists)
    if (users.length === 0) {
      return sendSuccess(res, 'If the email exists, an OTP has been sent', null);
    }

    const user = users[0];

    // Generate 6-digit OTP
    const otpCode = generateOTP();
    
    // Set expiry to 5 minutes from now (in epoch milliseconds)
    const otpExpiry = Date.now() + (5 * 60 * 1000);

    // Store OTP in database
    await query(
      'UPDATE users SET otp_code = ?, otp_expiry = ? WHERE id = ?',
      [otpCode, otpExpiry, user.id]
    );

    // Send OTP email
    try {
      await sendOTPEmail(user.email, otpCode);
      return sendSuccess(res, 'If the email exists, an OTP has been sent', null);
    } catch (emailError) {
      // Clear OTP if email fails
      await query(
        'UPDATE users SET otp_code = NULL, otp_expiry = NULL WHERE id = ?',
        [user.id]
      );
      // Return meaningful error message
      const errorMessage = emailError.message || 'Failed to send email';
      return sendError(res, errorMessage, 500);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP
 * POST /api/auth/verify-otp
 */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return sendError(res, 'Email and OTP are required', 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Invalid email format', 400);
    }

    // OTP validation (must be 6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return sendError(res, 'Invalid OTP format', 400);
    }

    // Find user with matching email and OTP
    const [users] = await query(
      'SELECT id, email, otp_code, otp_expiry FROM users WHERE email = ? AND otp_code = ?',
      [email.toLowerCase().trim(), otp]
    );

    if (users.length === 0) {
      return sendError(res, 'Invalid OTP', 400);
    }

    const user = users[0];

    // Check if OTP has expired
    const currentTime = Date.now();
    if (!user.otp_expiry || currentTime > user.otp_expiry) {
      // Clear expired OTP
      await query(
        'UPDATE users SET otp_code = NULL, otp_expiry = NULL WHERE id = ?',
        [user.id]
      );
      return sendError(res, 'OTP has expired', 400);
    }

    // OTP is valid
    return sendSuccess(res, 'OTP verified successfully', {
      email: user.email,
      verified: true
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password after OTP verification
 * POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validation
    if (!email || !otp || !newPassword) {
      return sendError(res, 'Email, OTP, and new password are required', 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Invalid email format', 400);
    }

    // Password validation (minimum 6 characters)
    if (newPassword.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    // OTP validation (must be 6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return sendError(res, 'Invalid OTP format', 400);
    }

    // Find user with matching email and OTP
    const [users] = await query(
      'SELECT id, email, otp_code, otp_expiry FROM users WHERE email = ? AND otp_code = ?',
      [email.toLowerCase().trim(), otp]
    );

    if (users.length === 0) {
      return sendError(res, 'Invalid OTP', 400);
    }

    const user = users[0];

    // Check if OTP has expired
    const currentTime = Date.now();
    if (!user.otp_expiry || currentTime > user.otp_expiry) {
      // Clear expired OTP
      await query(
        'UPDATE users SET otp_code = NULL, otp_expiry = NULL WHERE id = ?',
        [user.id]
      );
      return sendError(res, 'OTP has expired', 400);
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear OTP
    await query(
      'UPDATE users SET password_hash = ?, otp_code = NULL, otp_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    return sendSuccess(res, 'Password reset successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 * Protected route - requires JWT token
 */
exports.getMe = async (req, res, next) => {
  try {
    // req.userId is set by authMiddleware after JWT verification
    const userId = req.userId;

    if (!userId) {
      return sendError(res, 'User ID not found in token', 401);
    }

    // Fetch user from database
    const [users] = await query(
      'SELECT id, email, role, is_verified, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return sendError(res, 'User not found', 404);
    }

    const user = users[0];

    // Return user data
    return sendSuccess(res, 'User profile retrieved successfully', {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      is_verified: user.is_verified === 1 || user.is_verified === true || user.is_verified === '1'
    });
  } catch (error) {
    next(error);
  }
};
