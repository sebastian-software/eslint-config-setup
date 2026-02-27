import regexpPlugin from "eslint-plugin-regexp"

import { createConfig } from "../build/config-builder"
import type { FlatConfigArray } from "../types"

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
  return createConfig({
    name: "@effective/eslint/regexp",
    presets: [regexpPlugin.configs["flat/recommended"]],
  }).build()
}
