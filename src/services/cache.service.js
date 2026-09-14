import cache from '../config/redis.js';

export const getCachedData = async (key) => {
  return await cache.get(key);
};

export const setCachedData = async (key, data, ttlSeconds = 300) => {
  return await cache.set(key, data, ttlSeconds);
};

export const invalidateCache = async (pattern) => {
  return await cache.flushPattern(pattern);
};
