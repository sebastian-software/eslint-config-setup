import prettierConfig from "eslint-config-prettier"

import type { FlatConfigArray } from "../types.ts"

/**
 * Prettier compat config — disables all ESLint rules that conflict with Prettier.
 * Must be the last config block (before OxLint if enabled).
 *
 * Preset: eslint-config-prettier (turns off ~30 formatting rules)
 * @see https://github.com/prettier/eslint-config-prettier#readme
 */
export function prettierCompatConfig(): FlatConfigArray {
  return [
    {
      ...prettierConfig,
      name: "@effective/eslint/prettier",
    },
  ]
}
