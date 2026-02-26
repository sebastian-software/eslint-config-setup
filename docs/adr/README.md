# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for `@effective/eslint-config`. Each ADR documents a significant architectural decision, its context, the alternatives considered, and the consequences.

## Index

| # | Title | Status |
|---|-------|--------|
| [0001](0001-pre-generated-configs.md) | Pre-Generated Configs over Runtime Composition | Accepted |
| [0002](0002-deterministic-hash-filenames.md) | Deterministic Hash-Based Filenames | Accepted |
| [0003](0003-ai-mode-as-dedicated-flag.md) | AI Mode as a Dedicated Permutation Flag | Accepted |
| [0004](0004-oxlint-coexistence.md) | OxLint Coexistence as a First-Class Feature | Accepted |
| [0005](0005-file-pattern-overrides.md) | Flat-Computed File-Pattern Overrides | Accepted |
| [0006](0006-plugin-selection.md) | Plugin Selection and Bundling Strategy | Accepted |
| [0007](0007-rule-manipulation-api.md) | Runtime Rule Manipulation API | Accepted |
| [0008](0008-import-x-over-import.md) | eslint-plugin-import-x over eslint-plugin-import | Accepted |

## Format

Each ADR follows this structure:

- **Status** — `Proposed`, `Accepted`, `Deprecated`, or `Superseded by [ADR-XXXX]`
- **Date** — When the decision was made
- **Context** — Why the decision was needed
- **Decision** — What we decided
- **Consequences** — Positive and negative outcomes, plus alternatives considered
