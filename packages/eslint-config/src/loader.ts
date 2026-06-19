/* eslint-disable security/detect-non-literal-fs-filename, @typescript-eslint/no-unsafe-type-assertion -- Paths are computed from deterministic hashes in dist/, not from user input. */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

import type { ConfigOptions, FlatConfigArray, OxlintConfigOptions, OxlintConfigResult } from "./types"

import { optionsToFilename, oxlintOptionsToFilename } from "./hash"

/**
 * Loads a pre-generated ESLint config by dynamically importing the hashed file.
 * The hash is computed from the options using the same algorithm as the build.
 */
export async function getEslintConfig(
  opts: ConfigOptions = {},
): Promise<FlatConfigArray> {
  const filename = optionsToFilename(opts)
  const dirname = import.meta.dirname
  const configPath = path.join(dirname, "configs", filename)

  if (!existsSync(configPath)) {
    throw new Error(
      `eslint-config-setup: No pre-generated config found for options ${JSON.stringify(opts)}. ` +
        `Expected file: configs/${filename}. Run "npm run generate" in the package to build configs.`,
    )
  }

  const configUrl = pathToFileURL(configPath)
  configUrl.search = String(Date.now())

  try {
    const module = (await import(
      /* webpackIgnore: true */
      configUrl.href
    )) as { default: FlatConfigArray }
    return module.default
  } catch (error) {
    throw new Error(
      `eslint-config-setup: Pre-generated config failed to load for options ${JSON.stringify(opts)}. ` +
        `Expected file: configs/${filename}. Original error: ${getErrorMessage(error)}`,
      { cause: error },
    )
  }
}

/**
 * Loads a pre-generated OxLint config from the hashed JSON file.
 * Only `react`, `node`, and `ai` flags are relevant — `oxlint` is ignored.
 */
export function getOxlintConfig(
  opts: OxlintConfigOptions = {},
): OxlintConfigResult {
  const filename = oxlintOptionsToFilename(opts)
  const dirname = import.meta.dirname
  const configPath = path.join(dirname, "oxlint-configs", filename)

  try {
    const content = readFileSync(configPath, "utf8")
    return JSON.parse(content) as OxlintConfigResult
  } catch {
    throw new Error(
      `eslint-config-setup: No pre-generated OxLint config found for options ${JSON.stringify(opts)}. ` +
        `Expected file: oxlint-configs/${filename}. Run "npm run generate" in the package to build configs.`,
    )
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
