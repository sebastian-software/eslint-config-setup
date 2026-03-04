# ADR-0017: @eslint-react Evaluated but Deferred

Status: Accepted
Date: 2026-03-02

## Context

`@eslint-react` (eslint-plugin-react-x) is a ground-up rewrite of React linting — 4-7x faster, flat config native, with modular sub-plugins for DOM, Web API leak detection, hooks extras, and React Server Components. It has been adopted by `@antfu/eslint-config` and reaches ~650K-1M weekly downloads. However, it does not replace `eslint-plugin-react-hooks` (Meta) for core hooks rules, nor `eslint-plugin-jsx-a11y` for accessibility.

## Decision

Not integrated yet. The project shows strong potential but carries risks for a shared config that prioritizes stability:

- **Single maintainer** (Rel1cx) with no corporate backing — bus factor 1
- **v3 beta in heavy churn** (60+ beta releases in a single week as of March 2026)
- **Not a complete replacement** — still requires `eslint-plugin-react-hooks` and `eslint-plugin-jsx-a11y` alongside it, increasing the total plugin count rather than reducing it
- **493 GitHub stars** vs ~9,000 for the classic plugin — community adoption is growing but not yet mainstream

## Consequences

- We continue using `eslint-plugin-react` + `eslint-plugin-react-hooks` + `eslint-plugin-jsx-a11y` as the proven stack
- Unique capabilities like Web API leak detection (`react-web-api`) and extra hooks rules (`react-hooks-extra`) are not available built-in
- Re-evaluate once v3 stabilizes and the project demonstrates sustained multi-contributor maintenance
