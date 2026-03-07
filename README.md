# ESLint Config Setup

[![CI](https://github.com/sebastian-software/eslint-config-setup/actions/workflows/ci.yml/badge.svg)](https://github.com/sebastian-software/eslint-config-setup/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/eslint-config-setup.svg)](https://www.npmjs.com/package/eslint-config-setup)
[![npm downloads](https://img.shields.io/npm/dm/eslint-config-setup.svg)](https://www.npmjs.com/package/eslint-config-setup)
[![Codecov](https://img.shields.io/codecov/c/github/sebastian-software/eslint-config-setup)](https://codecov.io/gh/sebastian-software/eslint-config-setup)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/node/v/eslint-config-setup.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org)
[![ESLint](https://img.shields.io/badge/ESLint-9.22+-4B32C3.svg)](https://eslint.org)

The ESLint config for teams that ship with AI and want to move fast.

Most ESLint configs compose rules at runtime from dozens of plugins. That means version conflicts, plugin mismatches, and "works on my machine" differences. **ESLint Config Setup** resolves every rule at build time — you get a flat, pre-built config where every rule is already decided. No runtime composition, no surprises.

- **AI guardrails** — a dedicated `ai` mode that enforces what code review can't: explicit types, strict naming, no magic values, complexity limits. Rules that humans find tedious are trivial for an AI to follow. The AI doesn't push back. It just fixes the code.
- **OxLint-ready** — a single `oxlint` flag disables every ESLint rule that OxLint already covers, and `getOxlintConfig()` generates a matching OxLint config. No manual migration, no rule conflicts, no coverage gaps. Run both linters, get the full rule set at 100x the speed.
- **27 plugins, one import** — TypeScript (`strictTypeChecked`), React 19, import cycles, security, browser compat, spell checking, and more. Every rule pre-resolved at build time. No plugin conflicts, no version mismatches.

```typescript
// eslint.config.ts
import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({ react: true, ai: true })
```

## Quick Start

```bash
npx eslint-config-setup init
```

Without flags, `init` opens the interactive terminal wizard.

If you prefer explicit, scriptable setup:

```bash
npx eslint-config-setup init --react --ai --oxlint --formatter oxfmt --vscode --agents --hooks
npx eslint-config-setup init --react --ai --oxlint --formatter oxfmt --vscode --agents --hook-provider husky
```

This scaffolds `eslint.config.ts`, optional `oxlint.config.ts`, package scripts, an `AGENTS.md`, VS Code settings, and an optional pre-commit hook preset via native `.githooks` or Husky.

Useful follow-ups:

```bash
npx eslint-config-setup init --react --oxlint --formatter oxfmt --dry-run
npx eslint-config-setup init --react --force
npx eslint-config-setup doctor
```

`init` protects existing config files, scripts, and companion files by default. If it detects conflicting content, it stops and shows what would be replaced. Use `--force` only when you intentionally want to overwrite replaceable targets.

If you prefer to wire things manually:

```bash
npm install -D eslint-config-setup eslint typescript
```

```typescript
// eslint.config.ts
import { getEslintConfig } from "eslint-config-setup"

export default await getEslintConfig({ react: true })
```

## Configuration flags

| Flag | Default | What it does |
|------|---------|--------------|
| `react` | `false` | React 19+ with Hooks, Compiler, JSX-A11y, Storybook, Testing Library |
| `node` | `false` | Node.js globals, `eslint-plugin-n`. Disables browser compat checks. |
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

- [Getting Started](https://sebastian-software.github.io/eslint-config-setup/guide/getting-started) — installation and setup
- [CLI Workflow](https://sebastian-software.github.io/eslint-config-setup/guide/cli-workflow) — scaffold and validate projects with `init` and `doctor`
- [AI Mode](https://sebastian-software.github.io/eslint-config-setup/guide/ai-mode) — why AI-generated code needs different rules
- [OxLint Integration](https://sebastian-software.github.io/eslint-config-setup/guide/oxlint) — run ESLint + OxLint without conflicts
- [All 27 Plugins](https://sebastian-software.github.io/eslint-config-setup/guide/plugins) — what's included and why
- [Configuration](https://sebastian-software.github.io/eslint-config-setup/guide/configuration) — flags and usage examples
- [Rule API](https://sebastian-software.github.io/eslint-config-setup/guide/rule-api) — rule manipulation and scoped overrides
- [Architecture](https://sebastian-software.github.io/eslint-config-setup/guide/architecture) — how pre-generation works

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, architecture overview, and PR guidelines.

## License

[MIT](LICENSE) — Copyright (c) 2025 [Sebastian Software GmbH](https://sebastian-software.com)
