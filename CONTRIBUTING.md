# Contributing to LiveTV

Thank you for your interest in contributing to LiveTV! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Git

### Setup

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/FIFA-LiveTV-main.git
cd FIFA-LiveTV-main
```

3. Install dependencies:
```bash
npm install
```

4. Create a branch for your changes:
```bash
git checkout -b feature/your-feature-name
```

5. Make your changes and test them

## Development Workflow

### Making Changes

1. **Code Style**: Follow the existing code style (ESLint + Prettier)
2. **TypeScript**: Ensure all code is properly typed
3. **Testing**: Add tests for new features
4. **Documentation**: Update relevant documentation

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting and Formatting

```bash
# Run linting
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check

# Type checking
npm run type-check
```

## Pull Request Process

1. Update the README and other documentation if needed
2. Ensure all tests pass
3. Ensure code is properly formatted
4. Ensure no linting errors
5. Update the changelog if needed
6. Submit a pull request with:
   - Clear description of changes
   - Related issue numbers
   - Screenshots for UI changes
   - Testing instructions

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Tests have been added/updated
- [ ] Documentation has been updated
- [ ] All tests pass
- [ ] No linting errors
```

## Project Structure

```
FIFA-LiveTV-main/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Core logic and utilities
│   ├── __tests__/         # Unit tests
│   ├── config.ts          # Configuration
│   ├── logger.ts          # Logging
│   ├── security.ts        # Security utilities
│   └── ...
└── public/                 # Static assets
```

### Adding Components

- Place components in `components/`
- Use TypeScript for type safety
- Follow naming conventions (kebab-case for files)
- Add appropriate props interfaces
- Include JSDoc comments for complex logic

### Adding Utilities

- Place utilities in `lib/`
- Add tests in `lib/__tests__/`
- Export functions clearly
- Include error handling
- Add logging for debugging

## Coding Standards

### TypeScript

- Use strict mode
- Avoid `any` types
- Use interfaces for object shapes
- Use type aliases for unions
- Add JSDoc for public APIs

### React

- Use functional components with hooks
- Follow React best practices
- Use proper dependency arrays in useEffect
- Implement proper cleanup in effects
- Use memoization for expensive computations

### Naming Conventions

- **Files**: kebab-case (`channel-card.tsx`)
- **Components**: PascalCase (`ChannelCard`)
- **Functions**: camelCase (`getPlaylist`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RECENTS`)
- **Interfaces**: PascalCase (`Channel`)

### Code Organization

- Group imports by type (external, internal, relative)
- Place hooks at the top of components
- Separate concerns into smaller functions
- Use descriptive variable names
- Add comments for complex logic

## Testing Guidelines

### Writing Tests

- Write tests for all new features
- Test both success and error cases
- Mock external dependencies
- Use descriptive test names
- Keep tests focused and independent

### Test Structure

```typescript
describe('feature-name', () => {
  describe('specific-function', () => {
    it('should do something', () => {
      // Arrange
      const input = ...;
      
      // Act
      const result = ...;
      
      // Assert
      expect(result).toBe(...);
    });
  });
});
```

## Documentation

### Updating Documentation

- Update README.md for user-facing changes
- Update code comments for API changes
- Add JSDoc for public functions
- Update this file for process changes

### README.md

Keep the README.md file:
- Up to date with current features
- Clear and concise
- Including installation instructions
- Including configuration options

## Issues and Bug Reports

### Reporting Bugs

When reporting bugs, include:
- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, browser, Node.js version)
- Screenshots if applicable

### Feature Requests

When requesting features, include:
- Clear description of the feature
- Use case / motivation
- Possible implementation approach
- Alternatives considered

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Push to main branch
5. Create GitHub release

## Questions?

If you have questions about contributing, please open an issue and tag it with "question".
