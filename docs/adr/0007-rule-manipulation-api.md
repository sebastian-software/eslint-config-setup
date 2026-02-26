# ADR-0007: Runtime Rule Manipulation API

## Status

Accepted

## Date

2026-02-27

## Context

Pre-generated configs are static. But real-world projects often need to tweak individual rules:

- Disable a rule the team disagrees with (`unicorn/no-null`)
- Downgrade a rule to warning during migration (`no-console`)
- Tighten a limit beyond the preset (`complexity: 5`)
- Add a project-specific rule from a custom plugin

ESLint flat config makes this harder than it sounds. A single rule like `complexity` may appear in multiple config blocks (base complexity preset, AI complexity override, test file relaxation). Manually finding and modifying all occurrences is error-prone.

## Decision

We provide a set of **in-place mutation helpers** that operate on the loaded config array:

```typescript
setRuleSeverity(config, "complexity", "warn")     // Changes severity, preserves options
configureRule(config, "complexity", [20])           // Changes options, preserves severity
disableRule(config, "unicorn/no-null")              // Sets to "off" in all blocks
addRule(config, "no-alert", "error")                // Adds to first block
disableAllRulesBut(config, "complexity")            // Debug helper
```

Key design decisions:

1. **Operate on all blocks.** `setRuleSeverity` and `disableRule` iterate all config blocks, not just the first. This ensures the rule is consistently modified even when it appears in multiple blocks.

2. **Preserve what you don't change.** `setRuleSeverity` preserves rule options. `configureRule` preserves severity. This prevents accidentally losing complex configurations like `naming-convention`'s multi-entry options.

3. **Mutate in place.** The config array is modified directly, not copied. This keeps the API simple and avoids confusion about which array to export.

4. **`addRule` only affects the first block.** New rules are added to the base config block. This is the safest default — it ensures the rule applies globally but can be overridden by later blocks.

## Consequences

### Positive

- **Simple API.** Five functions cover all common customization needs.
- **Safe.** Preserving options when changing severity (and vice versa) prevents accidental breakage of complex rule configurations.
- **Multi-block aware.** Users don't need to know the internal structure of the config array.
- **Composable.** Multiple operations can be chained: disable one rule, change another's severity, add a third.

### Negative

- **Mutation.** In-place mutation can be surprising in functional codebases. Mitigated by the convention of calling helpers right after `getConfig()` and before exporting.
- **Limited targeting.** You can't change a rule's severity only in test files. For that, users must use the modular API or add a manual override block.
- **No validation.** The helpers don't check if a rule name is valid or if the plugin is loaded. Invalid rule names silently do nothing.

### Usage Pattern

```typescript
// eslint.config.ts
import { getConfig, disableRule, setRuleSeverity } from "@effective/eslint-config"

const config = await getConfig({ react: true, ai: true })

// Team-specific tweaks
disableRule(config, "unicorn/no-null")           // We use null in our codebase
setRuleSeverity(config, "no-console", "warn")    // Migrating away from console.log

export default config
```
