# ADR-0006: Plugin Selection and Bundling Strategy

## Status

Accepted

## Date

2026-02-27

## Context

A shared ESLint config must decide which plugins to include, how to bundle them, and how to handle the tension between comprehensiveness and package size.

### Plugin Bundling

ESLint's [official recommendation](https://eslint.org/docs/latest/extend/shareable-configs) for shared configs changed in the flat config era:

- **Plugins** go in `dependencies` (not `peerDependencies`). The shared config is responsible for providing the correct plugin versions.
- **ESLint itself** goes in `peerDependencies`.

This means consumers only need to install our package and ESLint — all plugins are resolved transitively.

### Plugin Selection Criteria

We evaluated 30+ ESLint plugins and selected based on:

1. **Flat config support** — Must work with ESLint flat config natively.
2. **Active maintenance** — Regular releases, responsive to ESLint API changes.
3. **Non-overlapping** — Each plugin covers a distinct concern.
4. **Value density** — The plugin provides enough useful rules to justify the dependency.

## Decision

### Selected Plugins (Always Active)

| Plugin | Rationale |
|--------|-----------|
| `@eslint/js` | Foundation. ESLint's own recommended rules. |
| `typescript-eslint` | Essential for TypeScript projects. Type-aware linting is our core value proposition. |
| `eslint-plugin-unicorn` | 100+ rules for modern JS idioms. High value density. |
| `eslint-plugin-regexp` | RegExp quality rules. Small, focused, no overlap. |
| `eslint-plugin-jsdoc` | Validates existing JSDoc (does not require JSDoc). |
| `eslint-plugin-import-x` | Fork of `eslint-plugin-import` with proper flat config support. Provides `no-cycle`, `no-duplicates`, `no-self-import`. |
| `eslint-plugin-simple-import-sort` | Deterministic import ordering. Complements import-x (which handles validation, not sorting). |
| `eslint-plugin-unused-imports` | Auto-fixable unused import removal. |
| `eslint-plugin-sonarjs` | Code quality rules from SonarSource. Cognitive complexity, duplicate detection. |
| `eslint-plugin-security` | Node.js security patterns. eval detection, regex DoS, injection. |
| `@cspell/eslint-plugin` | Spell checking in identifiers and comments. Catches typos in API names. |
| `@eslint/json` | Native JSON linting (official, since Feb 2025). |
| `@eslint/markdown` | Native Markdown linting (official, since May 2025). |
| `eslint-config-prettier` | Disables all formatting rules. Always last. |

### Selected Plugins (Conditional)

| Plugin | Condition | Rationale |
|--------|-----------|-----------|
| `eslint-plugin-react` | `react: true` | Standard React rules. React team support. |
| `eslint-plugin-react-hooks` | `react: true` | Rules of Hooks enforcement. |
| `eslint-plugin-react-compiler` | `react: true` | React 19+ compiler compatibility. Server Components. |
| `eslint-plugin-jsx-a11y` | `react: true` | Accessibility rules for JSX. |
| `eslint-plugin-storybook` | `react: true` | Storybook best practices. File-pattern: `*.stories.*` only. |
| `eslint-plugin-testing-library` | `react: true` | Testing Library best practices. File-pattern: `*.test.*` only. |
| `@vitest/eslint-plugin` | always | Vitest rules. File-pattern: `*.test.*` only. |
| `eslint-plugin-playwright` | always | Playwright rules. File-pattern: `*.spec.*` only. |
| `eslint-plugin-n` | `node: true` | Node.js API rules. |
| `eslint-plugin-oxlint` | `oxlint: true` | Disables rules covered by OxLint. |

### Rejected Plugins

| Plugin | Reason |
|--------|--------|
| `eslint-plugin-import` | Superseded by `eslint-plugin-import-x` (better flat config support, lighter dependencies). |
| `eslint-plugin-promise` | Overlaps almost entirely with typescript-eslint's promise rules (`no-floating-promises`, `promise-function-async`, etc.). |
| `@eslint-react/*` | Newer React lint alternative. Smaller community, less battle-tested than `eslint-plugin-react`. Worth monitoring. |
| `eslint-plugin-perfectionist` | Listed in initial plan but cut from MVP. Overlaps with `simple-import-sort` for import ordering and is too opinionated about object key sorting for a shared config. |
| `eslint-plugin-mdx` | Listed in initial plan. MDX support is niche; can be added via modular imports by teams that need it. |

## Consequences

### Positive

- **Single install.** Consumers only need `@effective/eslint-config` and `eslint`. All 20+ plugins are resolved automatically.
- **Version control.** We control plugin versions, ensuring they're compatible with each other and with the generated configs.
- **Snapshot-testable.** Plugin updates that change rule values are caught by our snapshot tests before release.

### Negative

- **Large dependency tree.** ~20 direct plugin dependencies. Install size is meaningful but acceptable for a dev dependency.
- **Version coupling.** Updating a plugin may require regenerating all 32 configs and updating snapshots. This is by design — it's the safety mechanism.

## References

- [ESLint: Share Configurations](https://eslint.org/docs/latest/extend/shareable-configs)
- [eslint-plugin-import-x](https://github.com/un-ts/eslint-plugin-import-x) — Recommended over original `eslint-plugin-import`
