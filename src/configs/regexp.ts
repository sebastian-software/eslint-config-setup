import regexpPlugin from "eslint-plugin-regexp"

import type { FlatConfigArray } from "../types.ts"

/**
 * RegExp config — uses the full `flat/recommended` preset from eslint-plugin-regexp.
 * Validates regular expression syntax, detects common mistakes, and suggests
 * simpler patterns.
 *
 * Preset: eslint-plugin-regexp flat/recommended (all rules at their default severity)
 * @see https://ota-meshi.github.io/eslint-plugin-regexp/
 * @see https://ota-meshi.github.io/eslint-plugin-regexp/rules/
 */
export function regexpConfig(): FlatConfigArray {
  return [
    {
      ...regexpPlugin.configs["flat/recommended"],
      name: "@effective/eslint/regexp",
    },
  ]
}
