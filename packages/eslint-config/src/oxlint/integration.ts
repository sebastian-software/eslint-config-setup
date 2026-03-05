import oxlintPlugin from "eslint-plugin-oxlint"

import type { ConfigOptions, FlatConfig, FlatConfigArray } from "../types"

/**
 * Appends eslint-plugin-oxlint configs that disable all ESLint rules
 * already covered by OxLint. Must be the LAST config in the array.
 *
 * This allows running `oxlint && eslint` where OxLint handles the fast
 * checks and ESLint only runs type-aware and specialty rules.
 */
export function oxlintIntegration(opts: ConfigOptions): FlatConfigArray {
  const typedPlugin = oxlintPlugin as unknown as {
    configs: Record<string, FlatConfig | FlatConfig[]>
  }

  const configs: FlatConfigArray = []

  const add = (configName: string, blockName: string): void => {
    const raw = typedPlugin.configs[configName]
    const items = Array.isArray(raw) ? raw : [raw]
    for (const item of items) {
      configs.push({ name: `eslint-config-setup/${blockName}`, ...item })
    }
  }

  add("flat/recommended", "oxlint")

  // Add plugin-specific oxlint overrides if those plugins are active
  if (opts.react) {
    add("flat/react", "oxlint-react")
    add("flat/jsx-a11y", "oxlint-jsx-a11y")
  }

  if (opts.node) {
    add("flat/node", "oxlint-node")
  }

  // TypeScript and unicorn overlaps
  add("flat/typescript", "oxlint-typescript")
  add("flat/unicorn", "oxlint-unicorn")
  add("flat/import", "oxlint-import")
  add("flat/jsdoc", "oxlint-jsdoc")

  return configs
}
