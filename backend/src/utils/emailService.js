const nodemailer = require('nodemailer');

/**
 * Email service for sending OTP emails
 * Uses Gmail SMTP configuration from environment variables
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // Use TLS (true for 465, false for other ports like 587)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Send OTP email to user
 * @param {string} email - Recipient email address
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise} Promise that resolves when email is sent
 * @throws {Error} Throws error with detailed message if email sending fails
 */
const sendOTPEmail = async (email, otpCode) => {
  let transporter;
  
  try {
    // Validate SMTP configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      const error = new Error('SMTP configuration missing: SMTP_USER and SMTP_PASS must be set in environment variables');
      console.error('❌ Email Service Error:', error.message);
      throw error;
    }

    // Create transporter
    transporter = createTransporter();

    // Verify transporter connection before sending
    console.log('📧 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset OTP - Multiplus Financial Services',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You have requested to reset your password for your Multiplus Financial Services account.</p>
          <p>Your OTP code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
            ${otpCode}
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you did not request this password reset, please ignore this email.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">© Multiplus Financial Services</p>
        </div>
      `,
      text: `
        Password Reset Request
        
        You have requested to reset your password for your Multiplus Financial Services account.
        
        Your OTP code is: ${otpCode}
        
        This code will expire in 5 minutes.
        
        If you did not request this password reset, please ignore this email.
        
        © Multiplus Financial Services
      `
    };

    // Send email
    console.log(`📧 Sending OTP email to: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully. Message ID: ${info.messageId}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Detailed error logging with stack trace
    console.error('\n❌ Email Sending Error - Detailed Information:');
    console.error('='.repeat(60));
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code || 'N/A');
    console.error('Error Command:', error.command || 'N/A');
    console.error('Error Response:', error.response || 'N/A');
    console.error('Error ResponseCode:', error.responseCode || 'N/A');
    console.error('SMTP Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
    console.error('SMTP Port:', process.env.SMTP_PORT || '587');
    console.error('SMTP User:', process.env.SMTP_USER || 'NOT SET');
    console.error('SMTP Pass:', process.env.SMTP_PASS ? '***SET***' : 'NOT SET');
    console.error('\nFull Error Stack:');
    console.error(error.stack);
    console.error('='.repeat(60) + '\n');

    // Create meaningful error message
    let errorMessage = 'Failed to send email';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'SMTP authentication failed. Please check your SMTP_USER and SMTP_PASS credentials.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Unable to connect to SMTP server. Please check your SMTP_HOST and SMTP_PORT settings.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'SMTP connection timed out. Please check your network connection and SMTP settings.';
    } else if (error.message) {
      errorMessage = `Failed to send email: ${error.message}`;
    }

    // Throw error with meaningful message
    const emailError = new Error(errorMessage);
    emailError.originalError = error;
    throw emailError;
  }
};

module.exports = {
  sendOTPEmail
};
