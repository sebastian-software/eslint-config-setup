# @effective/eslint-config

A pre-generated, permutation-based ESLint flat config for modern TypeScript and React projects. One import, zero runtime overhead, full control when you need it.

---

## Why This Exists

Setting up ESLint in a modern TypeScript project means juggling 15+ plugins, dozens of config blocks, file-pattern overrides for tests vs. stories vs. e2e, and keeping it all in sync. Most teams either copy-paste configs between repos or use a shared config that doesn't quite fit.

This package takes a different approach: **all permutations are pre-generated at build time.** You declare what your project needs, and you get a single, optimized flat config array — instantly, with zero composition overhead at runtime.

### Key Advantages

- **Zero runtime cost** — Configs are pre-built JS files, not composed at startup. Your editor gets lint results instantly.
- **Permutation-based** — 5 boolean flags produce 32 purpose-built configs. No unused plugins, no dead rules.
- **File-pattern aware** — Tests, stories, e2e specs, config files, and type declarations each get appropriate rules automatically. No manual overrides needed.
- **AI-first mode** — A dedicated `ai` flag enables strict clean-code rules that AI assistants can trivially follow, producing measurably better code.
- **OxLint compatible** — A single flag disables all rules OxLint already covers, letting you run `oxlint && eslint` for maximum performance.
- **Escape hatches** — Runtime helpers let you tweak any rule after loading. A modular export path lets power users compose from scratch.

---

## Installation

```bash
npm install -D @effective/eslint-config eslint typescript
```

ESLint >= 9.22 and TypeScript >= 5.0 are required as peer dependencies.

---

## Quick Start

```typescript
// eslint.config.ts
import { getConfig } from "@effective/eslint-config"

export default await getConfig({
  react: true,
})
```

That's it. This gives you a complete config with TypeScript type-checking, React + Hooks + JSX-A11y, import validation, code quality rules, JSON/Markdown linting, Vitest and Playwright overrides, and Prettier compatibility — all in one line.

---

## Configuration Flags

