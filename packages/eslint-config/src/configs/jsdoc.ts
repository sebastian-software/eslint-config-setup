import jsdocPlugin from "eslint-plugin-jsdoc"

import type { FlatConfigArray } from "../types"

import { createConfig } from "../build/config-builder"

/**
 * JSDoc config — validates existing JSDoc annotations without requiring them.
 *
 * Preset: `flat/recommended-typescript-error` — all recommended JSDoc rules
 * adapted for TypeScript (types are in TS, not JSDoc).
 *
 * Overrides:
 * - `require-jsdoc` OFF — we validate existing JSDoc, we don't mandate it
 * - param/return descriptions downgraded to warn — helpful but not blocking
 * @see https://github.com/gajus/eslint-plugin-jsdoc#rules
 */
export function jsdocConfig(opts?: { ai?: boolean }): FlatConfigArray {
  const isAi = opts?.ai ?? false

  const builder = createConfig({
    name: "eslint-config-setup/jsdoc",
    presets: [jsdocPlugin.configs["flat/recommended-typescript-error"]],
  })
    // OFF: Don't require JSDoc on everything — only validate what exists
    // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-jsdoc.md
    .overrideRule("jsdoc/require-jsdoc", "off")

    // OFF: Too strict for normal usage — requiring @param/@returns on every
    // documented function adds noise. Enabled in AI mode where completeness matters.
    .overrideRule("jsdoc/require-param", "off")
    .overrideRule("jsdoc/require-returns", "off")
    .overrideRule("jsdoc/require-yields", "off")

    // Warn if @param descriptions are missing — helpful but not blocking
    // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-param-description.md
    .overrideRule("jsdoc/require-param-description", "warn")

    // Warn if @returns description is missing — helpful but not blocking
    // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-returns-description.md
    .overrideRule("jsdoc/require-returns-description", "warn")

    // Override preset's typed option — use plain error without options
    // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-tag-names.md
    .overrideRule("jsdoc/check-tag-names", "error")

    // Enable detection of references to undefined types in JSDoc (off in preset)
    // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/no-undefined-types.md
    .overrideRule("jsdoc/no-undefined-types", "error")

    // OFF: Allow blank lines between description and tags — keeps JSDoc readable
    // The preset enforces no blank lines before tags, but visual separation helps.
    .overrideRule("jsdoc/tag-lines", "off")

  if (isAi) {
    builder.overrideRule("jsdoc/require-param", "error")
    builder.overrideRule("jsdoc/require-returns", "error")
    builder.overrideRule("jsdoc/informative-docs", "error")
  }

  return builder.build()
}
