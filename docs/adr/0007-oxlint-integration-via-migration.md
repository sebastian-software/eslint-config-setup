# ADR-0007: OxLint Integration via Config Migration

Status: Accepted
Date: 2026-03-02

## Context

OxLint re-implements ESLint rules in Rust and is 10-100x faster. Many rules have 1:1 equivalents. Manually synchronizing between ESLint and OxLint rules is error-prone and maintenance-intensive.

## Decision

`@oxlint/migrate` automatically translates the ESLint config to OxLint. With `oxlint: true`, rules that OxLint already covers are disabled in the ESLint config. This creates a split-linting setup without duplicates.

## Consequences

- Split linting possible: OxLint for fast checks, ESLint for plugin-specific rules
- No manual rule synchronization needed — migration is automated
- Dependency on `@oxlint/migrate` for correct translation
- Consumer needs `oxlint` as a separate installation in the project
