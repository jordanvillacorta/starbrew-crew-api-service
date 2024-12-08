// const Redis = require('ioredis');
// const { REDIS_HOST, REDIS_PORT } = require('./dotenv');

// Simple in-memory cache fallback
const memoryCache = new Map();

// let redisClient;
// try {
//     redisClient = new Redis({
//         host: REDIS_HOST || '127.0.0.1',
//         port: REDIS_PORT || 6379,
//         retryStrategy: (times) => {
//             const delay = Math.min(times * 50, 2000);
//             return delay;
//         },
//         maxRetriesPerRequest: 3,
//         enableOfflineQueue: false,
//     });

//     redisClient.on('error', (err) => {
//         console.warn('Redis connection error, falling back to memory cache:', err);
//         redisClient = null;
//     });
// } catch (err) {
//     console.warn('Failed to initialize Redis, using memory cache instead:', err);
//     redisClient = null;
// }

// Wrapper that falls back to memory cache if Redis is unavailable
const cacheWrapper = {
    get: async (key) => {
        // if (redisClient) {
        //     return await redisClient.get(key);
        // }
        return memoryCache.get(key);
    },
    set: async (key, value, option, ttl) => {
        // if (redisClient) {
        //     return await redisClient.set(key, value, option, ttl);
        // }
        memoryCache.set(key, value);
        if (ttl) {
            setTimeout(() => memoryCache.delete(key), ttl * 1000);
        }
    }
};

module.exports = cacheWrapper;
