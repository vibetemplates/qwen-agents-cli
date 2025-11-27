# @ai-masters-community/qwen-agents-code-core

Core library for Qwen Code CLI. Provides API clients, tool orchestration, and backend services.

## Installation

```bash
npm install @ai-masters-community/qwen-agents-code-core
npm install @ai-masters-community/qwen-agents-code
```

## Overview

This package contains the backend functionality for Qwen Code:

- **API Clients** - Communication with Qwen/OpenAI-compatible APIs
- **Tools System** - File operations, shell execution, web operations, memory management
- **Services** - Chat compression, loop detection, git operations
- **MCP Protocol** - Model Context Protocol integration

## Requirements

- Node.js >= 20

## Usage

This package is primarily used as a dependency of `@ai-masters-community/qwen-agents-code`. For standalone usage, import the required modules:

```typescript
import { /* modules */ } from '@ai-masters-community/qwen-agents-code-core';
```

## License

Apache-2.0
