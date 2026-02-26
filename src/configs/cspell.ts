import cspellPlugin from "@cspell/eslint-plugin"

import type { FlatConfigArray } from "../types.ts"

export function cspellConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/cspell",
      plugins: {
        "@cspell": cspellPlugin,
      },
      rules: {
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
