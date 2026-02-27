import type { FlatConfigArray } from "../types.ts"

/**
 * Standard complexity preset — reasonable limits for production code.
 * These limits are generous enough to avoid false positives on most
 * real-world code while still catching genuinely complex functions.
 *
 * @see https://eslint.org/docs/latest/rules/#suggestions (complexity rules)
 */
export function standardComplexity(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/complexity-standard",
      rules: {
        // Max cyclomatic complexity per function — 15 branches
        // https://eslint.org/docs/latest/rules/complexity
        complexity: ["error", 15],

        // Max nesting depth — 4 levels before extraction needed
        // https://eslint.org/docs/latest/rules/max-depth
        "max-depth": ["error", 4],

        // Max nested callbacks — 3 levels (avoid callback hell)
        // https://eslint.org/docs/latest/rules/max-nested-callbacks
        "max-nested-callbacks": ["error", 3],

        // Max function parameters — 4 before using options object
        // https://eslint.org/docs/latest/rules/max-params
        "max-params": ["error", 4],

        // Max statements per function — 20
        // https://eslint.org/docs/latest/rules/max-statements
        "max-statements": ["error", 20],

        // Max lines per function — 80 (excluding blanks and comments)
        // https://eslint.org/docs/latest/rules/max-lines-per-function
        "max-lines-per-function": [
          "error",
          { max: 80, skipBlankLines: true, skipComments: true },
        ],

        // Max lines per file — 500 (excluding blanks and comments)
        // https://eslint.org/docs/latest/rules/max-lines
        "max-lines": [
          "error",
          { max: 500, skipBlankLines: true, skipComments: true },
        ],

        // Cognitive complexity — measures how hard code is to understand
        // https://sonarsource.github.io/rspec/#/rspec/S3776/javascript
        "sonarjs/cognitive-complexity": ["error", 15],
      },
    },
  ]
}
