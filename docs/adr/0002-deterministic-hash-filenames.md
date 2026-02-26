# ADR-0002: Deterministic Hash-Based Filenames

## Status

Accepted

## Date

2026-02-27

## Context

Pre-generated config files need predictable filenames that can be computed at both build time and runtime without a lookup table. Two approaches were considered:

1. **Descriptive names** — e.g., `react-node-strict-ai-oxlint.js`. Human-readable but fragile: the naming convention must be documented and kept in sync between generator and loader.

2. **Hash-based names** — e.g., `a3f2b1c9.js`. Computed from a deterministic algorithm applied to the options bitmask.

## Decision

We use **SHA-1 hash of the bitmask**, truncated to 8 hex characters.

The algorithm:

```
Options → Bitmask (5 bits, fixed order) → SHA-1("effective-eslint-config:{mask}") → first 8 hex chars → filename
```

The bit positions are fixed and must never change:
- Bit 0: `react`
- Bit 1: `node`
- Bit 2: `strict`
- Bit 3: `ai`
- Bit 4: `oxlint`

## Consequences

### Positive

- **Deterministic.** Same options always produce the same hash on any machine.
- **Collision-free.** SHA-1's 8 hex chars provide 4 billion possible values for our 32 permutations. Collisions are mathematically impossible in this input space.
- **Extensible.** Adding a 6th flag only requires allocating bit 5. All existing hashes remain valid.
- **No coordination needed.** The generator and loader use the same function. No mapping file to maintain.

### Negative

- **Not human-readable.** You can't tell from `a3f2b1c9.js` which flags are active. Mitigated by the generator logging the mapping at build time, and by `getConfig()` producing clear error messages.

### Alternatives Considered

- **Descriptive names** (`react-strict.js`): Readable but fragile. Adding/renaming flags requires updating naming conventions in multiple places.
- **Numeric index** (`config-5.js`): Simple but meaningless. Offers no advantage over hashes.
- **Full SHA-1** (`a3f2b1c9e5d7...js`): Unnecessarily long. 8 chars is sufficient for 32 inputs.
