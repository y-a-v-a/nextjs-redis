import { createClient } from 'redis';
import {
  CacheHandlerContext,
  CacheHandlerValue,
  IncrementalCacheValue
} from './types'
import debug from 'debug';

const logger = debug('nextjs-redis');

const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));

export default class CacheHandler {

  private flushToDisk?: CacheHandlerContext['flushToDisk']

  constructor(ctx: CacheHandlerContext) {
    if (ctx.flushToDisk) {
      this.flushToDisk = !!ctx.flushToDisk;
    }
    if (ctx.dev) {
      console.log(`Current mode: ${ctx.dev ? 'development' : 'non-development'}`);
      if (ctx.dev) {
        logger(`nextjs-redis does not work in development mode,
just like NextJS LRU cache and file system cache do not work in development mode.`)
      }
    }
    if (ctx.maxMemoryCacheSize) {
      console.warn('nextjs-redis ignores CacheHandlerContext.maxMemoryCacheSize');
    }
    if (ctx.serverDistDir) {
      console.warn('nextjs-redis ignores CacheHandlerContext.serverDistDir');
    }
    if (ctx.fs) {
      console.warn('nextjs-redis ignores CacheHandlerContext.fs');
    }
    client.connect()
      .then(() => console.log('nextjs-redis connected to Redis server'))
      .catch(() => console.error('Unable to connect to Redis server'));
  }

  public async get(key: string): Promise<CacheHandlerValue | null> {
    logger(`get: ${key}`);
    
    try {
      const redisResponse = await client.get(key);
      if (redisResponse) {
        return JSON.parse(redisResponse);
      }
    } catch(e) {
      logger(e);
    }
    logger(`no data found for key ${key}`);
    return null;
  }

  public async set(
    key: string,
    data: IncrementalCacheValue | null
  ): Promise<void> {
    logger(`set: ${key}`);

    if (!this.flushToDisk) {
      logger(`flushToDisk is false, not storing data in Redis`);
      return;
    }

    if (data) {
      const cacheData: CacheHandlerValue = {
        value:data,
        lastModified: Date.now()
      };
      
      await client.set(key, JSON.stringify(cacheData));
    } else {
      logger(`set: ${key} - no data to store`);
    }
  }
}

process.on('SIGTERM', async () => {
  await client.disconnect();
});

process.on('SIGINT',  async () => {
  await client.disconnect();
});