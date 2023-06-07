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
  
  ctx: CacheHandlerContext;

  constructor(ctx: CacheHandlerContext) {
    this.ctx = ctx;
    
    if (ctx.maxMemoryCacheSize) {
      console.warn('nextjs-redis ignores CacheHandlerContext.maxMemoryCacheSize');
    }
    if (ctx.serverDistDir) {
      console.warn('nextjs-redis ignores CacheHandlerContext.serverDistDir');
    }
    if (ctx.flushToDisk) {
      console.warn('nextjs-redis ignores CacheHandlerContext.flushToDisk');
    }
    if (ctx.fs) {
      console.warn('nextjs-redis ignores CacheHandlerContext.fs');
    }
    if (ctx.dev) {
      console.warn('nextjs-redis ignores CacheHandlerContext.dev');
    }
    client.connect();
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
    logger(`data for key ${key} not found`);
    return null;
  }

  public async set(
    key: string,
    data: IncrementalCacheValue | null
  ): Promise<void> {
    logger(`set: ${key}`);

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