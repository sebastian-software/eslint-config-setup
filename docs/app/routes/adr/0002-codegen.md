---
title: "ADR-0002: Code Generation over Runtime Serialization"
---

ADR-0002: Code Generation over Runtime Serialization

Status: Accepted
Date: 2026-03-02

## Context

Pre-built configs (ADR-0001) need to be shipped as loadable modules. The naive approach — serializing composed config objects to JSON at build time — fails because ESLint configs contain functions, class instances, and circular references that `JSON.stringify` cannot handle (e.g. plugin objects, parser instances).

## Decision

A code generator (`codegen.ts`) produces valid ES modules with real `import` statements. At build time, all config permutations are composed in memory, then the generator emits `.js` files that import plugins by name and contain only the resolved rules as plain JSON. A plugin registry maps rule namespaces to their import statements.

The generator also computes rule diffs: override blocks (tests, e2e, stories, etc.) only contain rules that differ from the base block, reducing generated file size.

## Consequences

- Pre-generated configs are executable JavaScript, not serialized data
- Plugins are referenced via imports, not embedded — consumers must have them installed
- File probing with picomatch simulates ESLint's config resolution to compute effective rules per file type
- Adding a new plugin requires updating the plugin registry
- Generated files are deterministic and snapshot-testable
