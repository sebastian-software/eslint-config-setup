---
title: Helper Functions
---

# Helper Functions

The config is yours to customize. We provide helper functions that make ESLint rule manipulation straightforward.

## `setRuleSeverity(config, ruleName, severity)`

Change a rule's severity while **preserving its configuration**. This is surprisingly hard to do in ESLint normally — you'd have to copy all the rule's options manually. This function handles it:

```typescript
import { getConfig, setRuleSeverity } from "eslint-config-setup"

const config = await getConfig({ strict: true })

// The rule keeps its configured options, only severity changes
setRuleSeverity(config, "@typescript-eslint/no-unused-vars", "warn")
setRuleSeverity(config, "complexity", "off")
```

::: tip Why this matters
In ESLint, a rule like `no-unused-vars` has detailed configuration (which patterns to ignore, how to handle destructuring, etc.). If you just want to downgrade it from "error" to "warn", you'd normally have to re-specify the entire configuration. `setRuleSeverity` does this for you.
:::

## `configureRule(config, ruleName, options)`

Update a rule's options while keeping its severity:

```typescript
configureRule(config, "max-lines-per-function", [{ max: 80 }])
configureRule(config, "complexity", [{ max: 15 }])
```

## `disableRule(config, ruleName)`

Remove a rule entirely:

```typescript
disableRule(config, "sonarjs/no-duplicate-string")
```

## `addRule(config, ruleName, severity, options?)`

Add a rule that isn't in the config:

```typescript
addRule(config, "no-console", "error")
addRule(config, "max-len", "warn", [{ code: 120 }])
```

## `disableAllRulesBut(config, ruleName)`

Focus on a single rule. Useful for debugging when you want to isolate a specific rule's behavior:

```typescript
disableAllRulesBut(config, "@typescript-eslint/no-floating-promises")
```
