---
title: "ADR-0020: React Compat Plugin"
---

ADR-0020: React Compat Plugin

Status: Accepted
Date: 2026-03-06
Extends: ADR-0019, ADR-0009

## Context

ADR-0019 replaced `eslint-plugin-react` with `@eslint-react/eslint-plugin`. This modern plugin organizes its 95 rules across six sub-plugins, each with its own namespace:

| Sub-plugin | Prefix | Rules |
|------------|--------|-------|
| Core | `@eslint-react/` | 64 |
| DOM | `@eslint-react/dom/` | 18 |
| Web API | `@eslint-react/web-api/` | 4 |
| Hooks Extra | `@eslint-react/hooks-extra/` | 1 |
| Naming Convention | `@eslint-react/naming-convention/` | 6 |
| RSC | `@eslint-react/rsc/` | 1 |

This creates two problems:

1. **OxLint incompatibility.** OxLint implements React rules under the classic `react/` prefix using legacy `eslint-plugin-react` names (e.g., `react/jsx-key`, not `@eslint-react/no-missing-key`). When `eslint-plugin-oxlint` disables ESLint rules that OxLint covers, it looks for `react/jsx-key` — but our config uses `@eslint-react/no-missing-key`. The rule runs in both linters. No speed gain.

2. **Namespace fragmentation.** Users see rules spread across `@eslint-react/`, `@eslint-react/dom/`, and `@eslint-react/web-api/` in editor diagnostics. Three prefixes for one concern.

## Decision

Create a **React Compat Plugin** — a thin adapter that merges all six @eslint-react sub-plugins into a single ESLint plugin registered under the `react` namespace. Rules with a 1:1 legacy `eslint-plugin-react` equivalent are registered under the legacy name. Rules without a legacy equivalent keep their @eslint-react short name.

### How it works

The compat plugin builds a unified rules object in three steps:

1. **Core rules** — added under their original name, unless they have a legacy alias
2. **Sub-plugin rules** (DOM, Web API, Hooks Extra, Naming, RSC) — added under their short name (prefix stripped), unless they have a legacy alias
3. **Legacy aliases** — 41 rules registered under their classic `eslint-plugin-react` name, pointing to the semantically equivalent @eslint-react implementation

### The mapping source

@eslint-react ships a `disable-conflict-eslint-plugin-react` config that is useful as a conflict inventory, but it is not an authoritative alias table. We only map legacy names when the semantics actually match. Grouped legacy rules like `no-unsafe` and `no-deprecated`, and semantic mismatches like `forward-ref-uses-ref`, `prop-types`, `forbid-prop-types`, and `jsx-filename-extension`, are intentionally skipped.

### What this means for OxLint

Of the 41 mapped rules, **31 have active OxLint implementations.** When users enable `oxlint: true`, `eslint-plugin-oxlint`'s `flat/react` config sets these 31 rules to `"off"` in ESLint — and because our compat plugin uses the exact names OxLint expects for that compatible subset, the deduplication works automatically. These 31 rules run in Rust at native speed. ESLint only handles the rules OxLint can't cover yet.

### What this means for future growth

The 45 rules without a legacy equivalent (e.g., `no-context-provider`, `no-leaked-event-listener`) are registered under their @eslint-react short name with the `react/` prefix. Since no legacy name exists, OxLint would adopt these same names if it implements them in the future. The compat plugin is already positioned correctly — no config changes needed when OxLint expands its React coverage.

### Where the compat logic lives

- **Compose-time** (internal use): `src/plugins/react-compat.ts` — builds the merged plugin object at import time, used by `src/configs/react.ts`
- **Generated configs** (user-facing): `src/build/codegen.ts` emits an inline `reactCompatPlugin` helper in every generated config that includes React, so the mapping logic is self-contained in the output file

## Consequences

- All React rules use a single `react/` prefix — clean editor diagnostics, one namespace to remember
- 31 rules automatically run in OxLint's Rust engine when `oxlint: true` — measured speedup with zero user configuration
- The compat plugin follows the same pattern as `eslint-plugin-import-x` (registered as `import`) and `eslint-plugin-n` (registered as `node`) — proven ESLint convention
- Future OxLint React rule additions will automatically be deduplicated, as the naming is already aligned
- The mapping table must be updated when @eslint-react adds new rules with legacy equivalents, but this is low-frequency maintenance tied to @eslint-react releases
