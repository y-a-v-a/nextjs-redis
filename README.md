# NextJS Redis

NextJS Incremental cache offloaded to Redis.

Under development - not published (yet) - very basic – not used in production.

```
$ docker run --name some-redis -p 6379:6379 -d redis
```

https://redis.io/docs/clients/nodejs/

https://redis.io/docs/data-types/strings/

https://github.com/vercel/next.js/blob/canary/packages/next/src/server/response-cache/index.ts

https://nextjs.org/docs/app/api-reference/next-config-js/incrementalCacheHandlerPath


### NextJS Config

In `next.config.js`

```js
const config = {
  // ...
  incrementalCacheHandlerPath: 'nextjs-redis',
}
```

Lower than version 13, in `next.config.js`

```js
const config = {
  // ...
  experimental: {
    incrementalCacheHandlerPath: 'nextjs-redis',
  },
}
```