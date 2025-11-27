# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Qwen Code is an AI-powered CLI tool adapted from Google's Gemini CLI, optimized for Qwen3-Coder models. It's a TypeScript monorepo using npm workspaces with React/Ink for the terminal UI.

## Common Commands

```bash
# Build
npm run build              # Build all packages
npm run build:all          # Build including sandbox container

# Test
npm run test               # Run unit tests (all packages in parallel)
npm run test:e2e           # Run integration tests (no sandbox)
npm run test:integration:sandbox:docker  # Integration tests with Docker sandbox

# Run a single test file
npx vitest run path/to/test.test.ts --config packages/cli/vitest.config.ts

# Quality
npm run lint               # ESLint check
npm run lint:fix           # Auto-fix lint issues
npm run format             # Prettier formatting
npm run typecheck          # TypeScript type checking
npm run preflight          # Full quality check (clean, format, lint, build, typecheck, test)

# Development
npm run start              # Run the CLI
npm run debug              # Debug mode with inspector
DEV=true npm start         # Development mode (enables React DevTools)
```

## Architecture

### Package Structure

```
packages/
├── cli/     # UI layer - React/Ink terminal interface, commands, user interaction
├── core/    # Backend - API clients, tool orchestration, services
├── vscode-ide-companion/  # VS Code extension
└── test-utils/            # Shared test utilities
```

### CLI → Core Relationship

The CLI package depends on `@qwen-code/qwen-code-core`. User input flows from CLI to Core, which handles prompt construction, API communication, and tool execution, then returns responses for CLI to render.

### Core Tools System

Tools in `packages/core/src/tools/` implement capabilities: file operations (read, write, glob, ls), shell execution, web operations (fetch, search), memory management, MCP protocol, and diff/edit operations.

### Key Services (`packages/core/src/services/`)

- `chatCompressionService` - Conversation history compression
- `shellExecutionService` - Command execution with approval
- `loopDetectionService` - Prevents infinite loops
- `gitService` - Git operations

## Code Style Requirements

### TypeScript
- Strict mode enabled with all strict flags
- Use ES6 imports, never `require()`
- Type assertions use `as` syntax
- Prefix unused variables with `_`
- Use `type` imports for type-only imports

### ESLint Rules
- No default exports in CLI package (`import/no-default-export`)
- No relative imports between packages (`import/no-relative-packages`)
- Arrow functions for callbacks (`prefer-arrow-callback`)
- Throw Error objects, not strings
- No `any` type (`@typescript-eslint/no-explicit-any`)

### React/Ink
- React 19+ with JSX runtime
- Use hooks (react-hooks plugin enforced)
- For accessibility, use `useIsScreenReaderEnabled` hook and ARIA props

## Testing

- **Framework**: Vitest with v8 coverage
- **Unit tests**: Located in `packages/*/src/**/*.test.ts`
- **Integration tests**: Located in `integration-tests/`
- **Mocking**: Uses `msw` for API mocking, `mock-fs`/`memfs` for filesystem

## Environment Variables

```bash
GEMINI_SANDBOX=false|docker|podman  # Sandbox mode for integration tests
VERBOSE=true                         # Detailed test output
KEEP_OUTPUT=true                     # Preserve temp files after tests
DEBUG=1                              # Enable debug mode
```

## Configuration Files

- `.qwen/settings.json` - User settings (in home directory)
- `.qwen-ignore` - File exclusion patterns (like .gitignore)
