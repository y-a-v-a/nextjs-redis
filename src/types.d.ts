
export interface CacheFs {
  readFile(f: string): Promise<string>
  readFileSync(f: string): string
  writeFile(f: string, d: any): Promise<void>
  mkdir(dir: string): Promise<void | string>
  stat(f: string): Promise<{ mtime: Date }>
}

export interface CachedRedirectValue {
  kind: 'REDIRECT'
  props: Object
}

export interface IncrementalCachedPageValue {
  kind: 'PAGE'
  // this needs to be a string since the cache expects to store
  // the string value
  html: string
  pageData: Object
}

export interface CachedImageValue {
  kind: 'IMAGE'
  etag: string
  buffer: Buffer
  extension: string
  isMiss?: boolean
  isStale?: boolean
}

export type IncrementalCacheValue =
  | CachedRedirectValue
  | IncrementalCachedPageValue
  | CachedImageValue

export interface CacheHandlerContext {
  fs: CacheFs
  dev?: boolean
  flushToDisk?: boolean
  serverDistDir: string
  maxMemoryCacheSize?: number
  _appDir?: boolean
}

export interface CacheHandlerValue {
  lastModified?: number
  value: IncrementalCacheValue | null
}
