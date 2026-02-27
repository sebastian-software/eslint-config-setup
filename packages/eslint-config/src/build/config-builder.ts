import type { Linter } from "eslint"

import type { FlatConfig, FlatConfigArray } from "../types"

type RuleValue = Linter.RuleEntry

interface ConfigBuilderOptions {
  name: string
  presets?: FlatConfig[]
  passthrough?: FlatConfigArray
  plugins?: Record<string, unknown>
  languageOptions?: FlatConfig["languageOptions"]
  settings?: FlatConfig["settings"]
  files?: FlatConfig["files"]
  ignores?: FlatConfig["ignores"]
}

interface ConfigBuilder {
  /** Override an existing preset rule. THROWS if rule not in preset. */
  overrideRule(name: string, value: RuleValue): ConfigBuilder
  /** Add a new rule. THROWS if rule already exists in preset or was already added. */
  addRule(name: string, value: RuleValue): ConfigBuilder
  /** Disable an existing preset rule (set to "off"). THROWS if not found. */
  disableRule(name: string): ConfigBuilder
  /** Remove a rule entirely from output. THROWS if not found. */
  removeRule(name: string): ConfigBuilder
  /** Add an extra output block with specific files and rules (not validated against preset). */
  addFileOverride(
    name: string,
    files: string[],
    rules: Partial<Linter.RulesRecord>,
  ): ConfigBuilder
  /** Materialize into FlatConfigArray. */
  build(): FlatConfigArray
}

export function createConfig(options: ConfigBuilderOptions): ConfigBuilder {
  // Expand presets: merge all rules from preset objects into one map
  const presetRules = new Map<string, RuleValue>()
  const presetPlugins: Record<string, unknown> = {}

  if (options.presets) {
    for (const preset of options.presets) {
      if (preset.plugins) {
        Object.assign(presetPlugins, preset.plugins)
      }
      if (preset.rules) {
        for (const [name, value] of Object.entries(preset.rules)) {
          if (value !== undefined) {
            presetRules.set(name, value)
          }
        }
      }
    }
  }

  // Mutable builder state
  const overrides = new Map<string, RuleValue>()
  const additions = new Map<string, RuleValue>()
  const disabled = new Set<string>()
  const removed = new Set<string>()
  const fileOverrides: Array<{
    name: string
    files: string[]
    rules: Partial<Linter.RulesRecord>
  }> = []

  const builder: ConfigBuilder = {
    overrideRule(name: string, value: RuleValue): ConfigBuilder {
      if (!presetRules.has(name)) {
        throw new Error(
          `overrideRule("${name}"): rule not found in preset. ` +
            `Cannot override a rule that doesn't exist in the preset.`,
        )
      }
      overrides.set(name, value)
      return builder
    },

    addRule(name: string, value: RuleValue): ConfigBuilder {
      if (presetRules.has(name)) {
        throw new Error(
          `addRule("${name}"): rule already exists in preset. ` +
            `Use overrideRule() to change its value, or removeRule() to drop it.`,
        )
      }
      if (additions.has(name)) {
        throw new Error(
          `addRule("${name}"): rule was already added. ` +
            `Each rule can only be added once.`,
        )
      }
      additions.set(name, value)
      return builder
    },

    disableRule(name: string): ConfigBuilder {
      if (!presetRules.has(name) && !additions.has(name)) {
        throw new Error(
          `disableRule("${name}"): rule not found in preset or additions. ` +
            `Cannot disable a rule that doesn't exist.`,
        )
      }
      disabled.add(name)
      return builder
    },

    removeRule(name: string): ConfigBuilder {
      if (!presetRules.has(name) && !additions.has(name)) {
        throw new Error(
          `removeRule("${name}"): rule not found in preset or additions. ` +
            `Cannot remove a rule that doesn't exist.`,
        )
      }
      removed.add(name)
      return builder
    },

    addFileOverride(
      name: string,
      files: string[],
      rules: Partial<Linter.RulesRecord>,
    ): ConfigBuilder {
      fileOverrides.push({ name, files, rules })
      return builder
    },

    build(): FlatConfigArray {
      // Start with all preset rules
      const rules: Linter.RulesRecord = {}
      for (const [name, value] of presetRules) {
        if (!removed.has(name)) {
          rules[name] = value
        }
      }

      // Apply overrides
      for (const [name, value] of overrides) {
        if (!removed.has(name)) {
          rules[name] = value
        }
      }

      // Apply additions
      for (const [name, value] of additions) {
        if (!removed.has(name)) {
          rules[name] = value
        }
      }

      // Apply disabled
      for (const name of disabled) {
        if (!removed.has(name)) {
          rules[name] = "off"
        }
      }

      // Build the main config block
      const mainBlock: FlatConfig = {
        name: options.name,
        rules,
      }

      // Merge plugins from preset + user
      const mergedPlugins = { ...presetPlugins, ...options.plugins }
      if (Object.keys(mergedPlugins).length > 0) {
        mainBlock.plugins = mergedPlugins
      }

      if (options.languageOptions) {
        mainBlock.languageOptions = options.languageOptions
      }
      if (options.settings) {
        mainBlock.settings = options.settings
      }
      if (options.files) {
        mainBlock.files = options.files
      }
      if (options.ignores) {
        mainBlock.ignores = options.ignores
      }

      const result: FlatConfigArray = []

      // Passthrough blocks first
      if (options.passthrough) {
        result.push(...options.passthrough)
      }

      // Main validated block
      result.push(mainBlock)

      // File override blocks
      for (const fo of fileOverrides) {
        result.push({
          name: fo.name,
          files: fo.files,
          rules: fo.rules as Linter.RulesRecord,
        })
      }

      return result
    },
  }

  return builder
}
