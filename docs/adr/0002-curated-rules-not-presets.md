# ADR-0002: Curated Rules over Plugin Presets

Status: Accepted
Date: 2026-03-02

## Context

Most shared configs use `recommended` presets from their respective plugins and override individual rules. This leads to implicit duplicates and conflicts between plugins that cover the same patterns.

## Decision

Every rule is individually reviewed and hand-picked. We do not use `recommended` or `all` presets — instead we explicitly define which rules from which plugin are active.

## Consequences

- No duplicates or conflicts between plugins (e.g. `no-unused-vars` vs `@typescript-eslint/no-unused-vars`)
- Full control over severity and options of every single rule
- Maintenance overhead on plugin updates: new rules must be manually evaluated
- Transparency: the config files document every conscious decision
