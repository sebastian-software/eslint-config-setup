import type { ConfigOptions, FlatConfigArray } from "../types.ts"

/**
 * Appends eslint-plugin-oxlint configs that disable all ESLint rules
 * already covered by OxLint. Must be the LAST config in the array.
 *
 * This allows running `oxlint && eslint` where OxLint handles the fast
 * checks and ESLint only runs type-aware and specialty rules.
 */
export function oxlintIntegration(opts: ConfigOptions): FlatConfigArray {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const oxlintPlugin = require("eslint-plugin-oxlint") as {
    configs: Record<string, { rules: Record<string, string> }>
  }

  const configs: FlatConfigArray = [
    {
      name: "@effective/eslint/oxlint",
      ...oxlintPlugin.configs["flat/recommended"],
    },
  ]

  // Add plugin-specific oxlint overrides if those plugins are active
  if (opts.react) {
    configs.push({
      name: "@effective/eslint/oxlint-react",
      ...oxlintPlugin.configs["flat/react"],
    })
    configs.push({
      name: "@effective/eslint/oxlint-jsx-a11y",
      ...oxlintPlugin.configs["flat/jsx-a11y"],
    })
  }

  if (opts.node) {
    configs.push({
      name: "@effective/eslint/oxlint-node",
      ...oxlintPlugin.configs["flat/node"],
    })
  }

  // TypeScript and unicorn overlaps
  configs.push({
    name: "@effective/eslint/oxlint-typescript",
    ...oxlintPlugin.configs["flat/typescript"],
  })
  configs.push({
    name: "@effective/eslint/oxlint-unicorn",
    ...oxlintPlugin.configs["flat/unicorn"],
  })
  configs.push({
    name: "@effective/eslint/oxlint-import",
    ...oxlintPlugin.configs["flat/import"],
  })
  configs.push({
    name: "@effective/eslint/oxlint-jsdoc",
    ...oxlintPlugin.configs["flat/jsdoc"],
  })

  return configs
}
