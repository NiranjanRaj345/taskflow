require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { cacheMiddleware, invalidateCache } = require('./config/redis');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const teamRoutes = require('./routes/teams');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

connectDB();
connectRedis();

app.use(compression());

app.use((req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : true,
  credentials: true,
}));

app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());

app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use((req, res, next) => {
  req.invalidateCache = invalidateCache;
  next();
});

const requestTimeout = parseInt(process.env.REQUEST_TIMEOUT_MS) || 30000;

app.use((req, res, next) => {
  req.setTimeout(requestTimeout);
  res.setTimeout(requestTimeout);
  next();
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health/ready', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is ready',
    timestamp: new Date().toISOString(),
  });
});

app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/tasks', cacheMiddleware(300), taskRoutes);
app.use('/api/teams', cacheMiddleware(600), teamRoutes);

app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await require('mongoose').connection.close();
      logger.info('MongoDB connection closed.');
    } catch (err) {
      logger.error('Error closing MongoDB connection:', err);
    }

    const redisClient = require('./config/redis').getRedisClient();
    if (redisClient) {
      try {
        await redisClient.quit();
        logger.info('Redis connection closed.');
      } catch (err) {
        logger.error('Error closing Redis connection:', err);
      }
    }

    logger.info('Graceful shutdown complete.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

module.exports = { app, server };
