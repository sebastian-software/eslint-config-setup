import type { Linter } from "eslint"

import { composeConfig } from "./compose.ts"
import type { ConfigOptions } from "../types.ts"

export interface OxlintConfig {
  $schema: string
  plugins: string[]
  rules: Record<string, Linter.RuleEntry>
  overrides: Array<{ files: string[]; rules: Record<string, Linter.RuleEntry> }>
}

/**
 * Map from ESLint plugin prefix to OxLint plugin name.
 * Rules without a prefix (e.g., `eqeqeq`) are core rules — no plugin needed.
 */
const prefixToPlugin: Record<string, string> = {
  "@typescript-eslint": "typescript",
  unicorn: "unicorn",
  import: "import",
  jsdoc: "jsdoc",
  react: "react",
  "react-hooks": "react",
  "jsx-a11y": "jsx-a11y",
  node: "node",
  vitest: "vitest",
  promise: "promise",
}

/** Build a Set of all rule names OxLint supports, from eslint-plugin-oxlint flat configs. */
function buildOxlintRuleIndex(): Set<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const oxlintPlugin = require("eslint-plugin-oxlint") as {
    configs: Record<string, Linter.Config | Linter.Config[]>
  }

  const supported = new Set<string>()

  for (const key of Object.keys(oxlintPlugin.configs)) {
    if (!key.startsWith("flat/")) continue

    const entries = oxlintPlugin.configs[key]
    const items = Array.isArray(entries) ? entries : [entries]

    for (const item of items) {
      if (item.rules) {
        for (const ruleName of Object.keys(item.rules)) {
          supported.add(ruleName)
        }
      }
    }
  }

  return supported
}

/** Derive the OxLint plugin name from a rule name prefix, or undefined for core rules. */
function pluginFromRule(ruleName: string): string | undefined {
  // Handle scoped plugins like @typescript-eslint/no-unused-vars
  const scopedMatch = ruleName.match(/^(@[^/]+\/[^/]+)\//)
  if (scopedMatch) {
    return prefixToPlugin[scopedMatch[1]]
  }

  const slashIndex = ruleName.indexOf("/")
  if (slashIndex === -1) return undefined

  const prefix = ruleName.substring(0, slashIndex)
  return prefixToPlugin[prefix]
}

/**
 * Generate an OxLint config (oxlintrc.json) from the same options used for ESLint.
 *
 * Composes the full ESLint config, then splits rules: those OxLint supports go
 * into the OxLint config, those it doesn't stay ESLint-only. This ensures both
 * tools enforce the same rules at the same severity.
 */
export function generateOxlintConfig(opts: ConfigOptions): OxlintConfig {
  // Compose without the oxlint flag — we want the full ruleset before disabling
  const composed = composeConfig({ ...opts, oxlint: false })
  const oxlintRuleIndex = buildOxlintRuleIndex()

  const mainRules: Record<string, Linter.RuleEntry> = {}
  const overrides: OxlintConfig["overrides"] = []
  const plugins = new Set<string>()

  for (const block of composed) {
    const rules = block.rules
    if (!rules) continue

    const hasFiles = block.files && block.files.length > 0
    const target: Record<string, Linter.RuleEntry> = {}

    for (const [eslintName, value] of Object.entries(rules)) {
      if (value === undefined) continue

      if (!oxlintRuleIndex.has(eslintName)) continue

      target[eslintName] = value as Linter.RuleEntry

      const plugin = pluginFromRule(eslintName)
      if (plugin) plugins.add(plugin)
    }

    if (Object.keys(target).length === 0) continue

    if (hasFiles) {
      const files = (block.files as string[]).flat()
      overrides.push({ files, rules: target })
    } else {
      Object.assign(mainRules, target)
    }
  }

  return {
    $schema: "./node_modules/oxlint/configuration_schema.json",
    plugins: [...plugins].sort(),
    rules: mainRules,
    overrides,
  }
}
