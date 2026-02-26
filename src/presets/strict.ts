import type { FlatConfigArray } from "../types.ts"

export function strictComplexity(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/complexity-strict",
      rules: {
        complexity: ["error", 10],
        "max-depth": ["error", 3],
        "max-nested-callbacks": ["error", 2],
        "max-params": ["error", 3],
        "max-statements": ["error", 15],
        "max-lines-per-function": [
          "error",
          { max: 50, skipBlankLines: true, skipComments: true },
        ],
        "max-lines": [
          "error",
          { max: 300, skipBlankLines: true, skipComments: true },
        ],
        "sonarjs/cognitive-complexity": ["error", 10],
      },
    },
  ]
}
