---
title: AI Mode
---

# AI Mode

The `ai` flag isn't about validating code after it's written. It's about **making AI iterate until the code is good**.

When Claude or Copilot writes a 200-line function with nested callbacks, ESLint fails, and the AI tries again. And again. Until it gets it right.

## The Idea

When you code with AI assistants, quality depends on feedback loops. The `ai` flag creates a strict feedback loop:

1. AI writes code
2. ESLint checks it against strict rules
3. If it fails, AI rewrites
4. Repeat until clean

This pushes AI to write smaller functions, simpler logic, and more maintainable code from the start.

## Complexity Limits

| Rule | Limit | Why |
|------|-------|-----|
| `complexity` | 10 | Cyclomatic complexity — too many branches = hard to test |
| `max-depth` | 3 | Deep nesting = hard to read |
| `max-nested-callbacks` | 2 | Callback hell prevention |
| `max-params` | 4 | Too many params = function does too much |
| `sonarjs/cognitive-complexity` | 10 | Mental burden score |

## Size Limits

| Rule | Limit | Why |
|------|-------|-----|
| `max-lines` | 300 | Files should be focused |
| `max-lines-per-function` | 50 | Functions should do one thing |
| `max-statements` | 15 | Fewer statements = clearer logic |
| `max-statements-per-line` | 1 | One thing per line |

::: tip
Size limits are automatically disabled for test files, E2E specs, and config files. You don't need to configure overrides for those.
:::

## Code Quality (SonarJS)

| Rule | Why |
|------|-----|
| `sonarjs/no-duplicate-string` | Extract repeated strings |
| `sonarjs/no-identical-functions` | DRY principle |
| `sonarjs/no-collapsible-if` | Simplify conditions |
| `sonarjs/prefer-immediate-return` | Don't store just to return |
| `sonarjs/prefer-single-boolean-return` | Simplify boolean returns |
| `no-nested-ternary` | Ternaries in ternaries are unreadable |
| `no-param-reassign` | Mutations cause bugs |

## Style & Consistency

The `ai` flag also enables:

- **TypeScript stylistic rules** — `prefer-nullish-coalescing`, `prefer-optional-chain`, `consistent-type-definitions`, and more
- **Import sorting** — Automatic, consistent import order via `simple-import-sort`
- **JSDoc require rules** — Enforces documentation for public APIs

Why bundle style with AI? Because inconsistent code is harder to maintain. If AI writes your code, it should follow your style.

## Adjusting Limits

The defaults work well for most projects. If you need to adjust:

```typescript
import { getConfig, configureRule } from "eslint-config-setup"

const config = await getConfig({ strict: true, ai: true })

// Allow longer functions
configureRule(config, "max-lines-per-function", [{ max: 80 }])

// Allow more complexity
configureRule(config, "complexity", [{ max: 15 }])
```
