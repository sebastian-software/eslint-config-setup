import type { Linter } from "eslint"

import type { FlatConfigArray, RuleSeverity } from "../types.ts"

/**
 * Change the severity of a rule across all config blocks, preserving options.
 */
export function setRuleSeverity(
  config: FlatConfigArray,
  ruleName: string,
  severity: RuleSeverity,
): void {
  for (const block of config) {
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
): void {
  for (const block of config) {
    if (!block.rules?.[ruleName]) continue

    const current = block.rules[ruleName]
    const severity = Array.isArray(current) ? current[0] : current
    block.rules[ruleName] = [severity, ...options] as Linter.RuleEntry
  }
}

/**
 * Completely disable a rule across all config blocks.
 */
export function disableRule(
  config: FlatConfigArray,
  ruleName: string,
): void {
  for (const block of config) {
    if (!block.rules?.[ruleName]) continue
    block.rules[ruleName] = "off"
  }
}

/**
 * Add a new rule to the first (base) config block.
 */
export function addRule(
  config: FlatConfigArray,
  ruleName: string,
  severity: RuleSeverity,
  options?: unknown[],
): void {
  const base = config[0]
  if (!base) return

  base.rules ??= {}
  base.rules[ruleName] = options
    ? ([severity, ...options] as Linter.RuleEntry)
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
