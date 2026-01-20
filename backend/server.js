require('dotenv').config();
const app = require('./src/app');
const initDb = require('./src/config/initDb');
const seedAdmin = require('./src/utils/seedAdmin');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database tables
    await initDb();

    // Seed admin user (idempotent - safe to run multiple times)
    await seedAdmin();

    // Start server - bind to 0.0.0.0 for Railway deployment
    const HOST = process.env.HOST || '0.0.0.0';
    const server = app.listen(PORT, HOST, () => {
      const timestamp = new Date().toISOString();
      console.log('\n' + '='.repeat(60));
      console.log('🚀 Multiplus Financial Services - Backend Server');
      console.log('='.repeat(60));
      console.log(`📅 Started: ${timestamp}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🔌 Host: ${HOST}`);
      console.log(`🔌 Port: ${PORT}`);
      console.log(`📡 Health: /api/health`);
      console.log(`🔗 API Base: /api`);
      console.log('='.repeat(60) + '\n');
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n⚠️  SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Promise Rejection:', err);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

startServer();

