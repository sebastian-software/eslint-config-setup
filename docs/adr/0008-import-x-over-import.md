# ADR-0008: eslint-plugin-import-x over eslint-plugin-import

## Status

Accepted

## Date

2026-02-27

## Context

Import linting in the ESLint ecosystem has two competing packages:

1. **[`eslint-plugin-import`](https://github.com/import-js/eslint-plugin-import)** — The original. Widely used, but has incomplete flat config support and a large dependency tree (including `tsconfig-paths`).

2. **[`eslint-plugin-import-x`](https://github.com/un-ts/eslint-plugin-import-x)** — A maintained fork with first-class flat config support, lighter dependencies (uses `get-tsconfig` instead of `tsconfig-paths`), and proper support for the `exports` field in package.json.

Additionally, **import ordering** is handled by a third package:

3. **[`eslint-plugin-simple-import-sort`](https://github.com/lydell/eslint-plugin-simple-import-sort)** — Focused exclusively on deterministic import sorting. Zero config, fast, no resolver needed.

## Decision

We use **both `eslint-plugin-import-x` and `eslint-plugin-simple-import-sort`**, with clear separation of concerns:

- **`simple-import-sort`** handles **ordering** (`imports`, `exports` rules)
- **`eslint-plugin-import-x`** handles **validation** (`no-duplicates`, `no-cycle`, `no-self-import`, `no-mutable-exports`)
- Import-x's sorting rules (`order`, `sort-imports`) are **disabled** to avoid conflicts

## Consequences

### Positive

- **Flat config native.** `import-x` was designed for flat config. No compatibility shims.
- **Lighter.** `import-x` uses `get-tsconfig` (50 KB) instead of `tsconfig-paths` (several MB of transitive dependencies).
- **Better TypeScript support.** `import-x` resolves `exports` fields correctly, which is critical for modern TypeScript packages with conditional exports.
- **Deterministic sorting.** `simple-import-sort` produces the same output regardless of the original order, making it ideal for auto-fix.
- **No conflicts.** Clear separation: one plugin sorts, the other validates.

### Negative

- **Two packages instead of one.** Consumers who look at the dependency tree might wonder why there are two import-related plugins. Documented in this ADR and in the README.
- **Import-x is a fork.** It may diverge from `eslint-plugin-import` over time. In practice, the `import-x` maintainers actively track upstream changes.

## References

- [eslint-plugin-import-x](https://github.com/un-ts/eslint-plugin-import-x)
- [eslint-plugin-simple-import-sort](https://github.com/lydell/eslint-plugin-simple-import-sort)
- [eslint-plugin-import flat config issues](https://github.com/import-js/eslint-plugin-import/issues?q=flat+config)
