# ADR-0006: No Framework-specific Linting (Next.js, Nuxt, Tailwind)

Status: Accepted
Date: 2026-03-02

## Context

Frameworks like Next.js, Nuxt, and Remix have their own ESLint plugins with framework-specific rules. Tailwind CSS has a class-sorting plugin. These plugins are tightly coupled to framework versions and frequently introduce breaking changes.

## Decision

Framework-specific ESLint plugins are not integrated. Framework conventions are the responsibility of the respective framework team and should be added in the project-specific ESLint config.

## Consequences

- Config remains framework-agnostic and works with any setup
- No version coupling to framework releases
- Consumers must add framework-specific rules themselves (e.g. `@next/eslint-plugin-next`)
- Tailwind class sorting is not included — can be added via Prettier plugin or manually
