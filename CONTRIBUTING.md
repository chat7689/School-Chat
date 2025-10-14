# Contributing to Block Racers Online

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to Block Racers Online.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. We expect all participants to:

- Be respectful and considerate
- Welcome newcomers warmly
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, trolling, or discriminatory comments
- Publishing others' private information
- Spam or excessive self-promotion
- Any conduct that would be inappropriate in a professional setting

## Getting Started

### Prerequisites

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/School-Chat.git
   cd School-Chat
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/chat7689/School-Chat.git
   ```
4. Follow [SETUP.md](docs/SETUP.md) to configure your development environment

### Setting Up Development Environment

```bash
# Install dependencies
npm install
cd functions && npm install && cd ..

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Start Firebase emulators
firebase emulators:start

# In another terminal, start dev server
npm run dev
```

## Development Process

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Write code following our [coding standards](#coding-standards)
   - Add tests if applicable
   - Update documentation

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add awesome feature"
   ```

4. **Stay updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to GitHub and create a PR
   - Fill out the PR template
   - Link any related issues

## Coding Standards

### JavaScript Style

We use ESLint and Prettier for code formatting:

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Code Style Guidelines

#### Naming Conventions

```javascript
// Classes: PascalCase
class PhysicsEngine {
}

// Functions/Variables: camelCase
const playerSpeed = 10;
function calculateJump() {
}

// Constants: UPPER_SNAKE_CASE
const MAX_PLAYERS = 8;
const GRAVITY_CONSTANT = 0.042;

// Files: kebab-case
// physics-engine.js
// player-controller.js
```

#### Function Documentation

Always document functions with JSDoc:

```javascript
/**
 * Calculate the jump height for a player
 * @param {number} size - Player size in pixels
 * @param {number} jumpPower - Jump power multiplier
 * @returns {number} Jump height in pixels
 */
function calculateJumpHeight(size, jumpPower) {
  return size * 4 + jumpPower;
}
```

#### Error Handling

Always handle errors appropriately:

```javascript
// Use try-catch for async operations
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  errorHandler.log(error, { context: 'operationName' });
  errorHandler.showUser('Operation failed', 'error');
  throw error; // Re-throw if caller needs to handle
}
```

#### Async/Await

Prefer async/await over Promises:

```javascript
// Good
async function loadLevel(levelId) {
  const data = await database.ref(`levels/${levelId}`).once('value');
  return data.val();
}

// Avoid
function loadLevel(levelId) {
  return database.ref(`levels/${levelId}`).once('value')
    .then(data => data.val());
}
```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process or auxiliary tools

**Examples:**

```
feat(multiplayer): add party invitation system

- Add invite button to party screen
- Implement invitation notifications
- Add invitation acceptance/rejection logic

Closes #123
```

```
fix(physics): correct jump height calculation

The jump height was off by 2 pixels due to integer rounding.
Now uses Math.round() for accurate physics.

Fixes #456
```

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No console.logs or debug code
- [ ] Works in Firefox, Chrome, and Edge

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)

## Related Issues
Fixes #(issue number)
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge

## Reporting Bugs

### Before Reporting

1. Check existing issues
2. Try latest version
3. Try to reproduce in a clean environment

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 10.2.0]

**Additional Context**
Any other relevant information
```

## Suggesting Features

### Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Problem It Solves**
What problem does this address?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought of

**Additional Context**
Mockups, examples, etc.
```

## Areas for Contribution

### High Priority

- [ ] Mobile/touch support
- [ ] Performance optimization
- [ ] Anti-cheat improvements
- [ ] Accessibility features
- [ ] Localization/i18n

### Medium Priority

- [ ] More cosmetic items
- [ ] Achievement system
- [ ] Replay system
- [ ] Spectator mode

### Good First Issues

Look for issues tagged `good-first-issue` on GitHub. These are specifically chosen to be beginner-friendly.

## Getting Help

- **Documentation**: Check [docs/](docs/) folder
- **Discord**: [Join our server](#) (coming soon)
- **GitHub Discussions**: Ask questions
- **Email**: your-email@example.com

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the game (for significant contributions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Block Racers Online! 🎮⚡
