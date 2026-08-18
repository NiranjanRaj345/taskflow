const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  if (!process.env.REDIS_HOST && !process.env.REDIS_PORT) {
    console.warn('Redis configuration missing. Running without Redis caching.');
    return null;
  }

  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis connected successfully'));

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error('Redis connection failed:', error.message);
    console.warn('Continuing without Redis caching for demo purposes.');
    return null;
  }
};

const getRedisClient = () => redisClient;

const cacheMiddleware = (ttl = 3600) => {
  return async (req, res, next) => {
    if (!redisClient || req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      res.locals.cacheKey = key;
      res.locals.cacheTtl = ttl;
      next();
    } catch (error) {
      next();
    }
  };
};

const invalidateCache = async (pattern) => {
  if (!redisClient) return;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error.message);
  }
};

module.exports = { connectRedis, getRedisClient, cacheMiddleware, invalidateCache };
