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
  const typedPlugin = oxlintPlugin as {
    configs: Record<string, FlatConfig>
  }

  const configs: FlatConfigArray = [
    {
      name: "eslint-config-setup/oxlint",
      ...typedPlugin.configs["flat/recommended"],
    },
  ]

  // Add plugin-specific oxlint overrides if those plugins are active
  if (opts.react) {
    configs.push({
      name: "eslint-config-setup/oxlint-react",
      ...typedPlugin.configs["flat/react"],
    })
    configs.push({
      name: "eslint-config-setup/oxlint-jsx-a11y",
      ...typedPlugin.configs["flat/jsx-a11y"],
    })
  }

  if (opts.node) {
    configs.push({
      name: "eslint-config-setup/oxlint-node",
      ...typedPlugin.configs["flat/node"],
    })
  }

  // TypeScript and unicorn overlaps
  configs.push({
    name: "eslint-config-setup/oxlint-typescript",
    ...typedPlugin.configs["flat/typescript"],
  })
  configs.push({
    name: "eslint-config-setup/oxlint-unicorn",
    ...typedPlugin.configs["flat/unicorn"],
  })
  configs.push({
    name: "eslint-config-setup/oxlint-import",
    ...typedPlugin.configs["flat/import"],
  })
  configs.push({
    name: "eslint-config-setup/oxlint-jsdoc",
    ...typedPlugin.configs["flat/jsdoc"],
  })

  return configs
}
