/* eslint-disable security/detect-non-literal-fs-filename, @typescript-eslint/no-unsafe-type-assertion -- Paths are computed from deterministic hashes in dist/, not from user input. */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

import type {
  ConfigFlags,
  ConfigOptions,
  FlatConfigArray,
  OxlintConfigOptions,
  OxlintConfigResult,
} from "./types"

import { applySpellcheckOptions, assertSpellcheckOption } from "./api/spellcheck"
import { optionsToFilename, oxlintOptionsToFilename } from "./hash"

/**
 * Build-time flag keys printed verbatim in error messages. Typed as a
 * `Record` over `ConfigFlags`, so adding a flag without listing it here fails
 * to type-check and no flag silently disappears from error messages.
 */
const FLAG_KEY_SET: Record<keyof ConfigFlags, true> = {
  react: true,
  node: true,
  ai: true,
  oxlint: true,
}
const FLAG_KEYS = Object.keys(FLAG_KEY_SET) as Array<keyof ConfigFlags>

/**
 * Loads a pre-generated ESLint config by dynamically importing the hashed file.
 * The hash is computed from the options using the same algorithm as the build.
 * The `spellcheck` option does not select a file; it is applied to the loaded
 * config afterwards.
 */
export async function getEslintConfig(
  opts: ConfigOptions = {},
): Promise<FlatConfigArray> {
  assertSpellcheckOption(opts.spellcheck)

  const filename = optionsToFilename(opts)
  const dirname = import.meta.dirname
  const configPath = path.join(dirname, "configs", filename)

  if (!existsSync(configPath)) {
    throwMissingConfigError(opts, filename)
  }

  const loaded = await importGeneratedConfig(opts, filename, configPath)

  // Outside the import try/catch: transform errors are not config load failures.
  return applySpellcheckOptions(loaded, opts.spellcheck)
}

/** Imports the hashed config module, translating failures into descriptive errors. */
async function importGeneratedConfig(
  opts: ConfigOptions,
  filename: string,
  configPath: string,
): Promise<FlatConfigArray> {
  const configUrl = pathToFileURL(configPath)
  configUrl.search = String(Date.now())

  try {
    const module = (await import(
      /* webpackIgnore: true */
      configUrl.href
    )) as { default: FlatConfigArray }
    return module.default
  } catch (error) {
    if (!existsSync(configPath)) {
      throwMissingConfigError(opts, filename, error)
    }

    throw new Error(
      `eslint-config-setup: Pre-generated config failed to load for options ${formatOptions(opts)}. ` +
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
      `eslint-config-setup: No pre-generated OxLint config found for options ${formatOptions(opts)}. ` +
        `Expected file: oxlint-configs/${filename}. Run "npm run generate" in the package to build configs.`,
    )
  }
}

/**
 * Formats options for error messages without leaking user-supplied values:
 * prints only the known flag keys, a boolean `spellcheck` as is and the
 * object form as `"<configured>"`.
 */
function formatOptions(opts: ConfigOptions): string {
  const printable: Record<string, unknown> = {}
  for (const key of FLAG_KEYS) {
    if (opts[key] !== undefined) printable[key] = opts[key]
  }
  if (opts.spellcheck !== undefined) {
    printable.spellcheck = typeof opts.spellcheck === "boolean" ? opts.spellcheck : "<configured>"
  }
  return JSON.stringify(printable)
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function throwMissingConfigError(
  opts: ConfigOptions,
  filename: string,
  cause?: unknown,
): never {
  const message =
    `eslint-config-setup: No pre-generated config found for options ${formatOptions(opts)}. ` +
    `Expected file: configs/${filename}. Run "npm run generate" in the package to build configs.`

  if (cause === undefined) {
    throw new Error(message)
  }

  throw new Error(message, { cause })
}
