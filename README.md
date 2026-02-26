# @effective/eslint-config

Pre-generated, permutation-based ESLint flat configs for modern TypeScript & React projects.

## Features

- **32 pre-generated configs** — zero runtime overhead, instant editor feedback
- **5 permutation flags** — `react`, `node`, `strict`, `ai`, `oxlint`
- **File-pattern aware** — different rules for tests, stories, e2e, config files, declarations
- **AI mode** — strict clean-code rules that AI assistants can trivially follow
- **OxLint compatible** — automatically disables rules OxLint already covers
- **Runtime API** — modify rules dynamically after loading
- **Modular exports** — compose your own config from individual building blocks

## Quick Start

```bash
npm install -D @effective/eslint-config eslint typescript
```

```typescript
// eslint.config.ts
import { getConfig } from "@effective/eslint-config"

export default await getConfig({
  react: true,
  strict: true,
})
```

## Configuration Options

| Flag | Default | Description |
|------|---------|-------------|
| `react` | `false` | React 19+ (Server Components, Hooks, Compiler, JSX-A11y, Storybook, Testing Library) |
| `node` | `false` | Node.js-specific rules and globals |
| `strict` | `false` | `strictTypeChecked` + tighter complexity limits |
| `ai` | `false` | Strict clean-code rules optimized for AI-generated code |
| `oxlint` | `false` | Disables rules already covered by OxLint |

## Usage Examples

### AI-Generated Projects

For projects where code is primarily written by AI assistants (Cursor, Copilot, Claude):

```typescript
import { getConfig } from "@effective/eslint-config"

export default await getConfig({ react: true, ai: true })
```

The `ai` flag enables rules that would traditionally be considered "too strict" for humans but are trivial for AI to follow: explicit return types, naming conventions, no magic numbers, early returns, prevent abbreviations, and tighter complexity limits.

### With OxLint

Run OxLint for fast checks, ESLint only for type-aware and specialty rules:

```typescript
import { getConfig } from "@effective/eslint-config"

export default await getConfig({ react: true, oxlint: true })
```

```json
{
  "scripts": {
    "lint": "oxlint && eslint"
  }
}
```

### Customizing Rules

```typescript
import { getConfig, disableRule, setRuleSeverity } from "@effective/eslint-config"

const config = await getConfig({ react: true, ai: true })

disableRule(config, "unicorn/no-null")
setRuleSeverity(config, "no-console", "warn")

export default config
```

### Rule Manipulation API

| Function | Description |
|----------|-------------|
| `setRuleSeverity(config, rule, severity)` | Change severity, preserve options |
| `configureRule(config, rule, options)` | Update options, preserve severity |
| `disableRule(config, rule)` | Disable rule across all config blocks |
| `addRule(config, rule, severity, options?)` | Add a new rule to the base block |
| `disableAllRulesBut(config, rule)` | Debug helper: disable everything except one rule |

### Power User: Modular Imports

```typescript
import {
  base, typescript, imports, unicorn, react, prettier,
  tests, stories,
} from "@effective/eslint-config/modules"

export default [
  ...base(),
  ...typescript({ strict: true }),
  ...imports(),
  ...unicorn(),
  ...react(),
  ...tests({ react: true }),
  ...stories(),
  ...prettier(),
]
```

## Included Plugins

### Always Active

| Plugin | Purpose |
|--------|---------|
| `@eslint/js` | ESLint recommended rules |
| `typescript-eslint` | Type-checked TypeScript rules |
| `eslint-plugin-unicorn` | Modern JS patterns |
| `eslint-plugin-regexp` | RegExp quality |
| `eslint-plugin-jsdoc` | JSDoc validation |
| `eslint-plugin-import-x` | Import validation |
| `eslint-plugin-simple-import-sort` | Import ordering |
| `eslint-plugin-unused-imports` | Remove unused imports |
| `eslint-plugin-sonarjs` | Code quality & complexity |
| `eslint-plugin-security` | Security rules |
| `@cspell/eslint-plugin` | Spelling in code |
| `@eslint/json` | JSON/JSONC validation |
| `@eslint/markdown` | Markdown code block validation |
| `eslint-config-prettier` | Disable formatting rules |

### Conditional

| Plugin | Activated by |
|--------|-------------|
| `eslint-plugin-react` | `react: true` |
| `eslint-plugin-react-hooks` | `react: true` |
| `eslint-plugin-react-compiler` | `react: true` |
| `eslint-plugin-jsx-a11y` | `react: true` |
| `eslint-plugin-storybook` | `react: true` (*.stories only) |
| `eslint-plugin-testing-library` | `react: true` (*.test only) |
| `eslint-plugin-n` | `node: true` |
| `eslint-plugin-oxlint` | `oxlint: true` |

### File-Pattern Specific

| Plugin | Files |
|--------|-------|
| `@vitest/eslint-plugin` | `*.test.{ts,tsx}` |
| `eslint-plugin-playwright` | `*.spec.ts` |
| `eslint-plugin-storybook` | `*.stories.{ts,tsx}` |

## File-Pattern Overrides

Each generated config contains multiple blocks targeting specific file patterns:

| Pattern | Behavior |
|---------|----------|
| `**/*.{ts,tsx}` | All base + plugin rules |
| `**/*.test.{ts,tsx}` | Vitest + Testing Library, relaxed complexity |
| `**/*.spec.ts` | Playwright E2E rules, relaxed complexity |
| `**/*.stories.{ts,tsx}` | Storybook rules, default exports allowed |
| `**/*.config.{ts,mts,cts}` | Relaxed complexity, magic numbers allowed |
| `**/*.d.ts` | Most strict rules disabled |
| `**/scripts/**` | Console and process.exit allowed |
| `**/*.json` | JSON syntax validation |
| `**/*.md` | Markdown linting |

## Architecture

Configs are pre-generated at build time using a deterministic hash:

```
Options → Bitmask (5 bits) → SHA-1 hash (8 chars) → filename.js
```

The same hash algorithm runs at build time (`npm run generate`) and at runtime (`getConfig()`), ensuring the correct file is always loaded.

## License

MIT
