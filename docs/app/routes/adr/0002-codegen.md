---
title: "ADR-0002: Code Generation over Runtime Serialization"
---

ADR-0002: Code Generation over Runtime Serialization

Status: Accepted
Date: 2026-03-02

## Context

Pre-built configs (ADR-0001) need to be shipped as loadable modules. The naive approach — serializing composed config objects to JSON at build time — fails because ESLint configs contain functions, class instances, and circular references that `JSON.stringify` cannot handle (e.g. plugin objects, parser instances).

## Decision

A code generator (`codegen.ts`) produces valid ES modules with real `import` statements. At build time, all config permutations are composed in memory, then the generator emits `.js` files that import plugins by name and contain the resolved rules and settings. Rules are emitted as plain JSON. A plugin registry maps rule namespaces to their import statements.

The generator also computes rule diffs: override blocks (tests, e2e, stories, etc.) only contain rules that differ from the base block, reducing generated file size.

Shared `settings` (e.g. the import-x resolver or perfectionist sorting options) are emitted into the base block only. They are collected exclusively from fully global composed blocks, meaning blocks without `files`, `ignores`, `basePath`, `language` or `processor`, and merged like ESLint's flat-config merge (objects recursively, arrays and other values replaced). A scoped block that carries settings fails the build instead of being silently dropped or applied globally. JSON-serializable values are emitted as JSON. Values that are not serializable, such as resolver objects, need an explicit key-to-expression mapping (`settingExpressions` in the plugin registry), for example `import-x/resolver-next` mapped to `createImportXResolvers()` imported from `eslint-config-setup/import-resolvers`. This dedicated minimal entry is used instead of `eslint-config-setup/modules` because the latter re-exports every config factory, so loading it would evaluate every plugin. With the dedicated entry, a generated config loads only the plugins its permutation needs plus the two resolver packages. An unmapped non-serializable value or a stale mapping fails the build.

## Consequences

- Pre-generated configs are executable JavaScript, not serialized data
- Plugins are referenced via imports, not embedded — consumers must have them installed
- File probing with picomatch simulates ESLint's config resolution to compute effective rules per file type
- Adding a new plugin requires updating the plugin registry; a non-serializable setting additionally requires a `settingExpressions` entry
- Generated files are deterministic and snapshot-testable
