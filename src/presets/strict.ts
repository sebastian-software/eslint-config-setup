import type { FlatConfigArray } from "../types.ts"

/**
 * Strict complexity preset — tighter limits for teams that prioritize
 * small, focused functions. These limits encourage aggressive extraction
 * of helper functions and modules.
 *
 * @see https://eslint.org/docs/latest/rules/#suggestions (complexity rules)
 */
export function strictComplexity(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/complexity-strict",
      rules: {
        // Max cyclomatic complexity per function — 10 branches
        // https://eslint.org/docs/latest/rules/complexity
        complexity: ["error", 10],

        // Max nesting depth — 3 levels
        // https://eslint.org/docs/latest/rules/max-depth
        "max-depth": ["error", 3],

        // Max nested callbacks — 2 levels
        // https://eslint.org/docs/latest/rules/max-nested-callbacks
        "max-nested-callbacks": ["error", 2],

        // Max function parameters — 3 before using options object
        // https://eslint.org/docs/latest/rules/max-params
        "max-params": ["error", 3],

        // Max statements per function — 15
        // https://eslint.org/docs/latest/rules/max-statements
        "max-statements": ["error", 15],

        // Max lines per function — 50 (excluding blanks and comments)
        // https://eslint.org/docs/latest/rules/max-lines-per-function
        "max-lines-per-function": [
          "error",
          { max: 50, skipBlankLines: true, skipComments: true },
        ],

        // Max lines per file — 300 (excluding blanks and comments)
        // https://eslint.org/docs/latest/rules/max-lines
        "max-lines": [
          "error",
          { max: 300, skipBlankLines: true, skipComments: true },
        ],

        // Cognitive complexity — measures how hard code is to understand
        // https://sonarsource.github.io/rspec/#/rspec/S3776/javascript
        "sonarjs/cognitive-complexity": ["error", 10],
      },
    },
  ]
}
