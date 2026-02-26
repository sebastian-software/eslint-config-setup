# ADR-0001: Pre-Generated Configs over Runtime Composition

## Status

Accepted

## Date

2026-02-27

## Context

When creating a shared ESLint config, there are two fundamental approaches:

1. **Runtime composition** — The consumer imports building blocks and the config is assembled when ESLint starts. This is how most shared configs work (`@antfu/eslint-config`, `eslint-config-xo`, etc.).

2. **Pre-generation** — All permutations are computed at build time and shipped as static JS files. The consumer loads the correct file by its hash.

We evaluated both approaches across three prior iterations of this project (`effective-eslint-cfg`, `eslint-config-audit`, `eslint-config-setup`).

## Decision

We use **pre-generated configs with deterministic hashing**.

At build time, all 32 permutations (2^5 boolean flags) are generated and written to `dist/configs/{hash}.js`. At runtime, `getConfig()` computes the same hash from the user's options and dynamically imports the matching file.

## Consequences

### Positive

- **Zero runtime overhead.** No plugin resolution, no config merging, no composition logic at startup. The editor gets lint results as fast as possible.
- **Predictability.** The exact same config is produced every time. No surprises from plugin loading order or lazy initialization timing.
- **Snapshot testable.** Generated configs can be committed and diffed. When a plugin update changes a rule value, the snapshot test breaks immediately with a clear diff.
- **Inspectable.** Developers can read `dist/configs/{hash}.js` to see exactly what rules are active for their options.

### Negative

- **32 files shipped in the package.** Each config is ~20-35 KB of JS. Total package size is ~700 KB. This is a one-time install cost, acceptable for a dev dependency.
- **New flags require a rebuild.** Adding a 6th flag would produce 64 permutations. This scales at O(2^n), but 5 flags (32 configs) is well within reason.
- **Less flexible than runtime composition.** Users who want a completely custom arrangement must use the modular export path (`@effective/eslint-config/modules`).

### Alternatives Considered

- **Runtime-only composition** (as in `eslint-config-audit`): More flexible, but adds startup latency and makes the config harder to snapshot-test.
- **Hybrid with caching**: Generate on first run and cache. Adds complexity and filesystem side-effects at lint time.

## References

- `refs/effective-eslint-cfg` — First implementation of pre-generation approach
- `refs/eslint-config-audit` — Runtime composition approach
- `refs/eslint-config-setup` — Pre-generation with delta compression
