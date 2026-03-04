---
title: "ADR-0015: No eslint-plugin-promise"
---

ADR-0015: No eslint-plugin-promise

Status: Accepted
Date: 2026-03-02

## Context

`eslint-plugin-promise` provides rules for Promise patterns like `no-return-in-finally`, `no-nesting`, `prefer-await-to-then`, and `catch-or-return`. In a modern TypeScript project with an async/await focus, most of these rules are irrelevant or redundant.

## Decision

`eslint-plugin-promise` is not integrated. The remaining edge cases (e.g. `no-return-in-finally`) occur too rarely to justify an additional dependency.

## Consequences

- One fewer dependency in the config
- TypeScript + SonarJS already cover the relevant Promise patterns (`no-floating-promises`, `no-misused-promises`, cognitive complexity)
- Rare edge cases like `return` in `finally` blocks are not automatically detected
