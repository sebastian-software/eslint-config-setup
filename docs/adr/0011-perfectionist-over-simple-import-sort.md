# ADR-0011: Perfectionist over simple-import-sort

Status: Accepted
Date: 2026-03-02

## Context

`simple-import-sort` only sorts import and export statements. For structural sorting (object keys, interfaces, enums, JSX props, switch cases) a second plugin would be needed. `eslint-plugin-perfectionist` covers all of these with a single plugin and additionally supports TypeScript aliases and named import sorting.

## Decision

Perfectionist for all sorting needs. Base rules (mechanical sorting like imports, exports, named imports) are always active. Structural rules (object keys, interfaces, enums, etc.) are only enabled in AI mode. `partitionByNewLine: true` is set globally to preserve semantic blank-line grouping, with the exception of `sort-imports` which sets it to `false` to enforce a single canonical import order without blank-line partitions.

## Consequences

- One plugin instead of two: fewer dependencies, consistent configuration
- Semantic blank lines are preserved — sorting does not break across blank lines
- Structural sorting in AI mode enforces consistent ordering in AI-generated code
- Trade-off: perfectionist is more comprehensive than simple-import-sort and has more configuration options
