import type { FlatConfigArray } from "../types.ts"

export function standardComplexity(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/complexity-standard",
      rules: {
        complexity: ["error", 15],
        "max-depth": ["error", 4],
        "max-nested-callbacks": ["error", 3],
        "max-params": ["error", 4],
        "max-statements": ["error", 20],
        "max-lines-per-function": [
          "error",
          { max: 80, skipBlankLines: true, skipComments: true },
        ],
        "max-lines": [
          "error",
          { max: 500, skipBlankLines: true, skipComments: true },
        ],
        "sonarjs/cognitive-complexity": ["error", 15],
      },
    },
  ]
}
