import { fileURLToPath } from "node:url"
import path from "node:path"

import { optionsToFilename } from "./hash"
import type { ConfigOptions, FlatConfigArray } from "./types"

/**
 * Loads a pre-generated config by dynamically importing the hashed file.
 * The hash is computed from the options using the same algorithm as the build.
 */
export async function getConfig(
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
