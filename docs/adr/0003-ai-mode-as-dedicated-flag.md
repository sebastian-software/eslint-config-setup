# ADR-0003: AI Mode as Dedicated Flag

Status: Accepted
Date: 2026-03-02

## Context

AI-generated code (via Copilot, Cursor, Claude Code, etc.) tends towards certain anti-patterns: excessive complexity, unused imports, missing error handling patterns, deeply nested logic. Standard rules alone do not reliably catch these patterns.

## Decision

A dedicated `ai: true` flag activates stricter rules from all integrated plugins — particularly complexity limits, strict unused detection, and structural constraints. These rules supplement the base config without replacing it.

## Consequences

- Clear opt-in: without `ai: true` nothing changes
- AI guardrails apply project-wide, not just to specific files
- Rule selection is curated across plugins (SonarJS, TypeScript-ESLint, Unicorn, etc.)
- Can be selectively enabled in CI for AI-generated PRs
