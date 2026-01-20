const { query } = require('./db');

/**
 * Initialize database tables
 * Call this on server startup to ensure database tables are ready
 */
const initDb = async () => {
  try {
    // Create users table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        is_verified BOOLEAN DEFAULT FALSE,
        otp_code VARCHAR(6) DEFAULT NULL,
        otp_expiry BIGINT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Add OTP columns to existing tables if they don't exist
    // MySQL doesn't support IF NOT EXISTS for ALTER TABLE, so we check first
    try {
      const [columns] = await query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME IN ('otp_code', 'otp_expiry', 'is_verified')
      `);
      
      const existingColumns = columns.map(col => col.COLUMN_NAME);
      
      if (!existingColumns.includes('otp_code')) {
        await query(`ALTER TABLE users ADD COLUMN otp_code VARCHAR(6) DEFAULT NULL`);
        console.log('✅ Added otp_code column to users table');
      }
      
      if (!existingColumns.includes('otp_expiry')) {
        await query(`ALTER TABLE users ADD COLUMN otp_expiry BIGINT DEFAULT NULL`);
        console.log('✅ Added otp_expiry column to users table');
      }
      
      if (!existingColumns.includes('is_verified')) {
        await query(`ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE`);
        console.log('✅ Added is_verified column to users table');
      }
    } catch (error) {
      // Table might not exist yet or other error - ignore if columns already exist
      if (!error.message.includes('Duplicate column name')) {
        console.warn('⚠️  Could not check/add OTP columns:', error.message);
      }
    }

    console.log('✅ Users table ready');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
};

module.exports = initDb;
