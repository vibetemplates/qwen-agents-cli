# Qwen Code - Project Guidelines

## Project Overview

Qwen Code is an interactive CLI agent specializing in software engineering tasks. It's a TypeScript monorepo built with Node.js, featuring a terminal-based UI using Ink (React for CLI) and integrating with AI models via DashScope/OpenAI-compatible APIs.

## Repository Structure

```
packages/
├── cli/          # Main CLI application (Ink-based terminal UI)
├── core/         # Core business logic, tools, AI integration
├── test-utils/   # Shared testing utilities
└── vscode-ide-companion/  # VS Code extension for IDE integration

scripts/          # Build, test, and utility scripts
integration-tests/  # End-to-end integration tests
docs/             # Documentation
eslint-rules/     # Custom ESLint rules
```

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js
- **UI Framework**: Ink (React for CLI terminals)
- **Build Tool**: esbuild
- **Testing**: Vitest
- **Linting**: ESLint (flat config)
- **Package Manager**: npm (workspaces)

## Development Commands

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Run specific package tests
npm test -w packages/core
npm test -w packages/cli

# Run integration tests
npm run test:integration

# Lint code
npm run lint

# Type check
npm run typecheck

# Start development mode
npm start
```

## Code Conventions

### TypeScript
- Use strict TypeScript with explicit types
- Prefer `type` over `interface` for object types (project convention)
- Use `.js` extensions in imports (ESM requirement)
- All files should have the license header comment

### File Organization
- Test files are co-located with source files (`*.test.ts`, `*.test.tsx`)
- Use barrel exports (`index.ts`) for public APIs
- Generated files go in `generated/` directories

### Imports
- Use absolute imports within packages via package name
- No relative cross-package imports (enforced by custom ESLint rule)
- Import order: external deps → internal packages → relative imports

### React/Ink Components
- Functional components with hooks
- Use `useIsScreenReaderEnabled` hook for accessibility
- Support both screen reader and default layouts

### Testing
- Use Vitest for unit tests
- Integration tests in `/integration-tests` directory
- Mock external services in tests
- Test files follow `*.test.ts` or `*.test.tsx` naming

## Key Packages

### @ai-masters-community/qwen-code-core
Core functionality including:
- Tool implementations (edit, grep, glob, shell, etc.)
- AI content generation (Qwen/DashScope integration)
- MCP (Model Context Protocol) client
- Configuration management
- Subagent system

### @ai-masters-community/qwen-code-cli
CLI application including:
- Ink-based terminal UI
- Command processing
- User authentication
- Session management
- Non-interactive mode support

## Tools System

Tools are defined in `packages/core/src/tools/`:
- `edit.ts` - File editing with diff support
- `grep.ts` - Content search using ripgrep
- `glob.ts` - File pattern matching
- `shell.ts` - Shell command execution
- `read-file.ts` / `read-many-files.ts` - File reading
- `write-file.ts` - File writing
- `task.ts` - Subagent task delegation
- `todoWrite.ts` - Task list management
- `memoryTool.ts` - Persistent memory storage
- `web-fetch.ts` - Web content fetching
- `mcp-client.ts` - MCP server integration

## Configuration

- Global config: `~/.qwen/` directory
- Project config: `QWEN.md` files in project directories
- Settings schema defined in `packages/cli/src/config/settingsSchema.ts`

## Approval Modes

- `plan` - Planning mode, requires approval for all actions
- `default` - Standard mode with confirmation prompts
- `auto-edit` - Auto-approve file edits
- `yolo` - Auto-approve all actions (use with caution)

## Important Patterns

### Error Handling
- Use typed errors from `tool-error.ts`
- Graceful degradation for non-critical failures
- User-friendly error messages in CLI output

### Async Operations
- Use AbortSignal for cancellation support
- Stream output updates via callbacks
- Handle background processes appropriately

### Security
- Never expose API keys or secrets
- Validate file paths before operations
- Sandbox support for isolated execution

## Building for Production

```bash
# Full production build
npm run build

# Build specific package
npm run build -w packages/cli

# Prepare release package
npm run prepare-package
```

## Debugging

- Set `--debug` flag for verbose logging
- Check `~/.qwen/logs/` for log files
- Use VS Code debugger with provided launch configs
