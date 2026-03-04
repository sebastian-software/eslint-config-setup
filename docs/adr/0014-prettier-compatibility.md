# ADR-0014: Prettier Compatibility via eslint-config-prettier

Status: Accepted
Date: 2026-03-02

## Context

ESLint and Prettier overlap on ~30 formatting rules (indentation, quotes, semicolons, etc.). Running both without coordination causes conflicting auto-fixes. Two approaches exist: (a) maintain a custom list of disabled rules, or (b) use `eslint-config-prettier` which automatically disables all conflicting rules.

## Decision

Use `eslint-config-prettier` as the second-to-last config block (before OxLint if enabled). This preset disables all ESLint rules that would conflict with Prettier formatting.

No ESLint formatting rules are configured — formatting is entirely delegated to Prettier.

## Consequences

- Prettier and ESLint coexist without conflicts
- Config block ordering matters: `eslint-config-prettier` must come after all other rule configs
- Formatting rules from any plugin (including unicorn, react, etc.) are automatically disabled
- No maintenance overhead when Prettier adds or changes formatting behavior
