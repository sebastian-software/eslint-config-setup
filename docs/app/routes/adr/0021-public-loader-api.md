---
title: "ADR-0021: Public Loader API over Direct Generated Imports"
---

ADR-0021: Public Loader API over Direct Generated Imports

Status: Accepted
Date: 2026-02-27 (documented 2026-07-07)
Extends: ADR-0001, ADR-0002, ADR-0003

## Context

The package ships pre-generated config modules with deterministic hashed filenames. That keeps runtime loading fast and deterministic, but those generated files are an implementation detail:

- filenames depend on the option-to-hash contract
- generated module shape can evolve with codegen
- OxLint and ESLint configs have different option sets
- consumers need meaningful errors when a requested permutation is missing

If consumers imported generated files directly, every internal layout or hash change would become a breaking public API.

## Decision

Expose loader functions as the stable public installation API:

- `getEslintConfig(options)` for ESLint flat config arrays
- `getOxlintConfig(options)` for generated OxLint config data

Consumers select behavior with documented option flags (`react`, `node`, `ai`, `oxlint`) and never import from `dist/configs/*` or `dist/oxlint-configs/*`.

The loader owns filename calculation, module loading, missing-file errors, and import-failure diagnostics. Generated files remain inspectable output, not a supported import surface.

## Consequences

- Consumers get one stable import path even when generated internals change
- The hash algorithm stays an internal routing detail instead of user-facing setup knowledge
- Missing permutations can fail with actionable package-specific messages
- Documentation, examples, and agent guidance can teach a small API instead of generated file paths
- The loader must preserve original import failures clearly, because plugin/runtime errors otherwise look like missing generated files
