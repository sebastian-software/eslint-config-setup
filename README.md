# ESLint Config Setup

Stop configuring ESLint. Start shipping.

One import. 25 plugins. TypeScript, React, Node.js, browser compatibility, AI guardrails, OxLint — all handled. Every combination pre-built at compile time, so your editor stays instant.

## Quick Start

```bash
npm install -D eslint-config-setup eslint typescript
```

```typescript
// eslint.config.ts
import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({ react: true })
```

That's it. You get type-checked TypeScript, React 19 with Hooks and Compiler, import cycle detection, security rules, spell checking, browser compatibility checks, JSON/Markdown linting, and Vitest/Playwright overrides — all from a single function call.

## Configuration flags

| Flag | Default | What it does |
|------|---------|--------------|
| `react` | `false` | React 19+ with Hooks, Compiler, JSX-A11y, Storybook, Testing Library |
| `node` | `false` | Node.js globals, `eslint-plugin-n`, promise-based API preferences |
| `ai` | `false` | Strict guardrails for AI-generated code (naming, types, complexity) |
| `oxlint` | `false` | Disables ESLint rules already covered by OxLint |

Flags are independent. Combine them however you need.

## Customizing rules

```typescript
import { getEslintConfig, disableRule, addRule } from "eslint-config-setup"

const config = await getEslintConfig({ react: true, ai: true })

disableRule(config, "@typescript-eslint/no-magic-numbers", { scope: "tests" })
addRule(config, "no-console", "off", { scope: "scripts" })

export default config
```

## Documentation

Visit the [documentation site](https://sebastian-software.github.io/eslint-config-setup/) for full details:

- [Getting Started](https://sebastian-software.github.io/eslint-config-setup/guide/getting-started) — installation and basic setup
- [Configuration](https://sebastian-software.github.io/eslint-config-setup/guide/configuration) — flags and usage examples
- [Rule API](https://sebastian-software.github.io/eslint-config-setup/guide/rule-api) — rule manipulation and scoped overrides
- [AI Mode](https://sebastian-software.github.io/eslint-config-setup/guide/ai-mode) — strict rules for AI-generated code
- [OxLint Integration](https://sebastian-software.github.io/eslint-config-setup/guide/oxlint) — 50-100x faster linting
- [All 25 Plugins](https://sebastian-software.github.io/eslint-config-setup/guide/plugins) — what's included and why
- [Architecture](https://sebastian-software.github.io/eslint-config-setup/guide/architecture) — how pre-generation works

## License

MIT
