import jsdocPlugin from "eslint-plugin-jsdoc"

import { createConfig } from "../build/config-builder"
import type { FlatConfigArray } from "../types"

/**
 * JSDoc config — validates existing JSDoc annotations without requiring them.
 *
 * Preset: `flat/recommended-typescript-error` — all recommended JSDoc rules
 * adapted for TypeScript (types are in TS, not JSDoc).
 *
 * Overrides:
 * - `require-jsdoc` OFF — we validate existing JSDoc, we don't mandate it
 * - param/return descriptions downgraded to warn — helpful but not blocking
 *
 * @see https://github.com/gajus/eslint-plugin-jsdoc#rules
 */
export function jsdocConfig(): FlatConfigArray {
  return createConfig({
    name: "@effective/eslint/jsdoc",
    presets: [jsdocPlugin.configs["flat/recommended-typescript-error"]],
  })
    // OFF: Don't require JSDoc on everything — only validate what exists
    // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-jsdoc.md
    .overrideRule("jsdoc/require-jsdoc", "off")

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

    .build()
}
