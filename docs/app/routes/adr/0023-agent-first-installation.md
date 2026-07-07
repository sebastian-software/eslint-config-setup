---
title: "ADR-0023: Agent-First Installation over Install Script"
---

ADR-0023: Agent-First Installation over Install Script

Status: Accepted
Date: 2026-07-07
Extends: ADR-0021, ADR-0022

## Context

Installing a lint config into an existing repository is rarely a pure package-add operation. Real target repositories may already have:

- a package manager and lockfile that must not be changed
- monorepo package boundaries
- existing ESLint, OxLint, Prettier, Biome, or hook configuration
- custom `lint`, `check`, or CI scripts
- mixed browser and Node.js runtime folders
- project-specific TypeScript setup

A traditional install script can add files quickly, but it cannot reliably understand these project-specific constraints. A script that overwrites config would be risky; a script that asks about every branch would still be less flexible than an agent that can inspect the repository and explain a plan.

## Decision

Do not build a broad interactive install script as the primary setup path.

Document an agent-first installation contract instead. The agent should inspect the target repository, choose the right option flags, preserve existing semantics, make the smallest safe edits, and validate the result with the target repo's own commands.

When conflicts exist, the agent should stop and present a migration plan before replacing existing lint configuration.

## Consequences

- Setup can adapt to monorepos, existing lint stacks, and mixed runtime repositories
- The project avoids encoding fragile repository-detection logic in a one-size-fits-all script
- Installation guidance must be explicit enough for agents to follow without guessing
- Human users still get copy-paste examples, but agents get a richer decision workflow
- A future `doctor` command can validate the target state read-only, but installation guidance does not depend on it
