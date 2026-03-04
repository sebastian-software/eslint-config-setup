# ADR-0007: OxLint Integration via Config Migration

Status: Accepted
Date: 2026-03-02

## Context

OxLint re-implements ESLint rules in Rust and is 10-100x faster. Many rules have 1:1 equivalents. Manually synchronizing between ESLint and OxLint rules is error-prone and maintenance-intensive.

## Decision

At build time, `@oxlint/migrate` translates the ESLint config into OxLint-compatible configs. At runtime, `eslint-plugin-oxlint` is used: with `oxlint: true`, rules that OxLint already covers are disabled in the ESLint config. This creates a split-linting setup without duplicates.

## Consequences

- Split linting possible: OxLint for fast checks, ESLint for plugin-specific rules
- No manual rule synchronization needed — migration is automated
- Build-time dependency on `@oxlint/migrate` for config generation, runtime dependency on `eslint-plugin-oxlint` for rule deduplication
- Consumer needs `oxlint` as a separate installation in the project
