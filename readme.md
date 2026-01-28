# eslint-config-setup

[![CI][ci-img]][ci] [![Version][npm-version-img]][npm] [![Downloads][npm-downloads-img]][npm] [![Node][node-img]][npm] [![License][github-license-img]][github] [![TypeScript][ts-img]][ts]

[ci]: https://github.com/sebastian-software/eslint-config-setup/actions/workflows/node.js.yml
[ci-img]: https://github.com/sebastian-software/eslint-config-setup/actions/workflows/node.js.yml/badge.svg
[npm]: https://www.npmjs.com/package/eslint-config-setup
[npm-downloads-img]: https://badgen.net/npm/dm/eslint-config-setup
[npm-version-img]: https://badgen.net/npm/v/eslint-config-setup
[node-img]: https://badgen.net/badge/node/%3E=22/green
[github]: https://github.com/sebastian-software/eslint-config-setup
[github-license-img]: https://badgen.net/github/license/sebastian-software/eslint-config-setup
[ts]: https://www.typescriptlang.org
[ts-img]: https://badgen.net/badge/Built%20with/TypeScript/blue

**Pre-generated, opinionated ESLint configurations for TypeScript projects. Zero runtime overhead. Full type-checking. AI-ready.**

**[Documentation](https://sebastian-software.github.io/eslint-config-setup/)** · [Getting Started](https://sebastian-software.github.io/eslint-config-setup/guide/getting-started) · [AI Mode](https://sebastian-software.github.io/eslint-config-setup/guide/ai-mode)

## Quick Start

```bash
npm install eslint-config-setup
```

```typescript
// eslint.config.ts
import { getConfig } from "eslint-config-setup"

export default [
  { ignores: ["node_modules", "dist"] },
  ...(await getConfig({ strict: true, react: true }))
]
```

## Features

- **Pre-Generated** — All 16 configurations ship as static JavaScript. No runtime overhead.
- **Full Type-Checking** — Every config uses TypeScript's `projectService`. Rules like `no-floating-promises` actually work.
- **AI-Ready** — Strict feedback loops that push AI to write better code. Complexity limits, size limits, and code quality rules.
- **12+ Plugins** — TypeScript-ESLint, React, Hooks, Compiler, JSX-A11y, Storybook, Vitest, Playwright, JSDoc, RegExp, SonarJS, Node.js.
- **File-Aware** — Automatic rule adjustments for test files, E2E specs, stories, configs, and type declarations.
- **Customizable** — Change severity while preserving rule configuration with simple helper functions.

## Configuration

Four flags. Combine them freely.

```typescript
await getConfig({ strict: true })                                    // TypeScript library
await getConfig({ strict: true, node: true })                        // Node.js project
await getConfig({ strict: true, react: true })                       // React app
await getConfig({ strict: true, node: true, react: true, ai: true }) // Full stack + AI
```

See the [full documentation](https://sebastian-software.github.io/eslint-config-setup/) for configuration details, AI mode rules, file-specific behavior, and customization options.

## License

[Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)

## Sponsors

<a href="https://www.sebastian-software.de"><img src="https://cdn.rawgit.com/sebastian-software/sebastian-software-brand/0d4ec9d6/sebastiansoftware-en.svg" alt="Sebastian Software GmbH" width="460" height="160"/></a>

Copyright 2024-2026 [Sebastian Software GmbH](https://www.sebastian-software.de)
