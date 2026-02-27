# @effective/eslint-config

Stop managing ESLint configs. Start shipping.

One import. 25+ plugins. TypeScript, React, Node.js, AI-assisted code, OxLint — all handled. Every combination pre-built at compile time, so your editor never waits.

```typescript
// eslint.config.ts
import { getConfig } from "@effective/eslint-config"

export default await getConfig({ react: true })
```

That single line gives you type-checked TypeScript, React 19 with Hooks and JSX-A11y, import cycle detection, code quality analysis, JSON/Markdown linting, Vitest and Playwright overrides, and Prettier compatibility. No plugin juggling. No copy-pasted config blocks.

Need to tweak a rule? Every config is fully customizable — disable rules globally or target specific file types like tests, scripts, or config files:

```typescript
import { getConfig, disableRule, addRule } from "@effective/eslint-config"

const config = await getConfig({ react: true, ai: true })

disableRule(config, "@typescript-eslint/no-magic-numbers", { scope: "tests" })
addRule(config, "no-console", "off", { scope: "scripts" })

export default config
```

Want it even faster? Enable [OxLint integration](#oxlint-integration) for 50-100x faster linting on the rules OxLint supports — with zero config and no quality loss.

---

## The problem

Every TypeScript project needs ESLint. And every team ends up in the same place: 15+ plugins, dozens of config blocks, file-pattern overrides for tests vs. stories vs. e2e, and a config file that nobody fully understands anymore. Someone adds a plugin, it conflicts with an existing rule, three people spend an afternoon debugging why their editor shows different warnings than CI.

Most teams deal with this in one of two ways. They copy-paste configs between repos and watch them drift apart within weeks. Or they use a shared config that's either too loose to catch anything useful or too strict for half their codebase.

And now there's a third pressure: AI writes more and more of your code. Cursor, Copilot, Claude Code — they all produce working code, but without strict lint rules, each tool has its own style. One function uses `any`, the next has magic numbers, a third nests five levels deep. The codebase looks like it was written by a different person every hour. Because it was.

This package solves both problems at once. A complete, pre-generated ESLint config that works out of the box — and an AI mode that turns the linter into the single most effective quality gate for generated code.

## How it works

Four boolean flags. Sixteen combinations. All pre-generated at build time.

```
Build Time                          Runtime
─────────                           ───────
ConfigOptions → Bitmask → SHA-1     getConfig(opts) → same hash
                            │                            │
                            ▼                            ▼
                   dist/configs/{hash}.js ◄──── dynamic import
```

When you call `getConfig({ react: true })`, it computes a hash and loads a static JS file. No composition logic runs. No plugins get resolved. The config is just there — a plain array of objects, ready to go.

This means:

- Your editor gets lint results instantly, not after a multi-second config build
- The exact same config loads every time — no plugin-loading-order surprises
- You can inspect `dist/configs/{hash}.js` to see exactly what's active
- Snapshot tests catch any rule changes when plugins update

---

## Installation

```bash
npm install -D @effective/eslint-config eslint typescript
```

Requires ESLint >= 9.22 and TypeScript >= 5.0.

---

## Configuration flags

| Flag | Default | What it does |
|------|---------|--------------|
| `react` | `false` | React 19+ with Server Components, Hooks, Compiler, JSX-A11y, Storybook, Testing Library |
| `node` | `false` | Node.js globals, `eslint-plugin-n` rules, promise-based API preferences |
| `ai` | `false` | Enforces a consistent standard across human and AI contributors (see [AI mode](#ai-mode)) |
| `oxlint` | `false` | Disables ESLint rules that OxLint already covers (see [OxLint integration](#oxlint-integration)) |

Flags are independent. Combine them however you need. `2^4 = 16` configs exist, all pre-built.

> TypeScript always uses `strictTypeChecked` — the strictest typescript-eslint preset. No "recommended" fallback. This matches TypeScript's own direction toward strict-by-default.

---

## Usage examples

### React project

```typescript
import { getConfig } from "@effective/eslint-config"

export default await getConfig({ react: true })
```

### Full-stack (React + Node)

```typescript
import { getConfig } from "@effective/eslint-config"

export default await getConfig({ react: true, node: true })
```

### AI-assisted development

For teams where AI writes a significant share of the code:

```typescript
import { getConfig } from "@effective/eslint-config"

export default await getConfig({ react: true, ai: true })
```

### With customizations

```typescript
import {
  getConfig, disableRule, setRuleSeverity, configureRule, addRule
} from "@effective/eslint-config"

const config = await getConfig({ react: true, ai: true })

disableRule(config, "unicorn/no-null")
setRuleSeverity(config, "no-console", "warn")
configureRule(config, "complexity", [20])
addRule(config, "no-alert", "error")

export default config
```

### With OxLint

For 50-100x faster linting, run [OxLint](https://oxc.rs) alongside ESLint. One flag is all it takes — the config automatically disables every ESLint rule that OxLint already covers:

```typescript
// eslint.config.ts
import { getConfig } from "@effective/eslint-config"

export default await getConfig({ react: true, oxlint: true })
```

```jsonc
// package.json
{
  "scripts": {
    "lint": "oxlint && eslint"
  }
}
```

OxLint runs first for instant feedback on the rules it supports. ESLint follows for everything else — type-aware checks, SonarJS, import cycles, and more. Same rules, same severity, no gaps.

---

## Rule manipulation API

Every function operates on the config array in-place:

| Function | Description |
|----------|-------------|
| `setRuleSeverity(config, rule, severity, options?)` | Change `"off"` / `"warn"` / `"error"` while preserving options |
| `configureRule(config, rule, options, ruleOptions?)` | Replace options while preserving severity |
| `disableRule(config, rule, options?)` | Set to `"off"` across all config blocks |
| `addRule(config, rule, severity, options?, ruleOptions?)` | Add a rule to the base config block |
| `disableAllRulesBut(config, rule)` | Debug helper — disable everything except one rule |

### Scoped rules

All four main functions accept an optional `{ scope }` parameter to target specific file types instead of the entire config. The scope matches config block names by prefix:

```typescript
import {
  getConfig, disableRule, setRuleSeverity, configureRule, addRule
} from "@effective/eslint-config"

const config = await getConfig({ react: true, ai: true })

// Disable magic number checks in tests only
disableRule(config, "@typescript-eslint/no-magic-numbers", { scope: "tests" })

// Allow console in scripts
addRule(config, "no-console", "off", { scope: "scripts" })

// Relax complexity only in test files
configureRule(config, "complexity", [25], { scope: "tests" })

// Downgrade a rule to warning in config files
setRuleSeverity(config, "import-x/no-default-export", "warn", { scope: "configs" })

export default config
```

Available scopes: `"tests"`, `"e2e"`, `"stories"`, `"configs"`, `"declarations"`, `"scripts"`.

Each scope matches blocks whose name is `@effective/eslint/{scope}` or starts with `@effective/eslint/{scope}-` (e.g. `"tests"` matches both `tests` and `tests-react`).

### Why not just spread?

ESLint flat configs are arrays of objects. A rule like `complexity` might appear in multiple blocks (base, AI, complexity). Finding and modifying it by hand is error-prone. These helpers walk all blocks and apply the change consistently.

---

## AI mode

The balance has shifted. In a growing number of teams, AI assistants already write more code than humans do. And that trend is accelerating. Cursor, Copilot, Claude Code, Windsurf — they produce functional code fast, but each with its own habits. Without guardrails, your codebase accumulates stylistic debt at machine speed: inconsistent naming, implicit types, magic numbers scattered everywhere, functions that grow unchecked.

The fix isn't more code review. Reviewers can't keep up with the volume, and style consistency is exactly the kind of thing humans stop noticing after the third file.

The fix is a linter that's strict enough to enforce a single standard across every contributor, human or AI. Rules that humans find tedious — explicit return types, strict naming conventions, no magic numbers — are trivial for an AI to follow. The AI doesn't mind. It doesn't argue in PRs about whether `any` is acceptable "just this once." It just fixes the code and moves on.

That's what `ai: true` is for. It turns your linter into the quality gate that scales with AI-generated output. An AI assistant can ignore your style guide. It can't ignore a failing lint.

### What `ai: true` enables

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

### Complexity limits

| Rule | Default | `ai` |
|------|---------|------|
| `complexity` | 10 | 10 |
| `max-depth` | 3 | 3 |
| `max-params` | 3 | 3 |
| `max-lines-per-function` | 50 | 50 |
| `max-lines` | 300 | 300 |
| `cognitive-complexity` | 10 | 10 |

Both modes use the same numeric limits. AI mode adds the structural and naming rules on top.

### Automatic relaxations

Strict rules don't belong everywhere. The config knows that:

- **Test files** (`*.test.{ts,tsx}`) drop size limits, magic number checks, and return type requirements
- **E2E files** (`*.spec.ts`) drop size limits and magic numbers
- **Config files** (`*.config.*`) drop complexity limits, magic numbers, and naming conventions
- **Declarations** (`*.d.ts`) disable most AI rules entirely

No manual overrides needed. The file pattern handles it.

---

## OxLint integration

Most ESLint configs ignore OxLint entirely. This one has first-class support built in — a single flag gives you 50-100x faster linting with no manual rule management.

[OxLint](https://oxc.rs) is a Rust-based linter that already covers many core ESLint, TypeScript, unicorn, import, and JSX-A11y rules natively. With `oxlint: true`, this config automatically disables every ESLint rule that OxLint handles (via [`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint)). No manual config, no rule conflicts, no guesswork about which linter covers what.

Everything OxLint doesn't support — type-aware TypeScript checks, SonarJS analysis, cspell, Storybook, Testing Library — keeps running through ESLint. You get the full rule set at the same severity, just split across two linters for maximum speed.

### Setup

Install `oxlint` as a dev dependency alongside your existing setup:

```bash
npm install -D oxlint
```

Enable it in your ESLint config:

```typescript
// eslint.config.ts
import { getConfig } from "@effective/eslint-config"

export default await getConfig({ react: true, ai: true, oxlint: true })
```

Run both linters in sequence — OxLint first for instant feedback, ESLint second for the deep analysis:

```jsonc
// package.json
{
  "scripts": {
    "lint": "oxlint && eslint"
  }
}
```

### Generating `oxlint.config.ts`

For a fully synced OxLint config that mirrors your ESLint rules, use [`@oxlint/migrate`](https://www.npmjs.com/package/@oxlint/migrate) — the official migration tool from the OxC team:

```bash
npm install -D oxlint @oxlint/migrate
```

```typescript
// oxlint.config.ts
import { defineConfig } from "oxlint"
import migrate from "@oxlint/migrate"
import { getConfig } from "@effective/eslint-config"

export default defineConfig(await migrate(getConfig({ react: true, ai: true })))
```

Same rules, same severity — automatically derived from your ESLint config.

---

## File conventions

The config applies different rules based on file patterns. Each pattern matches the default convention of its tool:

| Pattern | Purpose | Convention source |
|---------|---------|-------------------|
| `*.test.{ts,tsx}`, `__tests__/**` | Unit/integration tests | Vitest default |
| `*.spec.ts` | E2E tests | Playwright default |
| `*.stories.{ts,tsx}` | Component stories | Storybook default |
| `*.config.*` | Tool configs | Vite, Next.js, Tailwind convention |
| `*.d.ts` | Type declarations | TypeScript convention |
| `scripts/**` | Build/dev scripts | Common project convention |

Follow these patterns and the linter applies the right rules per file type without any configuration.

---

## Config blocks

Each generated config contains named blocks. Rules only apply to matching files:

| Block | Files | Purpose |
|-------|-------|---------|
| `@effective/eslint/base` | `**/*.{ts,tsx}` | ESLint recommended + best practices |
| `@effective/eslint/typescript` | `**/*.{ts,tsx}` | Type-checked TypeScript rules |
| `@effective/eslint/react` | `**/*.{ts,tsx}` | React, Hooks, Compiler, JSX-A11y |
| `@effective/eslint/node` | `**/*.{ts,tsx}` | Node.js globals and rules |
| `@effective/eslint/tests` | `**/*.test.{ts,tsx}` | Vitest rules, relaxed complexity |
| `@effective/eslint/tests-react` | `**/*.test.{ts,tsx}` | Testing Library rules |
| `@effective/eslint/e2e` | `**/*.spec.ts` | Playwright rules |
| `@effective/eslint/stories` | `**/*.stories.{ts,tsx}` | Storybook rules |
| `@effective/eslint/config-files` | `**/*.config.*` | Relaxed rules for config files |
| `@effective/eslint/declarations` | `**/*.d.ts` | Minimal rules for type declarations |
| `@effective/eslint/scripts` | `**/scripts/**` | Console and process.exit allowed |
| `@effective/eslint/json` | `**/*.json` | JSON syntax validation |
| `@effective/eslint/jsonc` | `**/tsconfig.json`, etc. | JSONC with comments |
| `@effective/eslint/markdown` | `**/*.md` | Markdown code block validation |
| `@effective/eslint/prettier` | all | Disables Prettier-conflicting rules |

---

## Included plugins

### Always active (14 plugins)

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

## Modular imports

For teams that want full control, every building block is available individually:

```typescript
import {
  base, typescript, imports, unicorn, regexp, jsdoc, sonarjs,
  react, node, ai, json, markdown, prettier,
  tests, e2e, stories, configFiles, declarations, scripts,
  standardComplexity,
  oxlint,
} from "@effective/eslint-config/modules"

export default [
  ...base(),
  ...typescript(),
  ...imports(),
  ...unicorn(),
  ...regexp(),
  ...sonarjs(),
  ...react(),
  ...ai(),
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

Or use `composeConfig()` — the same function the build system uses — to get the full config at runtime:

```typescript
import { composeConfig } from "@effective/eslint-config/modules"

export default composeConfig({ react: true, ai: true })
```

---

## Architecture

### Why pre-generate?

1. **No startup cost.** The config file is a static array of objects. Nothing gets composed, resolved, or merged at runtime.
2. **Deterministic.** The same hash always loads the same config. No plugin loading order surprises.
3. **Snapshot-testable.** Generated configs are snapshotted. When a plugin update changes rule defaults, the diff shows exactly what moved.
4. **Inspectable.** Open `dist/configs/{hash}.js` and read what's active. No guessing.

### Project structure

```
src/
  index.ts              Public API (getConfig, rule helpers, hash utils)
  modules.ts            Modular exports for power users
  loader.ts             Dynamic config loader
  hash.ts               Deterministic bitmask -> SHA-1 hash
  types.ts              Shared TypeScript types

  configs/              Individual config building blocks
    base.ts             ESLint recommended + best practices
    typescript.ts       typescript-eslint (strictTypeChecked)
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

  api/
    rule-helpers.ts     Runtime rule manipulation functions

  build/
    config-builder.ts   Validated config builder (addRule/overrideRule with preset checks)
    compose.ts          Assembles full config from options
    serialize.ts        Serializes config to JS module
    generate.ts         Generates all 16 permutations

  oxlint/
    integration.ts      eslint-plugin-oxlint rule disabling
```

---

## Contributing

```bash
npm install
npm test
npm run generate   # Build all 16 config permutations
npm run build      # Build for distribution
```

### Updating snapshots

When you intentionally change rules or update plugins:

```bash
npx vitest run --update
```

Review the snapshot diff carefully. It shows exactly which rules changed.

---

## License

MIT
