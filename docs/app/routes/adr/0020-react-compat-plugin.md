---
title: "ADR-0020: React Compat Plugin"
---

ADR-0020: React Compat Plugin

Status: Accepted
Date: 2026-03-06
Extends: ADR-0019, ADR-0009

## Context

ADR-0019 replaced `eslint-plugin-react` with `@eslint-react/eslint-plugin` for React-specific linting. The React stack now keeps first-class namespaces for adjacent concerns:

- `react/*` for @eslint-react React, DOM, Web API, naming, and RSC rules
- `react-hooks/*` for Meta's Hooks and React Compiler rules
- `jsx-a11y/*` for accessibility
- `react-perf/*` for AI-only render performance rules

@eslint-react organizes its rules across several internal families, each with its own upstream naming scheme:

| Family | Prefix |
|--------|--------|
| Core | `@eslint-react/` |
| DOM | `@eslint-react/dom/` |
| Web API | `@eslint-react/web-api/` |
| Naming Convention | `@eslint-react/naming-convention/` |
| RSC | `@eslint-react/rsc/` |

This creates two problems:

1. **OxLint incompatibility.** OxLint implements React rules under the classic `react/` prefix using legacy `eslint-plugin-react` names (e.g., `react/jsx-key`, not `@eslint-react/no-missing-key`). When `eslint-plugin-oxlint` disables ESLint rules that OxLint covers, it looks for `react/jsx-key` — but our config uses `@eslint-react/no-missing-key`. The rule runs in both linters. No speed gain.

2. **Namespace fragmentation.** Users see React-specific rules spread across `@eslint-react/`, `@eslint-react/dom/`, and `@eslint-react/web-api/` in editor diagnostics. Multiple prefixes for one React concern.

## Decision

Create a **React Compat Plugin** — a thin adapter that merges @eslint-react's React-specific rule families into a single ESLint plugin registered under the `react` namespace. Rules with a 1:1 legacy `eslint-plugin-react` equivalent are registered under the legacy name. Rules without a legacy equivalent keep their @eslint-react short name.

Do not route Hooks or performance rules through this adapter. Hooks use `eslint-plugin-react-hooks` under `react-hooks/*`; AI-only performance rules use `eslint-plugin-react-perf` under `react-perf/*`.

### How it works

The compat plugin builds a unified rules object in three steps:

1. **Core rules** — added under their original name, unless they have a legacy alias
2. **Sub-plugin rules** (DOM, Web API, Naming, RSC) — added under their short name (prefix stripped), unless they have a legacy alias
3. **Legacy aliases** — reviewed 1:1 rules registered under their classic `eslint-plugin-react` name, pointing to the @eslint-react implementation

### The mapping source

@eslint-react ships a `disable-conflict-eslint-plugin-react` config that lists every rule with a legacy equivalent. This config is the authoritative mapping table. Four legacy names that map to multiple @eslint-react rules (`no-unsafe`, `no-deprecated`, `forbid-prop-types`, `jsx-filename-extension`) are intentionally skipped — only 1:1 mappings are used.

### What this means for OxLint

With the current dependency baseline, 28 active `react/*` rules overlap with OxLint. When users enable `oxlint: true`, `eslint-plugin-oxlint`'s `flat/react` config sets those rules to `"off"` in ESLint — and because our compat plugin uses the exact names OxLint expects, the deduplication works automatically. ESLint only handles the React rules OxLint can't cover yet.

OxLint integration also appends native `flat/react-hooks` coverage for the two core Hooks rules. When both `react: true` and `ai: true` are enabled, it appends `flat/react-perf` so the four AI-only React Perf rules run in Rust.

### What this means for future growth

The 45 rules without a legacy equivalent (e.g., `no-context-provider`, `no-leaked-event-listener`) are registered under their @eslint-react short name with the `react/` prefix. Since no legacy name exists, OxLint would adopt these same names if it implements them in the future. The compat plugin is already positioned correctly — no config changes needed when OxLint expands its React coverage.

### Where the compat logic lives

- **Compose-time** (internal use): `src/plugins/react-compat.ts` — builds the merged plugin object at import time, used by `src/configs/react.ts`
- **Generated configs** (user-facing): `src/build/codegen.ts` emits an inline `reactCompatPlugin` helper in every generated config that includes React, so the mapping logic is self-contained in the output file

## Consequences

- @eslint-react React rules use a single `react/` prefix, while Hooks, accessibility, and performance keep their native plugin namespaces
- React, JSX-a11y, Hooks, and AI-only React Perf overlaps automatically run in OxLint's Rust engine when `oxlint: true`
- The compat plugin follows the same pattern as `eslint-plugin-import-x` (registered as `import`) and `eslint-plugin-n` (registered as `node`) — proven ESLint convention
- Future OxLint React rule additions are reviewed by the QA-gated rule-surface check before dependency upgrades land
- The mapping table must be updated when @eslint-react adds or removes rules with legacy equivalents
