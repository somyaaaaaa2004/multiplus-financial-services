const { query } = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * Seed admin user into database
 * Idempotent function - safe to run multiple times
 * Creates admin user if it doesn't exist, or updates password if needed
 */
const seedAdmin = async () => {
  try {
    const adminEmail = 'admin.multiplus@gmail.com';
    const adminPassword = '123456';

    // Check if admin user exists
    const [existingAdmins] = await query(
      'SELECT id, password_hash FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existingAdmins.length === 0) {
      // Admin doesn't exist - create it
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

      await query(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
        [adminEmail, hashedPassword, 'admin']
      );

      console.log('✅ Admin user seeded: admin.multiplus@gmail.com');
    } else {
      // Admin exists - verify password is correctly hashed
      const adminUser = existingAdmins[0];
      
      // Check if the stored password can verify against the expected password
      const isValid = await bcrypt.compare(adminPassword, adminUser.password_hash);
      
      if (!isValid) {
        // Password hash is incorrect or password changed - update it
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
        
        await query(
          'UPDATE users SET password_hash = ?, role = ? WHERE email = ?',
          [hashedPassword, 'admin', adminEmail]
        );
        
        console.log('✅ Admin password updated');
      } else {
        // Ensure role is set to admin (in case it was changed)
        await query(
          'UPDATE users SET role = ? WHERE email = ? AND role != ?',
          ['admin', adminEmail, 'admin']
        );
        
        console.log('✅ Admin user already exists and is valid');
      }
    }
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error.message);
    // Don't throw - allow server to start even if admin seeding fails
    // This prevents server startup failure in case of database issues
    if (process.env.NODE_ENV === 'production') {
      console.error('⚠️  Admin seeding failed in production - continuing anyway');
    }
  }
};

module.exports = seedAdmin;
