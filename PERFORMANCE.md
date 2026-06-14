# Performance Optimization Guide

This document outlines the performance optimizations implemented in the LiveTV application.

## Implemented Optimizations

### 1. Caching

**Memory Cache (`lib/cache.ts`)**
- In-memory caching for frequently accessed data
- Configurable TTL (Time To Live) for cache entries
- Automatic cleanup of expired entries
- Cache statistics for monitoring

**Cached Operations**
- Playlist parsing results (10 minute TTL)
- Channel data
- Favorites and recent channels

**Usage**
```typescript
import { cache, CACHE_KEYS } from '@/lib/cache';

// Get from cache
const data = cache.get<DataType>(CACHE_KEYS.KEY);

// Set in cache
cache.set(CACHE_KEYS.KEY, data, ttl);

// Check if exists
if (cache.has(CACHE_KEYS.KEY)) {
  // ...
}
```

### 2. React Performance

**Component Memoization**
- `ChannelCard` wrapped with `React.memo` to prevent unnecessary re-renders
- `NowPlayingPanel` wrapped with `React.memo` for static prop optimization

**Hooks Optimization**
- Custom hooks (`useFavorites`, `useRecents`) with proper dependency management
- `useMemo` for expensive computations (channel filtering, grouping)
- `useCallback` for event handlers to prevent function recreation

**Effect Cleanup**
- Proper cleanup of timers and event listeners
- HLS.js instance cleanup to prevent memory leaks

### 3. Next.js Optimizations

**Configuration (`next.config.ts`)**
- `swcMinify`: Faster minification with SWC compiler
- `compress`: Gzip compression enabled
- `reactStrictMode`: Strict mode for development
- `optimizePackageImports`: Optimized imports for lucide-react

**Image Optimization**
- AVIF and WebP format support
- Lazy loading for images (`loading="lazy"`)
- Remote pattern configuration for external images
- SVG security with CSP

### 4. Code Splitting

**Dynamic Imports**
- Components are structured for optimal code splitting
- Lazy loading can be implemented for large channel lists

**Bundle Size**
- Tree shaking enabled
- Only imported functions are bundled
- Optimized package imports

### 5. Streaming Performance

**HLS.js Configuration**
```typescript
{
  lowLatencyMode: true,
  backBufferLength: 60,
  enableWorker: true
}
```
- Low latency mode for real-time streaming
- Back buffer optimization
- Web Worker for better performance

### 6. Data Loading

**Playlist Parsing**
- Efficient M3U parsing with regex optimization
- Early validation to skip invalid entries
- Caching of parsed results
- Incremental parsing for large playlists

## Monitoring Performance

### Cache Statistics

Monitor cache performance:
```typescript
const stats = cache.getStats();
console.log('Cache size:', stats.size);
console.log('Cache keys:', stats.keys);
```

### Browser DevTools

**Performance Tab**
- Record user interactions
- Analyze script execution time
- Check memory usage

**Network Tab**
- Monitor network requests
- Check for unnecessary requests
- Verify caching headers

**React DevTools Profiler**
- Profile component rendering
- Identify slow components
- Check for unnecessary re-renders

## Best Practices

### 1. Use Memoization

```typescript
// Good - useMemo for expensive computations
const filteredChannels = useMemo(() => {
  return channels.filter(/* ... */);
}, [channels, filters]);

// Good - useCallback for event handlers
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

### 2. Avoid Inline Functions

```typescript
// Bad - creates new function on each render
<Button onClick={() => doSomething()} />

// Good - stable function reference
const handleClick = useCallback(() => doSomething(), []);
<Button onClick={handleClick} />
```

### 3. Lazy Load Images

```typescript
// Good - lazy loading for images below the fold
<img src={logo} alt={name} loading="lazy" />
```

### 4. Optimize Lists

```typescript
// Good - memoized list items
{items.map(item => (
  <MemoizedItem key={item.id} item={item} />
))}
```

### 5. Debounce Search

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((query) => performSearch(query), 300),
  []
);
```

## Performance Targets

- **Initial Load**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **First Contentful Paint**: < 1 second
- **Channel Switching**: < 500ms
- **Search Response**: < 200ms

## Future Optimizations

### Planned
1. **Virtual Scrolling** for large channel lists
2. **Service Worker** for offline support
3. **IndexedDB** for larger local storage needs
4. **Web Workers** for playlist parsing
5. **CDN** for static assets
6. **Progressive Loading** for channel logos

### Monitoring
1. **Analytics** integration for performance tracking
2. **Error tracking** with performance context
3. **Real User Monitoring (RUM)**
4. **Performance budgets** in build process

## Troubleshooting

### Slow Channel Loading

1. Check cache is working
2. Verify playlist file size
3. Monitor network requests
4. Check browser console for errors

### Memory Issues

1. Check for memory leaks in HLS.js
2. Verify cleanup functions are called
3. Monitor cache size
4. Check for unnecessary re-renders

### High CPU Usage

1. Optimize filtering logic
2. Add virtual scrolling
3. Reduce update frequency
4. Check for infinite loops in effects

## Resources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web.dev Performance](https://web.dev/performance/)
- [HLS.js Performance](https://github.com/video-dev/hls.js/blob/master/docs/API.md#optimize-performance)
