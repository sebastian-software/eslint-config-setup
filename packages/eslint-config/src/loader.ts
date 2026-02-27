import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { optionsToFilename, oxlintOptionsToFilename } from "./hash"
import type { ConfigOptions, FlatConfigArray, OxlintConfigOptions } from "./types"

/**
 * Loads a pre-generated ESLint config by dynamically importing the hashed file.
 * The hash is computed from the options using the same algorithm as the build.
 */
export async function getEslintConfig(
  opts: ConfigOptions = {},
): Promise<FlatConfigArray> {
  const filename = optionsToFilename(opts)
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const configPath = path.join(dirname, "configs", filename)

  try {
    const module = (await import(
      /* webpackIgnore: true */
      `${configPath}?${Date.now()}`
    )) as { default: FlatConfigArray }
    return [...module.default]
  } catch {
    throw new Error(
      `@effective/eslint-config: No pre-generated config found for options ${JSON.stringify(opts)}. ` +
        `Expected file: configs/${filename}. Run "npm run generate" in the package to build configs.`,
    )
  }
}

/**
 * Loads a pre-generated OxLint config from the hashed JSON file.
 * Only `react`, `node`, and `ai` flags are relevant — `oxlint` is ignored.
 */
export async function getOxlintConfig(
  opts: OxlintConfigOptions = {},
): Promise<unknown> {
  const filename = oxlintOptionsToFilename(opts)
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const configPath = path.join(dirname, "oxlint-configs", filename)

  try {
    const content = readFileSync(configPath, "utf-8")
    return JSON.parse(content) as unknown
  } catch {
    throw new Error(
      `@effective/eslint-config: No pre-generated OxLint config found for options ${JSON.stringify(opts)}. ` +
        `Expected file: oxlint-configs/${filename}. Run "npm run generate" in the package to build configs.`,
    )
  }
}
