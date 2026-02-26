import regexpPlugin from "eslint-plugin-regexp"

import type { FlatConfigArray } from "../types.ts"

export function regexpConfig(): FlatConfigArray {
  return [
    {
      ...regexpPlugin.configs["flat/recommended"],
      name: "@effective/eslint/regexp",
    },
  ]
}
