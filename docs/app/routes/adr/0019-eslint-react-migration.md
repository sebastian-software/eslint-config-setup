---
title: "ADR-0019: Migration to @eslint-react"
---

ADR-0019: Migration to @eslint-react

Status: Accepted
Date: 2026-03-05
Supersedes: ADR-0017

## Context

`eslint-plugin-react` has been unmaintained for ~2 years and is incompatible with ESLint v10 (crashes on the removed `getFilename` API). `eslint-plugin-react-hooks` is also replaced since `@eslint-react` provides its own `rules-of-hooks` and `exhaustive-deps` rules.

`@eslint-react` (eslint-plugin-react-x) is a ground-up rewrite — 4-7x faster, flat config native, with modular sub-plugins for DOM, Web API leak detection, hooks, and React 19 migration support.

## Decision

Replace `eslint-plugin-react` + `eslint-plugin-react-hooks` with `@eslint-react/eslint-plugin`. Add `@stylistic/eslint-plugin` for the two stylistic JSX rules (`self-closing-comp`, `jsx-curly-brace-presence`) that have no equivalent in `@eslint-react`.

Keep `eslint-plugin-jsx-a11y`, `eslint-plugin-react-refresh`, and `eslint-plugin-react-you-might-not-need-an-effect` unchanged.

Reasons:

- **ESLint v10 compatibility** — `eslint-plugin-react` crashes on `getFilename` removal; `@eslint-react` is flat config native
- **React 19 migration rules** — `no-context-provider`, `no-forward-ref`, `no-use-context` guide codebases toward React 19 patterns
- **Web API leak detection** — `no-leaked-event-listener`, `no-leaked-interval`, `no-leaked-timeout`, `no-leaked-resize-observer` catch missing cleanup in effects
- **Built-in hooks rules** — eliminates the need for `eslint-plugin-react-hooks` as a separate dependency

## Consequences

- The `react: { version: "detect" }` setting is no longer needed
- Some rules are dropped without replacement (`jsx-pascal-case`, `function-component-definition`, `no-multi-comp`, `jsx-no-bind`) — these are nice-to-have rules that TypeScript or convention handle
- Rules that TypeScript already catches are removed (`jsx-no-undef`, `jsx-no-duplicate-props`)
- `react/no-string-refs` is dropped as React 19 removes string refs entirely
- `react/no-deprecated` is dropped — superseded by the specific React 19 migration rules
