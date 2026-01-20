const mysql = require('mysql2/promise');

/**
 * MySQL Connection Pool Configuration
 * Production-ready connection pool with proper error handling
 * Uses environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
 */

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  const timestamp = new Date().toISOString();
  console.error(`\n❌ [${timestamp}] Missing required database environment variables:`);
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n⚠️  Please configure your .env file with the required database credentials.');
  console.error('⚠️  Refer to .env.example for the required variables.\n');
  
  if (process.env.NODE_ENV === 'production') {
    console.error('🛑 Exiting due to missing database configuration in production\n');
    process.exit(1);
  } else {
    console.error('⚠️  Continuing in development mode, but database operations will fail.\n');
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Production options
  timezone: '+00:00',
  dateStrings: false,
  supportBigNumbers: true,
  bigNumberStrings: false
});

// Connection state tracking
let isConnected = false;
let connectionError = null;

// Test connection on startup with clear failure reporting
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    const timestamp = new Date().toISOString();
    console.log(`✅ [${timestamp}] MySQL database connected successfully`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   User: ${process.env.DB_USER}`);
    connection.release();
    isConnected = true;
    connectionError = null;
  } catch (err) {
    const timestamp = new Date().toISOString();
    isConnected = false;
    connectionError = err;
    
    console.error(`\n❌ [${timestamp}] DATABASE CONNECTION FAILED`);
    console.error('=' .repeat(60));
    console.error(`Error: ${err.message}`);
    console.error(`Code: ${err.code || 'UNKNOWN'}`);
    
    if (err.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible causes:');
      console.error('   - MySQL server is not running');
      console.error('   - Wrong host/port in DB_HOST');
      console.error('   - Firewall blocking connection');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Possible causes:');
      console.error('   - Incorrect DB_USER or DB_PASSWORD');
      console.error('   - User does not have access to the database');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Possible causes:');
      console.error('   - Database does not exist');
      console.error('   - Incorrect DB_NAME');
      console.error(`   - Create database: CREATE DATABASE ${process.env.DB_NAME};`);
    }
    
    console.error('\n📋 Current configuration:');
    console.error(`   DB_HOST: ${process.env.DB_HOST}`);
    console.error(`   DB_USER: ${process.env.DB_USER}`);
    console.error(`   DB_NAME: ${process.env.DB_NAME}`);
    console.error(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : '(not set)'}`);
    console.error('=' .repeat(60) + '\n');
    
    if (process.env.NODE_ENV === 'production') {
      console.error('🛑 Exiting due to database connection failure in production\n');
      process.exit(1);
    } else {
      console.error('⚠️  Server will continue, but database queries will fail.\n');
    }
  }
};

// Initialize connection test
testConnection();

// Handle pool errors with clear reporting
pool.on('error', (err) => {
  const timestamp = new Date().toISOString();
  isConnected = false;
  connectionError = err;
  
  console.error(`❌ [${timestamp}] MySQL Pool Error:`, err.message);
  console.error(`   Error Code: ${err.code || 'UNKNOWN'}`);
  
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('⚠️  Database connection was closed. Reconnecting...');
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('⚠️  Database has too many connections');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('⚠️  Database connection was refused');
  }
});

/**
 * Query helper function
 * Executes SQL queries with parameterized values
 * Returns promise that resolves to [rows, fields]
 * 
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters (optional)
 * @returns {Promise<Array>} Promise resolving to [rows, fields]
 * @throws {Error} Throws clear error if database connection fails
 */
const query = async (sql, params = []) => {
  // Check connection status before querying
  if (!isConnected && connectionError) {
    const errorMessage = `Database connection failed: ${connectionError.message}`;
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] Query failed - ${errorMessage}`);
    throw new Error(errorMessage);
  }

  try {
    const [rows, fields] = await pool.query(sql, params);
    return [rows, fields];
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] Query Error:`, error.message);
    console.error(`   SQL: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
    console.error(`   Params:`, params);
    console.error(`   Code: ${error.code || 'UNKNOWN'}`);
    
    // Update connection state on connection errors
    if (error.code === 'PROTOCOL_CONNECTION_LOST' || 
        error.code === 'ECONNREFUSED' || 
        error.code === 'ER_ACCESS_DENIED_ERROR') {
      isConnected = false;
      connectionError = error;
    }
    
    throw error;
  }
};

module.exports = {
  pool,
  query
};
