import prettierConfig from "eslint-config-prettier"

import type { FlatConfigArray } from "../types.ts"

export function prettierCompatConfig(): FlatConfigArray {
  return [
    {
      ...prettierConfig,
      name: "@effective/eslint/prettier",
    },
  ]
}
