# Tech Stack

This document outlines the technologies used in the Qwen Code project.

## Runtime & Language

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | >= 20.0.0 | Runtime environment |
| TypeScript | ^5.3.3 | Primary language (strict mode) |
| ESM | - | Module system (`"type": "module"`) |

## Terminal UI

| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^19.1.0 | Component model for terminal UI |
| Ink | ^6.2.3 | React renderer for CLI interfaces |
| ink-spinner | ^5.0.0 | Loading spinners |
| ink-gradient | ^3.0.0 | Gradient text effects |
| ink-link | ^4.1.0 | Clickable terminal links |
| highlight.js | ^11.11.1 | Syntax highlighting |
| lowlight | ^3.3.0 | AST-based syntax highlighting |

## AI & LLM Integration

| Technology | Version | Purpose |
|------------|---------|---------|
| @google/genai | 1.16.0 | Google Gemini API client |
| openai | 5.11.0 | OpenAI-compatible API client |
| @modelcontextprotocol/sdk | ^1.15.1 | MCP protocol for tool integration |
| tiktoken | ^1.0.21 | Token counting for context management |

## CLI Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| yargs | ^17.7.2 | Command-line argument parsing |
| dotenv | ^17.1.0 | Environment variable management |
| command-exists | ^1.2.9 | Check for system commands |
| update-notifier | ^7.3.1 | CLI update notifications |
| qrcode-terminal | ^0.12.0 | QR code generation for auth |

## File System & Git

| Technology | Version | Purpose |
|------------|---------|---------|
| simple-git | ^3.28.0 | Git operations |
| glob | ^10.4.5 | File pattern matching |
| fdir | ^6.4.6 | Fast directory traversal |
| picomatch | ^4.0.1 | Glob pattern matching |
| ignore | ^7.0.0 | .gitignore-style file filtering |
| tar | ^7.5.1 | Archive handling |
| extract-zip | ^2.0.1 | ZIP extraction |

## Networking & HTTP

| Technology | Version | Purpose |
|------------|---------|---------|
| undici | ^7.10.0 | HTTP client |
| ws | ^8.18.0 | WebSocket client |
| https-proxy-agent | ^7.0.6 | HTTPS proxy support |
| google-auth-library | ^9.11.0 | Google OAuth authentication |

## Data Processing

| Technology | Version | Purpose |
|------------|---------|---------|
| zod | ^3.23.8 | Schema validation |
| ajv | ^8.17.1 | JSON Schema validation |
| ajv-formats | ^3.0.0 | Format validation for AJV |
| marked | ^15.0.12 | Markdown parsing |
| html-to-text | ^9.0.5 | HTML to text conversion |
| diff | ^7.0.0 | Text diff generation |
| comment-json | ^4.2.5 | JSON with comments parsing |
| jsonrepair | ^3.13.0 | Malformed JSON repair |
| @iarna/toml | ^2.2.5 | TOML parsing |

## Terminal & PTY

| Technology | Version | Purpose |
|------------|---------|---------|
| @xterm/headless | 5.5.0 | Headless terminal emulation |
| @lydell/node-pty | 1.1.0 | Pseudo-terminal support |
| node-pty | ^1.0.0 | Alternative PTY library |
| shell-quote | ^1.8.3 | Shell command parsing |

## Observability

| Technology | Version | Purpose |
|------------|---------|---------|
| @opentelemetry/api | ^1.9.0 | Telemetry API |
| @opentelemetry/sdk-node | ^0.203.0 | Node.js telemetry SDK |
| @opentelemetry/exporter-*-otlp-http | ^0.203.0 | OTLP HTTP exporters |
| @opentelemetry/exporter-*-otlp-grpc | ^0.203.0 | OTLP gRPC exporters |
| @opentelemetry/resource-detector-gcp | ^0.40.0 | GCP resource detection |

## VS Code Extension

| Technology | Version | Purpose |
|------------|---------|---------|
| VS Code API | ^1.99.0 | Extension integration |
| Express | ^5.1.0 | Local HTTP server for IDE communication |
| cors | ^2.8.5 | CORS middleware |
| @vscode/vsce | ^3.6.0 | Extension packaging |

## Build Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| esbuild | ^0.25.0 | Bundling and transpilation |
| tsx | ^4.20.3 | TypeScript execution |
| npm workspaces | - | Monorepo management |

## Testing

| Technology | Version | Purpose |
|------------|---------|---------|
| Vitest | ^3.2.4 | Test runner |
| @vitest/coverage-v8 | ^3.1.1 | Code coverage |
| @testing-library/react | ^16.3.0 | React component testing |
| ink-testing-library | ^4.0.0 | Ink component testing |
| msw | ^2.10.4 | API mocking |
| mock-fs | ^5.5.0 | Filesystem mocking |
| memfs | ^4.42.0 | In-memory filesystem |
| jsdom | ^26.1.0 | DOM simulation |

## Code Quality

| Technology | Version | Purpose |
|------------|---------|---------|
| ESLint | ^9.24.0 | Linting (flat config) |
| typescript-eslint | ^8.30.1 | TypeScript ESLint parser |
| eslint-plugin-react | ^7.37.5 | React linting rules |
| eslint-plugin-react-hooks | ^5.2.0 | Hooks linting rules |
| eslint-plugin-import | ^2.31.0 | Import/export linting |
| @vitest/eslint-plugin | ^1.3.4 | Vitest linting rules |
| Prettier | ^3.5.3 | Code formatting |
| Husky | ^9.1.7 | Git hooks |
| lint-staged | ^16.1.6 | Staged files linting |

## Utility Libraries

| Technology | Version | Purpose |
|------------|---------|---------|
| uuid | ^9.0.1 | UUID generation |
| chardet | ^2.1.0 | Character encoding detection |
| fast-levenshtein | ^2.0.6 | String distance calculation |
| mnemonist | ^0.40.3 | Data structures (LRU cache, etc.) |
| fzf | ^0.5.2 | Fuzzy finding |
| mime | 4.0.7 | MIME type detection |
| string-width | ^7.1.0 | String display width calculation |
| strip-ansi | ^7.1.0 | ANSI escape code removal |
| wrap-ansi | 9.0.2 | Word wrapping with ANSI support |
| open | ^10.1.2 | Open URLs/files in default app |
| semver | ^7.7.2 | Semantic versioning utilities |

## Containerization

| Technology | Purpose |
|------------|---------|
| Docker | Sandbox container builds |
| Podman | Alternative container runtime |
| macOS Seatbelt | Native macOS sandboxing |

## Package Structure

```
@ai-masters-community/qwen-agents-code          # CLI package (React/Ink UI)
@ai-masters-community/qwen-agents-code-core     # Core backend (API, tools, services)
qwen-code-vscode-ide-companion # VS Code extension
@ai-masters-community/qwen-agents-code-test-utils # Shared test utilities
```
