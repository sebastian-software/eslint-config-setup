# ADR-0003: AI Mode as a Dedicated Permutation Flag

## Status

Accepted

## Date

2026-02-27

## Context

In 2025/2026, the majority of code in many projects is written by AI assistants (Cursor, GitHub Copilot, Claude Code). These tools produce functional code but often generate:

- Functions without explicit return types
- Magic numbers without named constants
- Deep nesting instead of early returns
- `any` types instead of `unknown`
- Abbreviated variable names (`err` instead of `error`)
- `.forEach()` instead of `for...of`
- Redundant boolean expressions
- `.reduce()` calls that are hard to read
- Sequential `await` in loops instead of `Promise.all()`

Rules that address these issues exist in ESLint plugins but are traditionally considered "too strict" for human developers. For AI assistants, they are trivially satisfiable.

## Decision

We introduce `ai` as a **dedicated permutation flag**, independent of `strict`.

- `strict` controls TypeScript checking depth (recommended vs. strict type-checked) and complexity limits.
- `ai` enables clean-code rules that constrain AI output quality.
- They can be used independently or combined for maximum strictness.

The `ai` flag activates rules in these categories:

1. **Structural clarity** — `curly: "all"`, `no-else-return`, `no-nested-ternary`, `no-param-reassign`, etc.
2. **Explicit TypeScript** — `explicit-function-return-type`, `naming-convention`, `no-explicit-any`, `consistent-type-imports`
3. **No magic values** — `@typescript-eslint/no-magic-numbers`, `sonarjs/no-duplicate-string`
4. **Modern idioms** — `unicorn/prefer-early-return`, `unicorn/prevent-abbreviations`, `unicorn/no-array-reduce`
5. **Code quality** — `sonarjs/cognitive-complexity`, `sonarjs/no-identical-functions`
6. **Async hygiene** — `no-await-in-loop`, `no-floating-promises`
7. **Tightened complexity** — overrides standard/strict limits with even lower thresholds

## Consequences

### Positive

- **Enforceable quality.** AI can ignore documentation and code review comments, but it cannot ignore a failing lint check in CI.
- **Measurable improvement.** Teams report cleaner AI output when strict linting is active in the development loop (editor integration + CI).
- **Opt-in.** Teams that write code manually can leave `ai: false` and get the standard experience.
- **Composable.** `ai + strict` produces the strictest possible config. `ai` alone keeps TypeScript checking at recommended level.

### Negative

- **Doubles the permutation count.** From 16 (4 flags) to 32 (5 flags). Acceptable at ~700 KB total.
- **False positives.** Some AI rules like `prevent-abbreviations` have opinions that not every team agrees with. Mitigated by the `disableRule()` escape hatch.
- **Must be maintained.** The AI rule set should be reviewed periodically as AI assistants improve and ESLint plugins evolve.

### Key Insight

The linter is the most effective mechanism to constrain AI output quality because:

1. It runs automatically (in editor and CI)
2. It produces deterministic, actionable feedback
3. AI assistants can interpret lint errors and fix them in the same iteration
4. It cannot be "talked around" like documentation or review comments

## References

- [ESLint as AI Guardrails](https://medium.com/@albro/eslint-as-ai-guardrails-the-rules-that-make-ai-code-readable-8899c71d3446)
- [Making AI Code Consistent with Linters](https://dev.to/fhaponenka/making-ai-code-consistent-with-linters-27pl)
- [ESLint MCP Integration (2025)](https://eslint.org/blog/2026/01/eslint-2025-year-review/)
