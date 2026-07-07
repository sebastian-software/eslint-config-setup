---
title: "ADR-0024: llms.txt Entry Points for Agent Guidance"
---

ADR-0024: llms.txt Entry Points for Agent Guidance

Status: Accepted
Date: 2026-07-07
Extends: ADR-0022, ADR-0023

## Context

Agent-first installation needs a compact, discoverable instruction surface. General docs pages are useful, but agents often start from repository root files and need a fast way to find the relevant setup contract.

The repository now has multiple audiences:

- humans reading the docs site
- agents installing the package into another repository
- agents reviewing whether an installation is correct
- maintainers extending the guidance over time

Putting all agent instructions only in a guide page makes them less discoverable from repository-root context. Putting all instructions only in a root text file would duplicate the docs site and become harder to maintain.

## Decision

Add two repository-root agent entry points:

- `llms.txt` as a compact map of package facts, key docs, and preferred agent flow
- `llms-full.txt` as the complete agent installation reference

Keep the canonical human-readable guide in the docs site at `/guide/agent-install`, and have the root entry points link to that guide and related reference pages.

## Consequences

- Agents can discover installation guidance from the repository root without scanning the full docs site
- The short file stays suitable for quick context injection
- The full file can carry the detailed conflict policy, validation expectations, and reporting format
- Docs and `llms*.txt` must stay aligned when setup behavior changes
- `llms.txt` is guidance for agents, not a replacement for package APIs or validation tooling
