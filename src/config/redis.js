// In-memory / Redis cache manager with graceful degradation
const cacheStore = new Map();

export const cache = {
  get: async (key) => {
    const item = cacheStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      cacheStore.delete(key);
      return null;
    }
    return item.value;
  },
  set: async (key, value, ttlSeconds = 300) => {
    cacheStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  },
  del: async (key) => {
    cacheStore.delete(key);
  },
  flushPattern: async (pattern) => {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of cacheStore.keys()) {
      if (regex.test(key)) {
        cacheStore.delete(key);
      }
    }
  }
};

export default cache;
