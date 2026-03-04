# ADR-0015: Dedicated Testing Framework Plugins

Status: Accepted
Date: 2026-03-02

## Context

Testing code has unique patterns and pitfalls that generic ESLint rules cannot catch. Each testing framework (Vitest, Playwright, Testing Library, Storybook) has its own conventions, and violations lead to flaky tests or incorrect assertions.

## Decision

Include four dedicated testing plugins, each scoped to specific file patterns:

- **@vitest/eslint-plugin** → `*.test.{ts,tsx}` — catches missing assertions, incorrect lifecycle usage
- **eslint-plugin-testing-library** → `*.test.{ts,tsx}` — enforces async query patterns, prevents `container` access
- **eslint-plugin-playwright** → `*.spec.ts` — enforces Playwright-specific best practices
- **eslint-plugin-storybook** → `*.stories.{ts,tsx}` — enforces CSF3 conventions

File pattern conventions separate the frameworks: `*.test.*` for unit tests, `*.spec.*` for E2E tests, `*.stories.*` for component stories.

## Consequences

- Framework-specific mistakes are caught at lint time, not at runtime
- File naming conventions are opinionated and must be followed
- Plugins are always loaded even if a project doesn't use a particular framework (no-op if no files match)
- Trade-off: four additional plugin dependencies for comprehensive test coverage
