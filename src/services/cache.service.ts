import NodeCache from "node-cache";
import redisClient from "../config/redis";
import { getNatsClient, EVENTS } from "../config/nats";

const localCache = new NodeCache({
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every 1 minute
});

const CACHE_TTL = parseInt(process.env.CACHE_TTL || "3600"); // 1 hour for Redis

export class CacheService {
  private static instance: CacheService;
  private readonly keyPrefix: string;
  private natsSubscribed: boolean = false;

  private constructor(keyPrefix: string) {
    this.keyPrefix = keyPrefix;
  }

  public static getInstance(keyPrefix: string): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(keyPrefix);
    }
    return CacheService.instance;
  }

  private getKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }

  private async setupNatsSubscription(): Promise<void> {
    if (this.natsSubscribed) return;

    try {
      const nats = getNatsClient();
      await nats.subscribe(EVENTS.MOVIE_CACHE_CLEAR, {
        callback: () => {
          this.clearAllCaches();
        },
      });
      this.natsSubscribed = true;
    } catch (error) {
      console.error("Failed to setup NATS subscription:", error);
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    // Ensure NATS subscription is setup
    await this.setupNatsSubscription();

    const fullKey = this.getKey(key);

    // Try local cache first
    const localData = localCache.get<T>(fullKey);
    if (localData !== undefined) {
      return localData;
    }

    // Try Redis if not in local cache
    const redisData = await redisClient.get(fullKey);
    if (redisData) {
      const parsedData = JSON.parse(redisData) as T;
      // Store in local cache
      localCache.set(fullKey, parsedData);
      return parsedData;
    }

    return null;
  }

  public async set<T>(key: string, data: T): Promise<void> {
    // Ensure NATS subscription is setup
    await this.setupNatsSubscription();

    const fullKey = this.getKey(key);

    // Store in Redis
    await redisClient.setex(fullKey, CACHE_TTL, JSON.stringify(data));

    // Store in local cache
    localCache.set(fullKey, data);
  }

  public async clearAllCaches(): Promise<void> {
    try {
      // Clear local cache
      localCache.flushAll();

      // Clear Redis cache
      const pattern = `${this.keyPrefix}:*`;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      console.error("Error clearing caches:", error);
    }
  }

  public async publishCacheClear(): Promise<void> {
    // Ensure NATS subscription is setup
    await this.setupNatsSubscription();

    try {
      const nats = getNatsClient();
      await nats.publish(EVENTS.MOVIE_CACHE_CLEAR, new Uint8Array());
    } catch (error) {
      console.error("Error publishing cache clear event:", error);
    }
  }
}