| Flag | Default | What It Enables |
|------|---------|-----------------|
| `react` | `false` | React 19+ with Server Components, Hooks, Compiler, JSX-A11y, Storybook, Testing Library |
| `node` | `false` | Node.js globals, `eslint-plugin-n` rules, promise-based API preferences |
| `strict` | `false` | `strictTypeChecked` (instead of `recommended`), tighter complexity limits (10/3/2 instead of 15/4/3) |
| `ai` | `false` | Strict clean-code rules for AI-generated code (see [AI Mode](#ai-mode) below) |
| `oxlint` | `false` | Disables all ESLint rules that OxLint already covers (see [OxLint Integration](#oxlint-integration)) |

Flags are independent and combinable. `2^5 = 32` permutations are generated at build time.

---

## Usage Examples

### Standard React Project

```typescript
import { getConfig } from "@effective/eslint-config"

export default await getConfig({ react: true })
```

### Full-Stack (React + Node) with Strict TypeScript

```typescript
import { getConfig } from "@effective/eslint-config"

export default await getConfig({ react: true, node: true, strict: true })
```

### AI-Assisted Development

For projects where most code is written by AI assistants (Cursor, Copilot, Claude Code):

```typescript
import { getConfig } from "@effective/eslint-config"

export default await getConfig({ react: true, ai: true })
```

### Maximum Strictness (AI + Strict)

```typescript
import { getConfig } from "@effective/eslint-config"

export default await getConfig({ react: true, ai: true, strict: true })
```

### With Customizations

```typescript
import {
  getConfig, disableRule, setRuleSeverity, configureRule, addRule
} from "@effective/eslint-config"

const config = await getConfig({ react: true, ai: true })

// Tweak individual rules after loading
disableRule(config, "unicorn/no-null")
setRuleSeverity(config, "no-console", "warn")
configureRule(config, "complexity", [20])
addRule(config, "no-alert", "error")

export default config
```

---

## Rule Manipulation API

Every function operates on the loaded config array in-place:

| Function | Description |
|----------|-------------|
| `setRuleSeverity(config, rule, severity)` | Change `"off"` / `"warn"` / `"error"` while preserving rule options |
| `configureRule(config, rule, options)` | Replace rule options while preserving severity |
| `disableRule(config, rule)` | Set to `"off"` across all config blocks |
| `addRule(config, rule, severity, options?)` | Add a new rule to the base config block |
| `disableAllRulesBut(config, rule)` | Debug helper — disable every rule except one |

### Why Not Just Spread?

ESLint flat configs are arrays of objects. A rule like `complexity` might appear in multiple blocks (base, AI, strict). Manually finding and modifying it is error-prone. These helpers iterate all blocks and modify the rule consistently.

---

## AI Mode

The `ai` flag is based on a simple observation: **most code in 2025+ is written by AI assistants.** Rules that humans find tedious are trivial for AI to follow. The linter becomes the single most effective mechanism to enforce AI output quality — an AI can ignore documentation, but it cannot ignore a failing CI lint.

### What `ai: true` Enables

**Structural clarity:**
`curly: "all"`, `no-else-return`, `no-nested-ternary`, `no-param-reassign`, `no-implicit-coercion`, `eqeqeq`, `object-shorthand`, `arrow-body-style`, `logical-assignment-operators`

**Explicit TypeScript:**
`explicit-function-return-type`, `naming-convention` (strict camelCase, PascalCase types, `is`/`has` boolean prefixes), `consistent-type-imports/exports`, `no-explicit-any` (fixes to `unknown`), `prefer-readonly`, `switch-exhaustiveness-check`, `no-unsafe-type-assertion`

**No magic values:**
`@typescript-eslint/no-magic-numbers` (allows -1, 0, 1, 2), `sonarjs/no-duplicate-string` (threshold: 3)

**Modern idioms (unicorn):**
`prefer-early-return`, `consistent-function-scoping`, `no-array-for-each`, `no-array-reduce`, `prevent-abbreviations`, `filename-case`

**Code quality (SonarJS):**
`no-identical-functions`, `no-collapsible-if`, `prefer-immediate-return`, `prefer-single-boolean-return`, `cognitive-complexity: 10`

**Async hygiene:**
`no-await-in-loop`, `no-floating-promises`, `no-promise-executor-return`

### Complexity Limits by Mode

| Rule | Default | `strict` | `ai` | `ai + strict` |
|------|---------|----------|------|---------------|
| `complexity` | 15 | 10 | 10 | 8 |
| `max-depth` | 4 | 3 | 3 | 2 |
| `max-params` | 4 | 3 | 3 | 2 |
| `max-lines-per-function` | 80 | 50 | 50 | 35 |
| `max-lines` | 500 | 300 | 300 | 200 |
| `cognitive-complexity` | 15 | 10 | 10 | 8 |

### Automatic Relaxations

AI rules are automatically relaxed for files where they don't make sense:

- **Test files** (`*.test.{ts,tsx}`) — no size limits, no magic numbers, no explicit return types
- **E2E files** (`*.spec.ts`) — no size limits, no magic numbers
- **Config files** (`*.config.*`) — no complexity limits, no magic numbers, no naming conventions
- **Declarations** (`*.d.ts`) — most AI rules disabled

---

## OxLint Integration

[OxLint](https://oxc.rs) is a Rust-based linter that runs 50-100x faster than ESLint. It covers many core ESLint, TypeScript, unicorn, import, and JSX-A11y rules natively.

With `oxlint: true`, this config automatically disables all ESLint rules that OxLint already handles (via [`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint)). What remains are rules that only ESLint can provide: type-aware TypeScript checks, SonarJS quality rules, cspell, Storybook, Testing Library, etc.

```typescript
// eslint.config.ts
import { getConfig } from "@effective/eslint-config"

export default await getConfig({ react: true, ai: true, oxlint: true })
```

```json
{
  "scripts": {
    "lint": "oxlint && eslint"
  }
}
```

Run OxLint first for fast feedback on common issues, then ESLint for the deep analysis.

---

## File-Pattern Overrides

Each generated config contains multiple named blocks. Rules only apply to matching files:

| Block Name | Files | Purpose |
|------------|-------|---------|
| `@effective/eslint/base` | `**/*.{ts,tsx}` | Core rules (ESLint recommended, best practices) |
| `@effective/eslint/typescript` | `**/*.{ts,tsx}` | Type-checked TypeScript rules |
| `@effective/eslint/react` | `**/*.{ts,tsx}` | React, Hooks, Compiler, JSX-A11y (only with `react: true`) |
| `@effective/eslint/node` | `**/*.{ts,tsx}` | Node.js globals and rules (only with `node: true`) |
| `@effective/eslint/tests` | `**/*.test.{ts,tsx}` | Vitest rules, relaxed complexity |
| `@effective/eslint/tests-react` | `**/*.test.{ts,tsx}` | Testing Library rules (only with `react: true`) |
| `@effective/eslint/e2e` | `**/*.spec.ts` | Playwright rules |
| `@effective/eslint/stories` | `**/*.stories.{ts,tsx}` | Storybook rules (only with `react: true`) |
| `@effective/eslint/config-files` | `**/*.config.*` | Relaxed rules for config files |
| `@effective/eslint/declarations` | `**/*.d.ts` | Minimal rules for type declarations |
| `@effective/eslint/scripts` | `**/scripts/**` | Console and process.exit allowed |
| `@effective/eslint/json` | `**/*.json` | JSON syntax validation |
| `@effective/eslint/jsonc` | `**/tsconfig.json`, etc. | JSONC with comments allowed |
| `@effective/eslint/markdown` | `**/*.md` | Markdown code block validation |
| `@effective/eslint/prettier` | all | Disables rules that conflict with Prettier |

---

## Included Plugins

### Always Active (14 plugins)

| Plugin | Purpose |
|--------|---------|
| [`@eslint/js`](https://eslint.org/) | ESLint recommended rules |
| [`typescript-eslint`](https://typescript-eslint.io/) | Type-checked TypeScript rules |
| [`eslint-plugin-unicorn`](https://github.com/sindresorhus/eslint-plugin-unicorn) | 100+ modern JS patterns |
| [`eslint-plugin-regexp`](https://github.com/ota-meshi/eslint-plugin-regexp) | RegExp quality and optimization |
| [`eslint-plugin-jsdoc`](https://github.com/gajus/eslint-plugin-jsdoc) | JSDoc validation |
| [`eslint-plugin-import-x`](https://github.com/un-ts/eslint-plugin-import-x) | Import validation (no-cycle, no-duplicates) |
| [`eslint-plugin-simple-import-sort`](https://github.com/lydell/eslint-plugin-simple-import-sort) | Deterministic import ordering |
| [`eslint-plugin-unused-imports`](https://github.com/sweepline/eslint-plugin-unused-imports) | Auto-remove unused imports |
| [`eslint-plugin-sonarjs`](https://github.com/SonarSource/eslint-plugin-sonarjs) | Code quality, cognitive complexity |
| [`eslint-plugin-security`](https://github.com/eslint-community/eslint-plugin-security) | Security rules (eval, regex DoS, injection) |
| [`@cspell/eslint-plugin`](https://github.com/streetsidesoftware/cspell) | Spell checking in code |
| [`@eslint/json`](https://eslint.org/blog/2025/02/eslint-css-support/) | Native JSON/JSONC linting |
| [`@eslint/markdown`](https://github.com/eslint/markdown) | Markdown code block linting |
| [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier) | Disables formatting rules |

### Conditional

| Plugin | Flag |
|--------|------|
| [`eslint-plugin-react`](https://github.com/jsx-eslint/eslint-plugin-react) | `react` |
| [`eslint-plugin-react-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks) | `react` |
| [`eslint-plugin-react-compiler`](https://www.npmjs.com/package/eslint-plugin-react-compiler) | `react` |
| [`eslint-plugin-jsx-a11y`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) | `react` |
| [`eslint-plugin-storybook`](https://github.com/storybookjs/eslint-plugin-storybook) | `react` (stories only) |
| [`eslint-plugin-testing-library`](https://github.com/testing-library/eslint-plugin-testing-library) | `react` (tests only) |
| [`@vitest/eslint-plugin`](https://github.com/vitest-dev/eslint-plugin-vitest) | always (tests only) |
| [`eslint-plugin-playwright`](https://github.com/playwright-community/eslint-plugin-playwright) | always (specs only) |
| [`eslint-plugin-n`](https://github.com/eslint-community/eslint-plugin-n) | `node` |
| [`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint) | `oxlint` |

---

## Power User: Modular Imports

For teams that need full control over composition, every building block is available individually:

```typescript
import {
  base, typescript, imports, unicorn, regexp, jsdoc, sonarjs,
  react, node, ai, json, markdown, prettier,
  tests, e2e, stories, configFiles, declarations, scripts,
  standardComplexity, strictComplexity,
  oxlint,
} from "@effective/eslint-config/modules"

export default [
  ...base(),
  ...typescript({ strict: true }),
  ...imports(),
  ...unicorn(),
  ...regexp(),
  ...sonarjs(),
  ...react(),
  ...ai({ strict: true }),
  ...tests({ react: true }),
  ...e2e(),
  ...stories(),
  ...configFiles(),
  ...declarations(),
  ...json(),
  ...markdown(),
  ...prettier(),
]
```

You can also use `composeConfig()` — the same function the build system uses — to get the full composed config at runtime instead of loading a pre-generated file:

```typescript
import { composeConfig } from "@effective/eslint-config/modules"

export default composeConfig({ react: true, ai: true })
```

---

## Architecture

### Pre-Generation with Deterministic Hashing

```
                    Build Time                          Runtime
                    ─────────                           ───────
  ConfigOptions ──→ Bitmask (5 bits) ──→ SHA-1 hash    getConfig(opts) ──→ same hash
                                              │                                │
                                              ▼                                ▼
                                     dist/configs/{hash}.js ◄──── dynamic import
```

Each combination of flags produces a deterministic 8-character hash. The same algorithm runs at build time (when `npm run generate` writes the files) and at runtime (when `getConfig()` loads them). This guarantees the correct file is always loaded without a lookup table.

### Why Pre-Generate?

1. **Performance** — No composition logic runs at startup. The config file is a static array of objects.
2. **Predictability** — The exact same config is loaded every time. No plugin loading order surprises.
3. **Snapshot testing** — Generated configs can be snapshotted to detect when plugin updates change rule values.
4. **Debuggability** — You can inspect `dist/configs/{hash}.js` to see exactly what rules are active.

### Project Structure

```
src/
  index.ts              Public API (getConfig, rule helpers, hash utils)
  modules.ts            Modular exports for power users
  loader.ts             Dynamic config loader
  hash.ts               Deterministic bitmask → SHA-1 hash
  types.ts              Shared TypeScript types

  configs/              Individual config building blocks
    base.ts             ESLint recommended + best practices
    typescript.ts       typescript-eslint (recommended or strict)
    ai.ts               AI mode rules + per-file relaxations
    react.ts            React 19+, Hooks, Compiler, JSX-A11y
    node.ts             Node.js rules and globals
    imports.ts          import-x + simple-import-sort
    unicorn.ts          Modern JS patterns
    regexp.ts           RegExp quality
    jsdoc.ts            JSDoc validation
    cspell.ts           Spell checking
    sonarjs.ts          Code quality
    security.ts         Security rules
    json.ts             JSON/JSONC validation
    markdown.ts         Markdown linting
    prettier.ts         Prettier conflict removal

  overrides/            File-pattern-specific rule overrides
    tests.ts            *.test.{ts,tsx}
    e2e.ts              *.spec.ts
    stories.ts          *.stories.{ts,tsx}
    config-files.ts     *.config.*
    declarations.ts     *.d.ts
    scripts.ts          scripts/**/*

  presets/              Complexity level presets
    standard.ts         Default limits
    strict.ts           Strict limits

  api/
    rule-helpers.ts     Runtime rule manipulation functions

  build/
    compose.ts          Assembles full config from options
    serialize.ts        Serializes config to JS module
    generate.ts         Generates all 32 permutations

  oxlint/
    integration.ts      eslint-plugin-oxlint rule disabling
```

---

## Contributing

```bash
# Install dependencies
npm install

# Run tests
npm test

# Generate all 32 config permutations
npm run generate

# Build for distribution
npm run build
```

### Updating Snapshots

When intentionally changing rules or updating plugins:

```bash
npx vitest run --update
```

Review the snapshot diff carefully — it shows exactly which rules changed.

---

## License

MIT
