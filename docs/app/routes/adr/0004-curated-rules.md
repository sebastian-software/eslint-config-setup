---
title: "ADR-0004: Curated Rules over Plugin Presets"
---

ADR-0004: Curated Rules over Plugin Presets

Status: Accepted
Date: 2026-03-02

## Context

Most shared configs use `recommended` presets from their respective plugins and override individual rules. This leads to implicit duplicates and conflicts between plugins that cover the same patterns.

## Decision

Where plugins provide well-maintained presets with sensible defaults (e.g. `eslint.configs.recommended`, `tseslint.configs.strictTypeChecked`, `jsdoc flat/recommended-typescript-error`, `regexp flat/recommended`, `package-json recommended`), we use them as a starting point. On top of these baselines, every additional rule is individually reviewed and hand-picked. We never blindly adopt presets without curation — rules are added, removed, or reconfigured to avoid duplicates and conflicts between plugins.

## Consequences

- No duplicates or conflicts between plugins (e.g. `no-unused-vars` vs `@typescript-eslint/no-unused-vars`)
- Full control over severity and options of every single rule
- Established presets reduce initial setup effort; curation on top ensures quality
- Maintenance overhead on plugin updates: new rules must be manually evaluated
- Transparency: the config files document every conscious decision
