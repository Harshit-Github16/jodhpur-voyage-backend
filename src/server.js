import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Jodhpur Voyage Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/v1/health`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 ${signal} received. Closing HTTP server gracefully...`);
      server.close(() => {
        console.log('🔒 HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      console.error(`💥 Unhandled Rejection: ${err.message}`);
      // server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
