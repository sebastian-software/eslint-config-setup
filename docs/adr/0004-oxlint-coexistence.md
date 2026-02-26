# ADR-0004: OxLint Coexistence as a First-Class Feature

## Status

Accepted

## Date

2026-02-27

## Context

[OxLint](https://oxc.rs) (stable since June 2025) is a Rust-based linter claiming 50-100x faster performance than ESLint. It implements 690+ rules covering `eslint`, `typescript`, `unicorn`, `import`, `jsx-a11y`, `react`, `react-hooks`, `node`, `jsdoc`, and `promise` plugin rules natively.

OxLint cannot replace ESLint entirely because:

- **No type-aware rules** (type-aware linting is in alpha as of December 2025)
- **No custom JS plugin support** in production (preview since October 2025)
- **Specialty plugins** like `storybook`, `testing-library`, `cspell`, `sonarjs` are not covered

The recommended approach is to run both: `oxlint && eslint`, where OxLint handles fast checks and ESLint handles type-aware and specialty rules.

## Decision

We make OxLint coexistence a **dedicated permutation flag** (`oxlint: true`).

When enabled, [`eslint-plugin-oxlint`](https://github.com/oxc-project/eslint-plugin-oxlint) is appended as the **last config block**, disabling all ESLint rules that OxLint already covers. This is the same pattern as `eslint-config-prettier` (which disables formatting rules covered by Prettier).

The plugin provides granular presets per plugin scope: `flat/recommended`, `flat/typescript`, `flat/unicorn`, `flat/react`, `flat/jsx-a11y`, `flat/import`, `flat/jsdoc`, `flat/node`. We apply the relevant subset based on which flags are active.

## Consequences

### Positive

- **Best of both worlds.** OxLint provides near-instant feedback on 690+ rules. ESLint provides deep type-aware analysis on the rest.
- **Transparent.** Users see exactly which rules ESLint still handles via `--print-config`.
- **No duplicate warnings.** Rules covered by OxLint are cleanly disabled in ESLint.
- **Easy adoption.** Single flag change. No manual rule management.

### Negative

- **Another permutation flag.** Increases total configs from 16 to 32. Acceptable trade-off.
- **OxLint must be installed separately.** It's not an ESLint plugin but a standalone binary. The consumer's `package.json` needs both `oxlint` (for the binary) and our config (which includes `eslint-plugin-oxlint` as a dependency).
- **Rule overlap may drift.** As OxLint adds type-aware rules, the overlap will change. `eslint-plugin-oxlint` handles this upstream; we track it via snapshot tests.

### Recommended CI Setup

```json
{
  "scripts": {
    "lint": "oxlint && eslint",
    "lint:fix": "oxlint --fix && eslint --fix"
  }
}
```

OxLint runs first (fast, catches most issues), ESLint runs second (slower, catches type-aware issues and specialty rules).

## References

- [Announcing OxLint 1.0](https://voidzero.dev/posts/announcing-oxlint-1-stable)
- [eslint-plugin-oxlint](https://github.com/oxc-project/eslint-plugin-oxlint)
- [OxLint type-aware alpha](https://oxc.rs/blog/2025-12-08-type-aware-alpha)
