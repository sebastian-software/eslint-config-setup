# ADR-0018: CSpell Integration for Spell Checking

Status: Accepted
Date: 2026-03-02

## Context

Typos in variable names, function names, and comments create confusing APIs and misleading documentation. Traditional spell checkers operate on prose text, not code. Catching typos in identifiers requires a tool that understands camelCase, PascalCase, and code structure.

## Decision

Integrate `@cspell/eslint-plugin` as an always-active config. Spell checking is enabled for identifiers and comments but disabled for strings (which may contain user-facing text, URLs, or domain-specific content).

Severity is set to `warn` (not `error`) because dictionary misses are common for domain-specific terms. Auto-fix is disabled — spelling corrections require human review. Projects can extend the dictionary via a `cspell.json` file.

## Consequences

- Typos in API names and documentation are caught during linting
- Warn severity avoids blocking CI on legitimate domain terms
- Projects with specialized vocabulary need a custom `cspell.json` dictionary
- No auto-fix: developers must review and correct spelling manually
- Always active regardless of flags — spell checking applies to all projects
