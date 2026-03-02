# ADR-0001: Pre-built Configs over Runtime Composition

Status: Accepted
Date: 2026-03-02

## Context

ESLint Flat Config is typically composed at runtime — plugins are imported, rules are merged, overrides are stacked. This makes the result dependent on installed versions and execution order.

## Decision

16 permutations (combinations of `react`, `library`, `oxlint`, `ai`) are generated at build time and shipped as static config objects. The consumer selects the matching permutation via an options hash, which is loaded at runtime.

## Consequences

- Determinism: same options → identical config, regardless of environment
- Snapshot testability: every permutation is pinned as a snapshot and regression-tested
- No plugin loading at runtime: all plugin references are already resolved
- Trade-off: new permutations require a build step before release
