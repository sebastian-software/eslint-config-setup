# ESLint Config Setup

Stop managing ESLint configs. Start shipping.

One import. 25+ plugins. TypeScript, React, Node.js, AI-assisted code, OxLint — all handled. Every combination pre-built at compile time, so your editor never waits.

## Quick Start

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
| `node` | `false` | Node.js globals and `eslint-plugin-n` rules |
| `ai` | `false` | Strict rules for AI-assisted development |
| `oxlint` | `false` | Disables ESLint rules covered by OxLint |

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

- [Getting Started](https://sebastian-software.github.io/eslint-config-setup/guide/getting-started) — installation and basic usage
- [Configuration](https://sebastian-software.github.io/eslint-config-setup/guide/configuration) — flags and usage examples
- [Rule API](https://sebastian-software.github.io/eslint-config-setup/guide/rule-api) — rule manipulation and scoped rules
- [AI Mode](https://sebastian-software.github.io/eslint-config-setup/guide/ai-mode) — strict rules for AI-generated code
- [OxLint Integration](https://sebastian-software.github.io/eslint-config-setup/guide/oxlint) — 50-100x faster linting
- [Included Plugins](https://sebastian-software.github.io/eslint-config-setup/guide/plugins) — all 25+ plugins listed
- [Architecture](https://sebastian-software.github.io/eslint-config-setup/guide/architecture) — how pre-generation works

## License

MIT
