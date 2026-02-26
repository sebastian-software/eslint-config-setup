import sonarjsPlugin from "eslint-plugin-sonarjs"

import type { FlatConfigArray } from "../types.ts"

export function sonarjsConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/sonarjs",
      plugins: {
        sonarjs: sonarjsPlugin as Record<string, unknown>,
      },
      rules: {
        "sonarjs/no-identical-functions": "error",
        "sonarjs/no-collapsible-if": "error",
        "sonarjs/no-redundant-boolean": "error",
        "sonarjs/no-unused-collection": "error",
        "sonarjs/prefer-immediate-return": "error",
        "sonarjs/prefer-single-boolean-return": "error",
        "sonarjs/no-identical-expressions": "error",
        "sonarjs/no-inverted-boolean-check": "error",
        "sonarjs/no-collection-size-mischeck": "error",
      },
    },
  ]
}
