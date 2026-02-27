import type { Linter } from "eslint"

import type {
  FlatConfigArray,
  RuleOptions,
  RuleSeverity,
} from "../types"

const CONFIG_PREFIX = "@effective/eslint/"

/** Maps user-facing scope names to config block name segments. */
const SCOPE_TO_BLOCK: Record<string, string> = {
  configs: "config-files",
}

/**
 * Check if a config block matches a given scope.
 * A block matches if its name is `@effective/eslint/{segment}` or starts with `@effective/eslint/{segment}-`.
 */
function blockMatchesScope(
  block: Linter.Config,
  scope: string,
): boolean {
  const name = block.name
  if (!name) return false
  const segment = SCOPE_TO_BLOCK[scope] ?? scope
  const target = `${CONFIG_PREFIX}${segment}`
  return name === target || name.startsWith(`${target}-`)
}

/**
 * Change the severity of a rule across all config blocks, preserving options.
 */
export function setRuleSeverity(
  config: FlatConfigArray,
  ruleName: string,
  severity: RuleSeverity,
  options?: RuleOptions,
): void {
  for (const block of config) {
    if (options?.scope && !blockMatchesScope(block, options.scope)) continue
    if (!block.rules?.[ruleName]) continue

    const current = block.rules[ruleName]
    if (Array.isArray(current)) {
      block.rules[ruleName] = [severity, ...current.slice(1)] as Linter.RuleEntry
    } else {
      block.rules[ruleName] = severity
    }
  }
}

/**
 * Update the options of a rule across all config blocks, preserving severity.
 */
export function configureRule(
  config: FlatConfigArray,
  ruleName: string,
  options: unknown[],
  ruleOptions?: RuleOptions,
): void {
  for (const block of config) {
    if (ruleOptions?.scope && !blockMatchesScope(block, ruleOptions.scope))
      continue
    if (!block.rules?.[ruleName]) continue

    const current = block.rules[ruleName]
    const severity = Array.isArray(current) ? current[0] : current
    block.rules[ruleName] = [severity, ...options] as Linter.RuleEntry
  }
}

/**
 * Completely disable a rule across all config blocks.
 * With scope: disables in the first matching block (creates entry if needed).
 */
export function disableRule(
  config: FlatConfigArray,
  ruleName: string,
  options?: RuleOptions,
): void {
  if (options?.scope) {
    const block = config.find((b) => blockMatchesScope(b, options.scope!))
    if (!block) return
    block.rules ??= {}
    block.rules[ruleName] = "off"
    return
  }

  for (const block of config) {
    if (!block.rules?.[ruleName]) continue
    block.rules[ruleName] = "off"
  }
}

/**
 * Add a new rule to the first (base) config block.
 * With scope: adds to the first matching block instead.
 */
export function addRule(
  config: FlatConfigArray,
  ruleName: string,
  severity: RuleSeverity,
  options?: unknown[] | RuleOptions,
  ruleOptions?: RuleOptions,
): void {
  // Handle overloaded signatures: addRule(config, rule, severity, options?, ruleOptions?)
  // When options is a plain object with scope, it's actually ruleOptions
  let ruleOpts: unknown[] | undefined
  let scopeOpts: RuleOptions | undefined

  if (Array.isArray(options)) {
    ruleOpts = options
    scopeOpts = ruleOptions
  } else if (options && typeof options === "object" && "scope" in options) {
    scopeOpts = options as RuleOptions
  } else if (options === undefined) {
    scopeOpts = ruleOptions
  }

  let target: Linter.Config | undefined
  if (scopeOpts?.scope) {
    target = config.find((b) => blockMatchesScope(b, scopeOpts!.scope!))
  } else {
    target = config[0]
  }

  if (!target) return

  target.rules ??= {}
  target.rules[ruleName] = ruleOpts
    ? ([severity, ...ruleOpts] as Linter.RuleEntry)
    : severity
}

/**
 * Disable all rules except the specified one — useful for debugging.
 */
export function disableAllRulesBut(
  config: FlatConfigArray,
  keepRuleName: string,
): void {
  for (const block of config) {
    if (!block.rules) continue
    for (const ruleName of Object.keys(block.rules)) {
      if (ruleName !== keepRuleName) {
        block.rules[ruleName] = "off"
      }
    }
  }
}
