# Contributing to Contribution Margin Chart

Thank you for your interest in contributing to Contribution Margin Chart! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- pnpm >= 8.0.0 (recommended) or npm >= 8.0.0

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/contribution-margin-chart.git
cd contribution-margin-chart
```

3. Add the upstream remote:

```bash
git remote add upstream https://github.com/contribution-margin/contribution-margin-chart.git
```

## Development Setup

### Install Dependencies

```bash
pnpm install
```

### Build All Packages

```bash
pnpm build
```

### Run Tests

```bash
pnpm test
```

### Project Structure

```
contribution-margin-chart/
├── packages/
│   ├── core/           # @contribution-margin/core
│   │   ├── src/
│   │   │   ├── calculator/   # CVPCalculator
│   │   │   ├── validator/    # CVPValidator
│   │   │   ├── layout/       # LayoutEngine
│   │   │   ├── formatter/    # ValueFormatter
│   │   │   ├── types/        # TypeScript types
│   │   │   └── constants/    # Constants & presets
│   │   └── tests/
│   └── chartjs/        # @contribution-margin/chartjs
│       └── src/
├── examples/
│   └── basic-chartjs/  # Demo application
├── docs/               # Documentation
└── ...
```

## Making Changes

### Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(core): add support for custom color palettes
fix(chartjs): correct BEP line position calculation
docs: update README with new examples
```

## Pull Request Process

1. **Update from upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure all tests pass:**
   ```bash
   pnpm test
   ```

3. **Ensure code is properly formatted:**
   ```bash
   pnpm format
   pnpm lint
   ```

4. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub with:
   - Clear description of changes
   - Reference to related issues (if any)
   - Screenshots for UI changes

6. **Respond to feedback** and make requested changes

## Coding Standards

### TypeScript

- Use TypeScript for all source code
- Enable strict mode
- Export types from public API
- Use explicit return types for public functions

### Code Style

- Use Prettier for formatting
- Follow ESLint rules
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Example

```typescript
/**
 * Calculates the break-even point in sales units.
 *
 * @param fixedCosts - Total fixed costs
 * @param contributionMarginPerUnit - Contribution margin per unit
 * @returns Break-even point in units, or null if contribution margin is zero
 */
export function calculateBreakEvenUnits(
  fixedCosts: number,
  contributionMarginPerUnit: number
): number | null {
  if (contributionMarginPerUnit === 0) {
    return null;
  }
  return fixedCosts / contributionMarginPerUnit;
}
```

## Testing

### Writing Tests

- Use Vitest for testing
- Write unit tests for all public functions
- Include edge cases and error scenarios
- Aim for high test coverage

### Test File Location

Tests should be placed in the `tests/` directory of each package:

```
packages/core/
├── src/
│   └── calculator/
│       └── CVPCalculator.ts
└── tests/
    └── CVPCalculator.test.ts
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test:core
pnpm test:chartjs

# Run tests in watch mode
pnpm --filter @contribution-margin/core test:watch
```

## Documentation

### Code Documentation

- Add JSDoc comments for all public exports
- Include parameter descriptions and return types
- Add examples where helpful

### README Updates

- Update README.md when adding new features
- Keep examples current and working
- Document breaking changes

### API Documentation

- Update docs/ folder for significant API changes
- Include migration guides for breaking changes

## Questions?

If you have questions about contributing, feel free to:

1. Open an issue for discussion
2. Ask in the pull request

Thank you for contributing! 🎉
