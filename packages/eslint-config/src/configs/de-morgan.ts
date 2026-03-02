import deMorganPlugin from "eslint-plugin-de-morgan"

import type { FlatConfigArray } from "../types"

/**
 * De Morgan config — enforces De Morgan's laws on negated boolean expressions.
 * Both rules are auto-fixable: !(A && B) → !A || !B and !(A || B) → !A && !B.
 *
 * Complements sonarjs/no-inverted-boolean-check (which handles simple !(a === b) → a !== b)
 * by targeting compound expressions with && and ||.
 *
 * @see https://github.com/azat-io/eslint-plugin-de-morgan
 */
export function deMorganConfig(): FlatConfigArray {
  return [
    {
      name: "eslint-config-setup/de-morgan",
      plugins: {
        "de-morgan": deMorganPlugin,
      },
      rules: {
        // Transform !(A && B) → !A || !B — more readable negated conjunction
        // https://github.com/azat-io/eslint-plugin-de-morgan/blob/main/docs/no-negated-conjunction.md
        "de-morgan/no-negated-conjunction": "error",

        // Transform !(A || B) → !A && !B — more readable negated disjunction
        // https://github.com/azat-io/eslint-plugin-de-morgan/blob/main/docs/no-negated-disjunction.md
        "de-morgan/no-negated-disjunction": "error",
      },
    },
  ]
}
