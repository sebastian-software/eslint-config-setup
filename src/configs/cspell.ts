import cspellPlugin from "@cspell/eslint-plugin"

import type { FlatConfigArray } from "../types.ts"

/**
 * CSpell config — spell checking for identifiers and comments.
 * Catches typos in variable names, function names, and documentation.
 * Severity is "warn" because dictionary misses are common for domain terms.
 *
 * @see https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-eslint-plugin#readme
 */
export function cspellConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/cspell",
      plugins: {
        "@cspell": cspellPlugin,
      },
      rules: {
        // Check spelling in identifiers and comments — catches typos in API names
        // Strings are excluded (may contain user-facing text, URLs, etc.)
        // Auto-fix disabled — spelling corrections need human review
        // https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-eslint-plugin#rules
        "@cspell/spellchecker": [
          "warn",
          {
            checkComments: true,
            checkIdentifiers: true,
            checkStrings: false,
            autoFix: false,
          },
        ],
      },
    },
  ]
}
