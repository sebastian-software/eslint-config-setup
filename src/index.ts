import { Linter } from "eslint"
import { resolve } from "path"

import {
  ConfigName,
  getConfigObject,
  numberToShortHash,
  Options,
  optionsToNumber
} from "./util.js"

/**
 * Loads an ESLint configuration based on the provided options.
 *
 * @param options - The configuration options
 * @returns The loaded ESLint configuration
 */
export async function getConfig(options: Options): Promise<Linter.Config[]> {
  const num = optionsToNumber(options)
  const hash = numberToShortHash(num)

  const __dirname = import.meta.dirname

  // Make sure that we are in "dist" folder and not in "src".
  const configPath = resolve(__dirname, "..", "dist", "configs", `${hash}.js`)

  console.log(`>>> Config: ${hash}; Options: ${Object.keys(options)}`)

  // Users might modify the module by adding rules, changing settings etc.
  // Due to the module cache we will receive a modified file when not using a
  // cache buster with e.g. Date.now() here.
  const module = (await import(`${configPath}?${Date.now()}`)) as {
    default: Linter.Config[]
  }
  return module.default
}

/**
 * Changes the severity of a specific ESLint rule in the configuration.
 *
 * @param config - The ESLint configuration array
 * @param ruleName - The name of the rule to modify
 * @param severity - The new severity level
 * @throws When the config has no rules or the rule is not configured
 */
export function setRuleSeverity(
  config: Linter.Config[],
  ruleName: string,
  severity: "error" | "warn" | "off",
  objectName?: ConfigName
) {
  const obj = getConfigObject(config, objectName)
  if (!obj.rules) {
    throw new Error(`Config ${objectName} has no rules!`)
  }

  const ruleConfig = obj.rules[ruleName]
  if (ruleConfig == null) {
    throw new Error(`Rule ${ruleName} is not configured!`)
  }

  if (Array.isArray(ruleConfig)) {
    ruleConfig[0] = severity
  } else {
    obj.rules[ruleName] = severity
  }
}

/**
 * Configures a specific ESLint rule in the configuration with its severity and optional parameters.
 * Unlike setRuleSeverity, this method preserves the existing severity level while allowing to update
 * the rule's options.
 *
 * @param config - The ESLint configuration array
 * @param ruleName - The name of the rule to configure
 * @param options - Optional array of configuration options for the rule
 * @throws When the config has no rules or the rule is not configured
 */
export function configureRule(
  config: Linter.Config[],
  ruleName: string,
  objectName?: ConfigName,
  options?: unknown[]
) {
  const obj = getConfigObject(config, objectName)
  if (!obj.rules) {
    throw new Error(`Config ${objectName} has no rules!`)
  }

  const ruleConfig = obj.rules[ruleName]
  if (ruleConfig == null) {
    throw new Error(`Rule ${ruleName} is not configured!`)
  }

  const severity = Array.isArray(ruleConfig) ? ruleConfig[0] : ruleConfig

  if (options && options.length > 0) {
    obj.rules[ruleName] = [severity, ...options]
  } else {
    obj.rules[ruleName] = severity
  }
}

/**
 * Disables a specific ESLint rule in the configuration by removing it.
 *
 * @param config - The ESLint configuration array
 * @param ruleName - The name of the rule to disable
 * @throws When the config has no rules or the rule is not configured
 */
export function disableRule(
  config: Linter.Config[],
  ruleName: string,
  objectName?: ConfigName
) {
  const obj = getConfigObject(config, objectName)
  if (!obj.rules) {
    throw new Error(`Config ${objectName} has no rules!`)
  }

  const ruleConfig = obj.rules[ruleName]
  if (ruleConfig == null) {
    throw new Error(`Rule ${ruleName} is not configured!`)
  }

  delete obj.rules[ruleName]
}

/**
 * Adds a new ESLint rule to the configuration with specified severity and options.
 *
 * @param config - The ESLint configuration array
 * @param ruleName - The name of the rule to add
 * @param severity - The severity level for the rule
 * @param objectName - The name of the config object to add the rule to
 * @param options - Additional options for the rule configuration
 * @throws When the config has no rules or the rule is already configured
 */
export function addRule(
  config: Linter.Config[],
  ruleName: string,
  severity: "warn" | "error",
  objectName?: ConfigName,
  options?: unknown[]
) {
  const obj = getConfigObject(config, objectName)
  if (!obj.rules) {
    throw new Error(`Config ${objectName} has no rules!`)
  }

  const ruleConfig = obj.rules[ruleName]
  if (ruleConfig != null) {
    throw new Error(`Rule ${ruleName} is already configured!`)
  }

  if (options) {
    obj.rules[ruleName] = [severity, ...options]
  } else {
    obj.rules[ruleName] = severity
  }
}

/**
 * Disables all rules except the one specified. Useful for focusing on a single rule for debugging.
 *
 * @param config - The ESLint configuration array
 * @param ruleName - The name of the rule to keep enabled
 * @param objectName - The name of the config object to disable all rules foräö--------
 * @throws When the config has no rules
 */
export function disableAllRulesBut(
  config: Linter.Config[],
  ruleName: string,
  objectName?: ConfigName
) {
  const obj = getConfigObject(config, objectName)
  if (!obj.rules) {
    throw new Error(`Config ${objectName} has no rules!`)
  }

  for (const key in obj.rules) {
    if (key !== ruleName) {
      obj.rules[key] = "off"
    }
  }
}
