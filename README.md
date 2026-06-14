# LiveTV

A modern, production-ready live TV streaming application built with Next.js, React, and TypeScript. This application allows you to stream HLS (HTTP Live Streaming) content from M3U playlists with a polished user interface.

## Features

- **HLS Streaming**: High-quality video streaming using HLS.js
- **M3U Playlist Support**: Parse and stream channels from standard M3U playlists
- **Channel Management**: Browse, search, and filter channels by group, country, or quality
- **Favorites System**: Save your favorite channels for quick access
- **Recent History**: Track recently watched channels
- **Responsive Design**: Beautiful dark-themed UI that works on all devices
- **Real-time Updates**: Live clock and stream status indicators
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Error Handling**: Comprehensive error handling and logging
- **Security**: URL validation, input sanitization, and security headers
- **TypeScript**: Fully typed codebase for better development experience

## Screenshots

- Modern dark-themed interface
- Channel browsing with filtering and search
- Real-time video player with controls
- Favorites and recent channels management

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd FIFA-LiveTV-main
```

2. Install dependencies:
```bash
npm install
```

3. Configure your playlist:
   - For localhost: place your M3U playlist file in the project root
   - For Vercel/Cloudflare: set `PLAYLIST_URL` to a raw GitHub URL for your `.m3u` file
   - Or set the `PLAYLIST_FILE` environment variable for local file loading (see Configuration)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

The application can be configured using environment variables. Copy `.env.example` to `.env.local` and customize:

```bash
cp .env.example .env.local
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PLAYLIST_FILE` | Path to your M3U playlist file | `Fifa world cup.m3u` |
| `PLAYLIST_URL` | Remote playlist URL for deployments | unset |
| `NEXT_PUBLIC_APP_NAME` | Application name | `LiveTV` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `1.0.0` |
| `NEXT_PUBLIC_LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` |
| `NEXT_PUBLIC_MAX_RECENT_CHANNELS` | Maximum recent channels to track | `12` |
| `NEXT_PUBLIC_PLAYER_CHROME_HIDE_DELAY` | Player UI hide delay in ms | `2600` |
| `NEXT_PUBLIC_ENABLE_FAVORITES` | Enable favorites feature | `true` |
| `NEXT_PUBLIC_ENABLE_RECENTS` | Enable recent channels feature | `true` |

## Project Structure

```
FIFA-LiveTV-main/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with error boundary
│   └── page.tsx           # Home page
├── components/             # React components
│   ├── channel-card.tsx   # Individual channel card
│   ├── error-boundary.tsx # Error boundary component
│   ├── now-playing-panel.tsx # Current channel info panel
│   ├── tv-experience.tsx  # Main TV experience component
│   └── video-player.tsx   # HLS video player wrapper
├── lib/                    # Utility functions and logic
│   ├── __tests__/         # Unit tests
│   ├── channel-inference.ts # Channel metadata inference
│   ├── channel-utils.ts   # Channel helper functions
│   ├── config.ts          # Configuration management
│   ├── constants.ts       # Application constants
│   ├── hooks.ts           # Custom React hooks
│   ├── logger.ts          # Logging utility
│   ├── playlist.ts        # M3U playlist parser
│   ├── security.ts        # Security utilities
│   ├── storage.ts         # LocalStorage helpers
│   └── types.ts           # TypeScript type definitions
├── public/                 # Static assets
├── .env.example           # Environment variables template
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── jest.config.js         # Jest testing configuration
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run cf:build` - Build with the Cloudflare OpenNext adapter
- `npm run preview` - Preview the Cloudflare worker locally
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run cf-typegen` - Generate Cloudflare env types
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Code Style

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **EditorConfig** for consistent editor settings

### Testing

The project uses Jest and React Testing Library for testing.

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## M3U Playlist Format

The application supports standard M3U playlist format:

```m3u
#EXTINF:-1 tvg-name="ESPN HD" tvg-logo="https://example.com/logo.png" group-title="Sports",ESPN HD
https://example.com/stream.m3u8

#EXTINF:-1 tvg-name="Fox Sports" group-title="Sports",Fox Sports
https://example.com/fox-stream.m3u8
```

### Supported Attributes

- `tvg-name` - Channel name
- `tvg-logo` - Channel logo URL
- `group-title` - Channel group/category

The application will automatically infer:
- Country from channel name or emoji flags
- Quality from name or URL
- Group from patterns in the name

## Production Deployment

### Build

```bash
npm run build
```

### Environment Variables

Ensure all required environment variables are set in your production environment.

### Recommended Deploy Setup

For GitHub-connected deployments, host the playlist from your repository and set:

```bash
PLAYLIST_URL=https://raw.githubusercontent.com/<owner>/<repo>/<branch>/Fifa%20world%20cup.m3u
```

This avoids runtime filesystem access, which is the main reason local-only playlist loading can fail on Vercel or Cloudflare.

### Security

The application includes several security measures:
- Content Security Policy headers
- URL validation for streaming
- Input sanitization
- Rate limiting
- XSS protection

### Platform-Specific Deployment

#### Vercel

1. Connect your repository to Vercel
2. Set `PLAYLIST_URL` in the Vercel project settings
3. Redeploy

#### Cloudflare

1. Connect your GitHub repository in Cloudflare
2. Set `PLAYLIST_URL` in the project environment variables
3. The repository already includes `wrangler.jsonc` and `open-next.config.ts` for the OpenNext adapter
4. Install dependencies and use the Cloudflare build/deploy scripts from `package.json`
5. Redeploy after saving the variable

#### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## Troubleshooting

### Playlist Not Loading

- For deployed apps, set `PLAYLIST_URL` to a raw GitHub URL
- For localhost, ensure your M3U file is in the project root directory
- Check the `PLAYLIST_FILE` or `PLAYLIST_URL` environment variable
- Verify the file format is valid M3U
- Check server logs for error messages

### Streams Not Playing

- Ensure the stream URLs are accessible
- Check browser console for HLS errors
- Verify CORS settings on streaming servers
- Some streams may be geo-blocked

### Performance Issues

- Reduce the number of channels in your playlist
- Adjust `MAX_RECENT_CHANNELS` if needed
- Check browser performance settings

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm test && npm run lint`)
5. Format your code (`npm run format`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Standards

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass
- Run type checking before committing

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [HLS.js](https://github.com/video-dev/hls.js) - HLS streaming library
- [Lucide React](https://lucide.dev/) - Icon library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework (inspiration for design)

## Support

For issues, questions, or contributions, please open an issue on the repository.
