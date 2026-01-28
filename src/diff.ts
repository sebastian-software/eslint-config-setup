import { ESLint, Linter } from "eslint"
import { ConfigWithModuleRefs } from "./generator"

export function diffLintConfig(
  config: ConfigWithModuleRefs,
  otherConfig: ConfigWithModuleRefs
): ConfigWithModuleRefs | null {
  const diff: ConfigWithModuleRefs = {}

  // Compare rules
  if (config.rules || otherConfig.rules) {
    const allRules = new Set([
      ...Object.keys(config.rules || {}),
      ...Object.keys(otherConfig.rules || {})
    ])

    for (const rule of allRules) {
      const oldRule = config.rules?.[rule]
      const newRule = otherConfig.rules?.[rule]

      if (JSON.stringify(oldRule) !== JSON.stringify(newRule)) {
        if (!diff.rules) {
          diff.rules = {}
        }

        diff.rules[rule] = newRule
      }
    }
  }

  // Compare settings
  if (config.settings || otherConfig.settings) {
    const allSettings = new Set([
      ...Object.keys(config.settings || {}),
      ...Object.keys(otherConfig.settings || {})
    ])

    for (const setting of allSettings) {
      const oldSetting = config.settings?.[setting]
      const newSetting = otherConfig.settings?.[setting]

      if (JSON.stringify(oldSetting) !== JSON.stringify(newSetting)) {
        if (!diff.settings) {
          diff.settings = {}
        }

        diff.settings[setting] = newSetting
      }
    }
  }

  // Compare language options
  if (otherConfig.languageOptions) {
    const oldLang = config.languageOptions
    const newLang = otherConfig.languageOptions
    for (const option of Object.keys(newLang) as Array<keyof typeof newLang>) {
      if (
        JSON.stringify(oldLang?.[option]) !== JSON.stringify(newLang[option])
      ) {
        if (!diff.languageOptions) {
          diff.languageOptions = {}
        }

        const value = newLang[option]
        if (value !== undefined) {
          diff.languageOptions[option] = value
        }
      }
    }
  }

  // Compare linter options
  if (otherConfig.linterOptions) {
    const oldLinter = config.linterOptions || ({} as Linter.LinterOptions)
    const newLinter = otherConfig.linterOptions

    for (const option of Object.keys(newLinter) as Array<
      keyof typeof newLinter
    >) {
      if (
        JSON.stringify(oldLinter[option]) !== JSON.stringify(newLinter[option])
      ) {
        if (!diff.linterOptions) {
          diff.linterOptions = {}
        }
        const value = newLinter[option]
        if (value !== undefined) {
          ;(diff.linterOptions[option] as unknown) = value
        }
      }
    }
  }

  // Compare plugins - only include new or different plugins
  if (otherConfig.plugins) {
    const newPlugins: Record<string, string> = {}
    let hasNewPlugins = false

    for (const [name, plugin] of Object.entries(otherConfig.plugins)) {
      if (!config.plugins?.[name]) {
        newPlugins[name] = plugin
        hasNewPlugins = true
      }
    }

    if (hasNewPlugins) {
      diff.plugins = newPlugins
    }
  }

  if (Object.keys(diff).length === 0) {
    return null
  }

  return diff
}
