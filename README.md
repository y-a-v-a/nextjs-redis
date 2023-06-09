# NextJS Redis

NextJS Incremental cache offloaded to Redis. Better known as a package to be added to the `incrementalCacheHandlerPath` entry in the nextjs config file.

NextJS uses an in-memory LRU cache and can flush cache to disk. Any package in `incrementalCacheHandlerPath` that matches a cache handler class as described in [the documentation](https://nextjs.org/docs/app/api-reference/next-config-js/incrementalCacheHandlerPath) will replace the default behavior. `nextjs-redis` connects to port `6379` on `127.0.0.1` to `GET` and `SET` entries in Redis.

Under development - not published (yet) - very basic – not used in production.

Types are copied over from nextjs git repo.

```
$ docker run --name some-redis -p 6379:6379 -d redis
```

```sh
$ NEXT_RUNTIME=nodejs DEBUG='nextjs-redis' next start
```

https://redis.io/docs/clients/nodejs/

https://redis.io/docs/data-types/strings/

https://github.com/vercel/next.js/blob/canary/packages/next/src/server/response-cache/index.ts

https://nextjs.org/docs/app/api-reference/next-config-js/incrementalCacheHandlerPath


### NextJS Config

In `next.config.js` in version 13 and higher, one needs to put an absolute path, or a path that can be resolved from the dist dir (usually `.next`). In order to use this package, the easiest way is to make a file in `src` and `import` and `export` this package again, for example named `CacheHandler.ts`.
This page cache only works when `fallback` is _not_ set to false in your `getStaticPaths`; it works either with `fallback: true` with explicit loading UI or when set to `fallback: 'blocking'`. See also the [documentation on fallback](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths)


```ts
import CacheHandler from 'nextjs-redis';
export CacheHandler;
```

```js
const config = {
  // ...
  incrementalCacheHandlerPath: 'CacheHandler.ts',
}
```

Lower than version 13, in `next.config.js` one can put the package's name, NextJS will just `require()` it.

```js
const config = {
  // ...
  experimental: {
    incrementalCacheHandlerPath: 'nextjs-redis',
  },
}
```

```redis
FLUSHDB
GET /index
KEYS *
```