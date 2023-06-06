import { createClient } from 'redis';
import {CacheHandlerContext,CacheHandlerValue,IncrementalCacheValue} from './types'
import debug from 'debug';

const logger = debug('nextjs-redis');

const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));

export default class CacheHandler {
  constructor(_ctx: CacheHandlerContext) {
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
    logger(`key ${key} not found`);
    return null;
  }

  public async set(
    key: string,
    data: IncrementalCacheValue | null
  ): Promise<void> {
    logger(`set: ${key}`);
    if (data) {
      const cacheData: CacheHandlerValue = {value:data, lastModified: Date.now()};
      await client.set(key, JSON.stringify(cacheData));
    }
  }
}

process.on('SIGTERM', async () => {
  await client.disconnect();
});

process.on('SIGINT',  async () => {
  await client.disconnect();
});