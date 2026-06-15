import oxlintPlugin from "eslint-plugin-oxlint"

import type { ConfigOptions, FlatConfig, FlatConfigArray } from "../types"

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Typing the oxlint plugin's config shape
const typedPlugin = oxlintPlugin as unknown as {
  configs: Record<string, FlatConfig | FlatConfig[]>
}

function addOxlintConfig(
  configs: FlatConfigArray,
  configName: string,
  blockName: string,
): void {
  const raw = typedPlugin.configs[configName]
  const items = Array.isArray(raw) ? raw : [raw]
  for (const [index, item] of items.entries()) {
    const suffix = items.length > 1 ? `-${index + 1}` : ""
    configs.push({ ...item, name: `eslint-config-setup/${blockName}${suffix}` })
  }
}

function addReactOxlintConfigs(
  configs: FlatConfigArray,
  opts: ConfigOptions,
): void {
  if (!opts.react) {
    return
  }

  addOxlintConfig(configs, "flat/react", "oxlint-react")
  addOxlintConfig(configs, "flat/jsx-a11y", "oxlint-jsx-a11y")
  addOxlintConfig(configs, "flat/react-hooks", "oxlint-react-hooks")
  if (opts.ai) {
    addOxlintConfig(configs, "flat/react-perf", "oxlint-react-perf")
  }
}

/**
 * Appends eslint-plugin-oxlint configs that disable all ESLint rules
 * already covered by OxLint. Must be the LAST config in the array.
 *
 * This allows running `oxlint && eslint` where OxLint handles the fast
 * checks and ESLint only runs type-aware and specialty rules.
 */
export function oxlintIntegration(opts: ConfigOptions): FlatConfigArray {
  const configs: FlatConfigArray = []

  addOxlintConfig(configs, "flat/recommended", "oxlint")
  addReactOxlintConfigs(configs, opts)

  if (opts.node) {
    addOxlintConfig(configs, "flat/node", "oxlint-node")
  }

  // TypeScript and unicorn overlaps
  addOxlintConfig(configs, "flat/typescript", "oxlint-typescript")
  addOxlintConfig(configs, "flat/unicorn", "oxlint-unicorn")
  addOxlintConfig(configs, "flat/import", "oxlint-import")
  addOxlintConfig(configs, "flat/jsdoc", "oxlint-jsdoc")

  return configs
}
