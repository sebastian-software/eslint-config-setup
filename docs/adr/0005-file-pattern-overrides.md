# ADR-0005: Flat-Computed File-Pattern Overrides

## Status

Accepted

## Date

2026-02-27

## Context

Modern TypeScript/React projects contain multiple categories of files that require different lint rules:

| Category | Pattern | Specific Needs |
|----------|---------|---------------|
| Application code | `**/*.{ts,tsx}` | Full strictness |
| Unit tests | `**/*.test.{ts,tsx}` | Vitest rules, relaxed complexity, no magic numbers |
| E2E tests | `**/*.spec.ts` | Playwright rules, relaxed complexity |
| Stories | `**/*.stories.{ts,tsx}` | Storybook rules, default exports allowed |
| Config files | `**/*.config.*` | No complexity limits, require() allowed |
| Type declarations | `**/*.d.ts` | Most rules disabled |
| Scripts | `**/scripts/**` | Console and process.exit allowed |
| JSON | `**/*.json` | Syntax validation only |
| Markdown | `**/*.md` | Code block validation |

In ESLint flat config, each file pattern is a separate config block with its own `files` array and rule overrides. The challenge is composing these correctly — override blocks must come after base blocks, and they must not unintentionally apply to the wrong files.

## Decision

We use a **flat-computed** approach: all config blocks (base rules + file-pattern overrides) are merged into a single flat array in the generated config file. There is no separate "base config" and "overrides" — everything is pre-computed into the correct order.

For each generated permutation, the output looks like:

```javascript
export default [
  { name: "@effective/eslint/base", rules: { ... } },
  { name: "@effective/eslint/typescript", ... },
  { name: "@effective/eslint/react", ... },        // only if react: true
  { name: "@effective/eslint/tests", files: ["**/*.test.{ts,tsx}"], rules: { ... } },
  { name: "@effective/eslint/e2e", files: ["**/*.spec.ts"], rules: { ... } },
  { name: "@effective/eslint/stories", files: ["**/*.stories.{ts,tsx}"], ... },
  { name: "@effective/eslint/json", files: ["**/*.json"], language: "json/json", ... },
  { name: "@effective/eslint/prettier", rules: { ... } },
]
```

## Consequences

### Positive

- **No user configuration needed.** Tests, stories, and e2e files get appropriate rules automatically.
- **Correct ordering guaranteed.** Overrides are always placed after base rules in the generated output.
- **Named blocks.** Every block has a descriptive `name` property, making it easy to debug with `--print-config` and to target with the rule manipulation API.
- **Conditional inclusion.** Storybook and Testing Library blocks only appear when `react: true`. Playwright and Vitest blocks always appear (tests exist in every project).

### Negative

- **File pattern conventions are opinionated.** We assume `*.test.{ts,tsx}` for unit tests and `*.spec.ts` for E2E. Projects using different conventions need to adjust via the modular API.
- **Cannot add custom file patterns** through the simple `getConfig()` API. Power users must use the modular export path.

### Design Principles

1. **Test files should never have complexity limits.** Test files are naturally verbose (setup, assertions, descriptions). Complexity rules produce noise.
2. **Config files should allow require() and default exports.** Many tools (Vite, Next.js, Tailwind) require `export default` in their config files.
3. **Declaration files should have minimal rules.** `.d.ts` files follow their own patterns (ambient declarations, interface merging, namespaces).
4. **JSON and Markdown are validated but not formatted.** Prettier handles formatting. ESLint validates syntax and structure.
