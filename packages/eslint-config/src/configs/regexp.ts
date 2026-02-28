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
  })

    // ── Beyond recommended ──────────────────────────────────────────

    // Disallow invisible control characters in regex — almost always a paste artifact
    // https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-control-character.html
    .addRule("regexp/no-control-character", "error")

    // Disallow ambiguous octal escapes — use \x01 or named backreference instead
    // https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-octal.html
    .addRule("regexp/no-octal", "error")

    // Disallow standalone backslashes — /\a/ silently ignores the backslash
    // https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-standalone-backslash.html
    .addRule("regexp/no-standalone-backslash", "error")

    // Detect patterns with quadratic move behavior — subtle ReDoS variant
    // https://ota-meshi.github.io/eslint-plugin-regexp/rules/no-super-linear-move.html
    .addRule("regexp/no-super-linear-move", "error")

    // Require $$ for literal dollar signs in replacement strings — prevents bugs
    // https://ota-meshi.github.io/eslint-plugin-regexp/rules/prefer-escape-replacement-dollar-char.html
    .addRule("regexp/prefer-escape-replacement-dollar-char", "error")

    .build()
}
