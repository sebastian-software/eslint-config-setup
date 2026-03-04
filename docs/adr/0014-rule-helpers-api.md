# ADR-0014: Rule-Helpers API for Consumer Customization

Status: Accepted
Date: 2026-03-02

## Context

Pre-built configs (ADR-0001) are generated at build time and shipped as static modules. Consumers cannot modify individual rules without either forking the package or manually overriding entire config blocks. A post-load modification API is needed.

## Decision

Export five rule-helper functions as the public customization API:

- `setRuleSeverity(config, rule, severity, scope?)` — change severity, preserve options
- `configureRule(config, rule, options, scope?)` — update options, preserve severity
- `disableRule(config, rule, scope?)` — turn a rule off
- `addRule(config, rule, severity, options?, scope?)` — add a new rule
- `disableAllRulesBut(config, rule)` — isolate a single rule for debugging

All helpers accept an optional `scope` parameter (`"tests"`, `"e2e"`, `"stories"`, `"configs"`, `"scripts"`, `"declarations"`) to target specific file-pattern blocks by their `name` field.

## Consequences

- Consumers can customize pre-built configs without regenerating the package
- Scope-aware targeting enables fine-grained control (e.g. disable a rule only in tests)
- Block matching relies on the `eslint-config-setup/` name prefix convention
- Helpers mutate the config array in place — no immutability guarantees
