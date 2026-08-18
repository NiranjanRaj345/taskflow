const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    logger.warn('MONGODB_URI is not configured. Running without MongoDB.');
    return;
  }

  logger.info('Attempting MongoDB connection to: ' + process.env.MONGODB_URI.replace(/\/\/.*@/, '//***@'));

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE) || 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to application termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message);
    logger.warn('Continuing without MongoDB for demo purposes.');
  }
};

module.exports = { connectDB };
