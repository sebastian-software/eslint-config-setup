---
title: "ADR-0022: Documentation Site as Product Surface"
---

ADR-0022: Documentation Site as Product Surface

Status: Accepted
Date: 2026-02-27 (documented 2026-07-07)

## Context

`eslint-config-setup` is not only a config package. It contains opinions about rule philosophy, generated permutations, OxLint split-linting, AI-focused rules, React compatibility, and consumer customization.

A README alone becomes hard to scan once the project needs:

- getting-started guidance for humans
- reference material for options and helper APIs
- explanations for non-obvious architecture choices
- ADRs for rule and plugin decisions
- generated API documentation from source types

The docs also need to be publishable as a stable website for package metadata, GitHub Pages, and future agent-facing references.

## Decision

Maintain a dedicated Ardo documentation workspace and publish it as the canonical long-form documentation surface.

Use the root README for repository/package orientation, but move detailed guides, API reference, and ADRs into the docs site. The docs site is part of the product, not an optional development artifact.

## Consequences

- Complex topics can be split by audience: quick start, configuration, architecture, API, ADRs
- TypeDoc output keeps public API documentation close to source types
- ADRs become linkable from guides and PRs instead of living as disconnected repository notes
- Docs changes need the same validation path as code changes (`lint:docs` and `docs:build`)
- Sidebar and index maintenance become part of adding new user-facing guidance
