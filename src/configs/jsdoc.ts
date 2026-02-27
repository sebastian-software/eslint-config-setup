import jsdocPlugin from "eslint-plugin-jsdoc"

import type { FlatConfigArray } from "../types.ts"

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
  return [
    {
      ...jsdocPlugin.configs["flat/recommended-typescript-error"],
      name: "@effective/eslint/jsdoc",
      rules: {
        // Include all preset rules
        ...jsdocPlugin.configs["flat/recommended-typescript-error"].rules,

        // OFF: Don't require JSDoc on everything — only validate what exists
        // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-jsdoc.md
        "jsdoc/require-jsdoc": "off",

        // Warn if @param descriptions are missing — helpful but not blocking
        // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-param-description.md
        "jsdoc/require-param-description": "warn",

        // Warn if @returns description is missing — helpful but not blocking
        // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-returns-description.md
        "jsdoc/require-returns-description": "warn",

        // Validate JSDoc tag names — catches typos like @retuns or @parma
        // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-tag-names.md
        "jsdoc/check-tag-names": "error",

        // Validate JSDoc types syntax — catches malformed type expressions
        // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-types.md
        "jsdoc/check-types": "error",

        // Detect references to undefined types in JSDoc
        // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/no-undefined-types.md
        "jsdoc/no-undefined-types": "error",

        // Validate JSDoc type syntax is well-formed
        // https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/valid-types.md
        "jsdoc/valid-types": "error",
      },
    },
  ]
}
