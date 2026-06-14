# Migration Guide

This guide helps you migrate from the original version to the production-ready version of LiveTV.

## Overview

The project has been significantly refactored and improved for production use. This guide outlines the changes you need to make to update your existing setup.

## Breaking Changes

### 1. Environment Variables

**Before**: Configuration was hardcoded
**After**: Configuration via environment variables

**Action Required**:
1. Copy `.env.example` to `.env.local`
2. Set your playlist file path:
   ```bash
   PLAYLIST_FILE=your-playlist.m3u
   ```

### 2. Dependencies

**New Dependencies Added**:
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "prettier": "^3.8.4",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-prettier": "^5.5.6"
  }
}
```

**Action Required**:
```bash
npm install
```

## File Structure Changes

### New Files

**Configuration**:
- `.env.example` - Environment variables template
- `.prettierrc` - Prettier configuration
- `.prettierignore` - Prettier ignore patterns
- `.editorconfig` - Editor configuration
- `jest.config.js` - Jest testing configuration
- `jest.setup.js` - Jest setup file

**Core Logic**:
- `lib/types.ts` - TypeScript type definitions
- `lib/config.ts` - Configuration management
- `lib/logger.ts` - Logging system
- `lib/security.ts` - Security utilities
- `lib/cache.ts` - Caching system
- `lib/constants.ts` - Application constants
- `lib/channel-utils.ts` - Channel helper functions
- `lib/channel-inference.ts` - Channel metadata inference
- `lib/storage.ts` - LocalStorage helpers
- `lib/hooks.ts` - Custom React hooks

**Components**:
- `components/error-boundary.tsx` - Error boundary component
- `components/video-player.tsx` - Video player wrapper
- `components/channel-card.tsx` - Channel card component
- `components/now-playing-panel.tsx` - Now playing panel

**Tests**:
- `lib/__tests__/channel-utils.test.ts` - Channel utilities tests
- `lib/__tests__/security.test.ts` - Security utilities tests

**Documentation**:
- `README.md` - Comprehensive project documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version changelog
- `PERFORMANCE.md` - Performance optimization guide
- `MIGRATION.md` - This migration guide

### Modified Files

**`lib/playlist.ts`**:
- Added configuration support
- Added caching
- Added security validation
- Added error handling
- Refactored to use new utilities

**`components/tv-experience.tsx`**:
- Refactored into smaller components
- Added error handling
- Added configuration support
- Improved type safety
- Added memoization

**`app/layout.tsx`**:
- Added error boundary
- Added viewport meta tag

**`app/page.tsx`**:
- Added error handling
- Added logging
- Added configuration validation

**`app/globals.css`**:
- Added styles for new components
- Added error state styles
- Improved responsive design

**`next.config.ts`**:
- Added security headers
- Added image optimization
- Added performance optimizations
- Added compression

**`package.json`**:
- Added new scripts (test, format, type-check)
- Added new dependencies
- Updated existing scripts

**`.gitignore`**:
- Added more ignore patterns
- Added security-related ignores
- Added testing ignores

## Migration Steps

### 1. Backup Your Current Version

```bash
cp -r FIFA-LiveTV-main FIFA-LiveTV-backup
```

### 2. Update Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your playlist file:
```bash
PLAYLIST_FILE=your-playlist.m3u
```

### 4. Update Your Playlist

Ensure your M3U playlist file is in the project root or set the correct path in `.env.local`.

### 5. Test the Application

```bash
npm run dev
```

Visit http://localhost:3000 and verify:
- Channels load correctly
- Video playback works
- Favorites and recents function
- Search and filtering work

### 6. Run Tests

```bash
npm test
```

### 7. Build for Production

```bash
npm run build
npm start
```

## Code Changes Required

If you have custom code, you may need to update:

### Import Paths

Some imports may have changed. Update your custom code:

```typescript
// Before
import { Channel } from '@/lib/playlist'

// After
import { Channel } from '@/lib/types'
```

### Configuration

Replace hardcoded values with environment variables:

```typescript
// Before
const PLAYLIST_FILE = 'Fifa world cup.m3u';

// After
import { config } from '@/lib/config';
const playlistFile = config.playlistFile;
```

### Error Handling

Update error handling to use the new logger:

```typescript
// Before
console.error('Error:', error);

// After
import { logger } from '@/lib/logger';
logger.error('Error description', error);
```

## Feature Changes

### New Features

1. **Error Boundary**: Catches and displays React errors gracefully
2. **Logging System**: Comprehensive logging with levels
3. **Caching**: In-memory caching for better performance
4. **Security**: URL validation, input sanitization, security headers
5. **Testing**: Jest test suite with coverage
6. **Code Formatting**: Prettier for consistent code style
7. **Type Safety**: Improved TypeScript types
8. **Configuration**: Environment-based configuration

### Behavior Changes

1. **Playlist Loading**: Now cached for 10 minutes
2. **Error Messages**: More detailed error messages
3. **Logging**: More verbose logging (configurable)
4. **Security**: Stricter URL validation in production

## Rollback Plan

If you need to rollback:

1. Restore from backup:
```bash
cp -r FIFA-LiveTV-backup/* FIFA-LiveTV-main/
```

2. Reinstall original dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Support

If you encounter issues during migration:

1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Ensure your playlist file is valid
4. Check browser console for client-side errors
5. Review this migration guide
6. Open an issue on GitHub with details

## Summary

The migration process involves:
1. ✅ Installing new dependencies
2. ✅ Setting up environment variables
3. ✅ Updating your playlist configuration
4. ✅ Testing the application
5. ✅ Optional: Updating custom code

The new version provides significant improvements in:
- 🚀 Performance (caching, memoization)
- 🔒 Security (validation, headers)
- 🧪 Testing (Jest suite)
- 📝 Documentation (comprehensive guides)
- 🛠️ Developer Experience (tooling, type safety)
- 📊 Monitoring (logging, cache stats)
