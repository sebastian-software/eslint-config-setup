import eslintCommentsPlugin from "@eslint-community/eslint-plugin-eslint-comments"

import type { FlatConfigArray } from "../types"

/**
 * ESLint comments config — keeps directive comments precise and current.
 *
 * @see https://github.com/eslint-community/eslint-plugin-eslint-comments
 */
export function eslintCommentsConfig(): FlatConfigArray {
  return [
    {
      name: "eslint-config-setup/eslint-comments",
      plugins: {
        "@eslint-community/eslint-comments": eslintCommentsPlugin,
      },
      rules: {
        // Require temporary disables to be paired with an enable, while allowing whole-file disables.
        // https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/disable-enable-pair.html
        "@eslint-community/eslint-comments/disable-enable-pair": [
          "error",
          { allowWholeFile: true },
        ],

        // Disallow `eslint-enable` comments that re-enable multiple rules at once.
        // https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-aggregating-enable.html
        "@eslint-community/eslint-comments/no-aggregating-enable": "error",

        // Disallow duplicate disables for the same rule.
        // https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-duplicate-disable.html
        "@eslint-community/eslint-comments/no-duplicate-disable": "error",

        // Disallow broad `eslint-disable` comments without explicit rule names.
        // https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-unlimited-disable.html
        "@eslint-community/eslint-comments/no-unlimited-disable": "error",

        // Disallow stale `eslint-disable` comments that no longer suppress any report.
        // https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-unused-disable.html
        "@eslint-community/eslint-comments/no-unused-disable": "error",

        // Disallow stale `eslint-enable` comments that do not re-enable anything.
        // https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/no-unused-enable.html
        "@eslint-community/eslint-comments/no-unused-enable": "error",
      },
    },
  ]
}
