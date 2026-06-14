# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Modular code structure with separate utility files
- Comprehensive error handling and logging system
- Configuration management with environment variables
- Security utilities with URL validation and input sanitization
- TypeScript type definitions and interfaces
- Testing setup with Jest and React Testing Library
- ESLint and Prettier configuration
- Comprehensive documentation (README, CONTRIBUTING, CHANGELOG)
- Error boundary component for React error handling
- Custom React hooks for favorites and recent channels
- Rate limiting implementation
- Security headers in Next.js configuration

### Changed
- Refactored large components into smaller, reusable pieces
- Improved type safety across the codebase
- Enhanced M3U playlist parsing with better error handling
- Updated localStorage operations with proper error handling
- Improved channel inference logic
- Added validation to streaming URLs

### Security
- Added URL validation for streaming URLs
- Implemented input sanitization
- Added security headers (CSP, X-Frame-Options, etc.)
- Rate limiting for API operations
- Private IP blocking in production

## [0.1.0] - Initial Release

### Added
- HLS streaming support with HLS.js
- M3U playlist parsing
- Channel browsing and filtering
- Favorites system
- Recent channels history
- Search functionality
- Responsive dark-themed UI
- Real-time clock
- Video player controls
- Fullscreen support
- Mute toggle
- Group filtering
- Country and quality inference
