---
title: File-Specific Rules
---

# File-Specific Rules

Different files need different rules. We automatically detect file types by name patterns and adjust rules accordingly.

## Test Files (`**/*.test.{ts,tsx}`)

Unit test files get Vitest and Testing Library rules. Size limits are disabled because tests are often long.

| Rule | Setting | Why |
|------|---------|-----|
| `vitest/*` | recommended | Test assertions, no focused tests, etc. |
| `testing-library/*` | recommended | DOM/React testing best practices |
| `max-lines` | off | Test files can be long |
| `max-lines-per-function` | off | Test suites have many cases |
| `max-statements` | off | Setup + assertions add up |

::: info
Vitest rules are also compatible with Bun Test, which uses the same API.
:::

## E2E Test Files (`**/*.spec.ts`)

Playwright E2E tests. Same size relaxations as unit tests.

| Rule | Setting | Why |
|------|---------|-----|
| `playwright/*` | recommended | Await assertions, no focused tests, etc. |
| `max-lines` | off | E2E tests can be long |
| `max-lines-per-function` | off | Complex user flows |
| `max-statements` | off | Many interactions per test |

## Story Files (`**/*.stories.{ts,tsx}`)

Storybook story files.

| Rule | Setting | Why |
|------|---------|-----|
| `storybook/*` | recommended | Story structure, meta exports |

## Config Files (`**/*.config.{ts,mts,cts}`)

Build tool configs like `vite.config.ts`, `vitest.config.ts`, `eslint.config.ts`, `tailwind.config.ts`.

| Rule | Setting | Why |
|------|---------|-----|
| `@typescript-eslint/no-require-imports` | off | CJS plugins need `require()` |
| `import/no-default-export` | off | Configs use default exports |
| `no-console` | off | Build scripts log output |
| `max-lines` | off | Configs can be complex |
| `max-lines-per-function` | off | Plugin configurations are verbose |
| `complexity` | off | Many conditional options |

## Type Declaration Files (`**/*.d.ts`)

TypeScript declaration files have different semantics than regular code.

| Rule | Setting | Why |
|------|---------|-----|
| `@typescript-eslint/no-unused-vars` | off | Declarations define types without using them |
| `@typescript-eslint/no-empty-interface` | off | Empty interfaces for declaration merging |
| `@typescript-eslint/no-empty-object-type` | off | Same as above |
| `@typescript-eslint/triple-slash-reference` | off | `/// <reference>` is standard in d.ts |

## Why `.test` vs `.spec`?

We use `.test.ts` for unit tests (Vitest) and `.spec.ts` for E2E tests (Playwright). This follows [Playwright's documentation](https://playwright.dev/docs/test-configuration) which consistently uses `.spec.ts`.

Some projects use `.spec` for unit tests too — if that's you, you'll need to adjust the file patterns in your config.

## Co-located Tests

We match by file name pattern, not by directory (`__tests__/**`). This supports co-locating tests next to the code they test:

```
src/
  utils/
    dateUtils.ts
    dateUtils.test.ts     ← Vitest + Testing Library rules
  components/
    Button.tsx
    Button.test.tsx       ← Vitest + Testing Library rules
    Button.stories.tsx    ← Storybook rules
tests/
  e2e/
    checkout.spec.ts      ← Playwright rules
vite.config.ts            ← Relaxed config rules
src/types/global.d.ts     ← Declaration rules
```
