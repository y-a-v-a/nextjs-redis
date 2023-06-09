import { createClient, RedisClientType } from 'redis';
import {
  CacheHandlerContext,
  CacheHandlerValue,
  IncrementalCacheValue
} from './types'
import debug from 'debug';

const logger = debug('nextjs-redis');

export default class CacheHandler {

  private flushToDisk?: CacheHandlerContext['flushToDisk']

  private client!: RedisClientType;

  constructor(ctx: CacheHandlerContext) {
    if (ctx.flushToDisk) {
      this.flushToDisk = !!ctx.flushToDisk;
    }
    if (ctx.dev) {
      logger(`Current mode: ${ctx.dev ? 'development' : 'non-development'}`);
      if (ctx.dev) {
        logger(`Redis based cache does not work in development mode,`);
        logger(
          `just like NextJS LRU cache and file system cache do not work in development mode.`
        );
      }
    }
    if (ctx.maxMemoryCacheSize) {
      console.warn('Redis cache handler ignores CacheHandlerContext.maxMemoryCacheSize');
    }
    if (ctx.serverDistDir) {
      console.warn('Redis cache handler ignores CacheHandlerContext.serverDistDir');
    }
    if (ctx.fs) {
      console.warn('Redis cache handler ignores CacheHandlerContext.fs');
    }

    if (!ctx.dev) {
      this.initialize();
    }
  }

  async initialize() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://0.0.0.0:6379',
    });

    this.client.on('error', err => console.error('Redis Client Error', err));

    this.client
      .connect()
      .then(() => logger('Redis cache handler connected to Redis server'))
      .catch(() => console.error('Unable to connect to Redis server'));

    process.on('SIGTERM', async () => {
      await this.client.disconnect();
    });

    process.on('SIGINT', async () => {
      await this.client.disconnect();
    });
  }

  public async get(key: string): Promise<CacheHandlerValue | null> {
    logger(`Redis get: ${key}`);

    try {
      const redisResponse = await this.client.get(key);
      if (redisResponse) {
        return JSON.parse(redisResponse);
      }
    } catch (e) {
      logger(e);
    }
    logger(`Redis no data found for key ${key}`);
    return null;
  }

  public async set(key: string, data: IncrementalCacheValue | null): Promise<void> {
    logger(`Redis set: ${key}`);

    if (!this.flushToDisk) {
      logger(`Redis flushToDisk is false, not storing data in Redis`);
      return;
    }

    if (data) {
      const cacheData: CacheHandlerValue = {
        value: data,
        lastModified: Date.now(),
      };

      await this.client.set(key, JSON.stringify(cacheData));
    } else {
      logger(`Redis set: ${key} - no data to store`);
    }
  }
}