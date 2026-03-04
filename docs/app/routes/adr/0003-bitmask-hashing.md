---
title: "ADR-0003: Bitmask Hashing for Config Permutations"
---

ADR-0003: Bitmask Hashing for Config Permutations

Status: Accepted
Date: 2026-03-02

## Context

Pre-built configs (ADR-0001) produce 16 ESLint and 8 OxLint permutations from boolean flag combinations. Each permutation needs a stable, deterministic filename that maps options to generated files at both build time and runtime.

## Decision

Each boolean flag is assigned a fixed bit position (`react`=bit 0, `node`=bit 1, `ai`=bit 2, `oxlint`=bit 3). The resulting bitmask is hashed with SHA-1 (salted with a fixed prefix) and truncated to 8 hex characters for the filename.

The bit order is frozen and must never change — it would break all published configs. ESLint and OxLint configs use different salt prefixes to avoid filename collisions.

## Consequences

- Same options always produce the same filename — deterministic across environments
- Filenames are opaque hashes, not human-readable (e.g. `a3f1b2c4.js`)
- Adding a new boolean flag doubles the number of permutations (currently 4 flags → 16 ESLint, 3 flags → 8 OxLint)
- The hash algorithm and bit order are frozen for backward compatibility
- Collision risk is negligible (8 hex chars = 4 billion possibilities for ≤24 permutations)
