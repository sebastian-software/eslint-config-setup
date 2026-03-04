# ADR-0007: File-Scoped Rule Overrides via Glob Patterns

Status: Accepted
Date: 2026-03-02

## Context

Different file types in a project have different linting needs. Test files need relaxed strictness (e.g. `any` usage, magic numbers), config files are inherently simple scripts, and declaration files (`.d.ts`) should not be checked for unused variables.

## Decision

Six file-scoped override blocks are always included in the composed config, regardless of which options are enabled:

- **tests** (`*.test.{ts,tsx}`, `__tests__/**`) — relaxes complexity, allows `any`, adds Vitest and Testing Library rules
- **e2e** (`*.spec.ts`) — relaxes complexity, adds Playwright rules
- **stories** (`*.stories.{ts,tsx}`) — relaxes exports, adds Storybook rules
- **config-files** (`*.config.{ts,js}`, `vite.config.*`, etc.) — relaxes module rules
- **declarations** (`*.d.ts`) — disables unused-vars, import checks
- **scripts** (`scripts/**`) — relaxes console, process.exit rules

Overrides are no-ops if no files match the glob patterns.

## Consequences

- Consumers get sensible defaults for every file type without manual configuration
- Override blocks are diff-based: only rules that differ from the base block are emitted
- File type conventions are opinionated (e.g. `*.spec.ts` = Playwright, `*.test.ts` = Vitest)
- Adding a new file scope requires changes in both the override module and the code generator
