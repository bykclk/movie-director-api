// Mock function declarations
const mockRedisGet = jest.fn();
const mockRedisSetex = jest.fn();
const mockRedisKeys = jest.fn();
const mockRedisDel = jest.fn();
const mockNatsPublish = jest.fn();
const mockNatsSubscribe = jest.fn();
const mockNodeCacheGet = jest.fn();
const mockNodeCacheSet = jest.fn();
const mockNodeCacheFlushAll = jest.fn();

// Mock NATS client
const mockNatsClient = {
  publish: mockNatsPublish,
  subscribe: mockNatsSubscribe,
};

// Mock dependencies
jest.mock('../src/config/redis', () => ({
  __esModule: true,
  default: {
    get: mockRedisGet,
    setex: mockRedisSetex,
    keys: mockRedisKeys,
    del: mockRedisDel,
  },
}));

jest.mock('../src/config/nats', () => ({
  __esModule: true,
  getNatsClient: jest.fn(() => mockNatsClient),
  EVENTS: {
    MOVIE_CACHE_CLEAR: 'movie.cache.clear',
  },
}));

jest.mock('node-cache', () => {
  return jest.fn().mockImplementation(() => ({
    get: mockNodeCacheGet,
    set: mockNodeCacheSet,
    flushAll: mockNodeCacheFlushAll,
  }));
});

import { CacheService } from '../src/services/cache.service';
import { EVENTS } from '../src/config/nats';

describe('CacheService', () => {
  let cacheService: CacheService;
  const testPrefix = 'test';
  const testKey = 'test-key';
  const testData = { id: 1, name: 'Test' };

  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    jest.spyOn(require('../src/config/nats'), 'getNatsClient').mockReturnValue(mockNatsClient);
    mockNatsPublish.mockClear();
    mockNatsSubscribe.mockClear();
    cacheService = CacheService.getInstance(testPrefix);
  });

  describe('get', () => {
    it('should return data from local cache if available', async () => {
      mockNodeCacheGet.mockReturnValue(testData);

      const result = await cacheService.get(testKey);

      expect(result).toEqual(testData);
      expect(mockRedisGet).not.toHaveBeenCalled();
    });

    it('should fetch from Redis if not in local cache', async () => {
      mockNodeCacheGet.mockReturnValue(undefined);
      mockRedisGet.mockResolvedValue(JSON.stringify(testData));

      const result = await cacheService.get(testKey);

      expect(result).toEqual(testData);
      expect(mockRedisGet).toHaveBeenCalledWith(`${testPrefix}:${testKey}`);
    });

    it('should return null if data not found in either cache', async () => {
      mockNodeCacheGet.mockReturnValue(undefined);
      mockRedisGet.mockResolvedValue(null);

      const result = await cacheService.get(testKey);

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store data in both Redis and local cache', async () => {
      await cacheService.set(testKey, testData);

      expect(mockRedisSetex).toHaveBeenCalledWith(
        `${testPrefix}:${testKey}`,
        3600,
        JSON.stringify(testData)
      );
      expect(mockNodeCacheSet).toHaveBeenCalledWith(
        `${testPrefix}:${testKey}`,
        testData
      );
    });
  });

  describe('clearAllCaches', () => {
    it('should clear both Redis and local cache', async () => {
      const mockKeys = ['key1', 'key2'];
      mockRedisKeys.mockResolvedValue(mockKeys);

      await cacheService.clearAllCaches();

      expect(mockNodeCacheFlushAll).toHaveBeenCalled();
      expect(mockRedisKeys).toHaveBeenCalledWith(`${testPrefix}:*`);
      expect(mockRedisDel).toHaveBeenCalledWith(...mockKeys);
    });

    it('should handle empty Redis keys', async () => {
      mockRedisKeys.mockResolvedValue([]);

      await cacheService.clearAllCaches();

      expect(mockNodeCacheFlushAll).toHaveBeenCalled();
      expect(mockRedisDel).not.toHaveBeenCalled();
    });
  });

  describe('publishCacheClear', () => {
    it('should publish cache clear event to NATS', async () => {
      await cacheService.publishCacheClear();
      expect(mockNatsPublish).toHaveBeenCalledWith(
        EVENTS.MOVIE_CACHE_CLEAR,
        new Uint8Array()
      );
    });

    it('should handle NATS publish error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockNatsPublish.mockRejectedValue(new Error('NATS error'));

      await cacheService.publishCacheClear();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error publishing cache clear event:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('singleton behavior', () => {
    it('should return the same instance for multiple getInstance calls', () => {
      const instance1 = CacheService.getInstance('test1');
      const instance2 = CacheService.getInstance('test2');

      expect(instance1).toBe(instance2);
    });
  });
}); 