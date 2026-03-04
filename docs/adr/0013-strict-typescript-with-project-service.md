# ADR-0013: Strict TypeScript with projectService

Status: Accepted
Date: 2026-03-02

## Context

TypeScript-ESLint offers multiple preset tiers: `recommended`, `strict`, and `strictTypeChecked`. Type-checked rules (requiring a `tsconfig.json`) catch significantly more bugs (e.g. `no-floating-promises`, `no-misused-promises`, `restrict-template-expressions`) but require parser configuration pointing to a TypeScript project.

## Decision

Use `tseslint.configs.strictTypeChecked` and `tseslint.configs.stylisticTypeChecked` as the baseline. Enable `parserOptions.projectService: true` for automatic tsconfig discovery — no manual `project` paths needed.

Plain JavaScript files (`*.js`, `*.mjs`, `*.cjs`) automatically get type-checked rules disabled via `tseslint.configs.disableTypeChecked`.

## Consequences

- Maximum type safety out of the box — strictest available preset
- `projectService: true` eliminates tsconfig path management for consumers
- Requires `typescript` as a peer dependency
- Type-checked rules only work in projects with a `tsconfig.json`
- Preset rules are further customized (e.g. `no-unused-vars` with underscore pattern, `array-type` with `array-simple`)
