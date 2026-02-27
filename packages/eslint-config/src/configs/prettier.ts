import prettierConfig from "eslint-config-prettier"

import { createConfig } from "../build/config-builder"
import type { FlatConfigArray } from "../types"

/**
 * Prettier compat config — disables all ESLint rules that conflict with Prettier.
 * Must be the last config block (before OxLint if enabled).
 *
 * Preset: eslint-config-prettier (turns off ~30 formatting rules)
 * @see https://github.com/prettier/eslint-config-prettier#readme
 */
export function prettierCompatConfig(): FlatConfigArray {
  return createConfig({
    name: "@effective/eslint/prettier",
    presets: [prettierConfig],
  }).build()
}
