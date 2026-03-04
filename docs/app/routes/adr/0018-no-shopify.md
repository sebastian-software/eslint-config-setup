---
title: "ADR-0018: No @shopify/eslint-plugin"
---

ADR-0018: No @shopify/eslint-plugin

Status: Accepted
Date: 2026-03-02

## Context

`@shopify/eslint-plugin` provides 29 custom ESLint rules developed for Shopify's internal stack. It was evaluated for rules that could complement our config. At ~80K weekly downloads it is primarily used within Shopify's own ecosystem.

## Decision

Not integrated. Of 29 rules, only 2-3 are both unique and broadly applicable:

- **`prefer-early-return`** — enforces early returns over full-body conditional wrapping. No equivalent in unicorn (open issue since 2017), sonarjs, or ESLint core. Available as standalone `eslint-plugin-prefer-early-return`.
- **`jsx-no-complex-expressions`** — prevents deeply nested ternaries and complex logic inline in JSX. No equivalent in eslint-plugin-react or other plugins.
- **`restrict-full-import`** — prevents full imports of large packages (`import _ from 'lodash'`). Partially overlaps with `import-x/no-namespace` but targets a different pattern.

The remaining rules are Shopify-internal (Polaris UI, Twine, Sinon), class-component-era React (obsolete with hooks), or already covered by our existing plugins.

## Consequences

- No additional dependency for 2-3 useful rules out of 29
- `prefer-early-return` remains the most notable gap — could be added via the standalone package in the future
- `jsx-no-complex-expressions` is worth revisiting if a standalone implementation emerges
