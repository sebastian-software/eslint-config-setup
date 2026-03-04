# ADR-0010: OxLint over Biome

Status: Accepted
Date: 2026-03-02

## Context

Both OxLint and Biome offer fast, Rust-based linting as alternatives or complements to ESLint. Biome is a unified toolchain (formatter + linter) with its own rule set, while OxLint focuses purely on linting and is part of the Oxc ecosystem (alongside Rolldown/Vite).

## Decision

OxLint is chosen over Biome for the following reasons:

- **ESLint JS API compatibility:** OxLint rules map 1:1 to ESLint rules, enabling automated migration via `@oxlint/migrate`. Biome uses its own rule naming and semantics, requiring manual mapping.
- **Plugin/preset reuse:** Existing ESLint plugins and shared configs continue to work — OxLint handles the subset it supports, ESLint covers the rest. Biome requires a full migration away from the ESLint ecosystem.
- **Performance:** OxLint is faster than Biome in pure linting benchmarks, as it does not carry the overhead of a combined formatter/linter architecture.
- **Ecosystem alignment:** OxLint is part of the Oxc toolchain (Oxc parser, Rolldown bundler) which powers Vite. Betting on the Vite ecosystem aligns with the broader frontend trajectory.

## Consequences

- Split-linting setup (OxLint + ESLint) instead of a full toolchain replacement
- ESLint remains the source of truth for rule configuration
- Dependency on Oxc ecosystem maturity and continued development
- Biome's unified formatter+linter value proposition is intentionally left on the table
