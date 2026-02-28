import sonarjsPlugin from "eslint-plugin-sonarjs"

import type { FlatConfigArray } from "../types"

/**
 * SonarJS config — code-quality rules from SonarSource.
 * Hand-picked subset focused on bug detection and code smells.
 * We don't use the full preset because many SonarJS rules overlap with
 * typescript-eslint and unicorn.
 *
 * @see https://github.com/SonarSource/SonarJS/tree/master/packages/jsts/src/rules#readme
 */
export function sonarjsConfig(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/sonarjs",
      plugins: {
        sonarjs: sonarjsPlugin as Record<string, unknown>,
      },
      rules: {
        // Detect copy-pasted functions — extract to shared helper instead
        // https://sonarsource.github.io/rspec/#/rspec/S4144/javascript
        "sonarjs/no-identical-functions": "error",

        // Merge nested if-statements that can be combined — reduces nesting
        // https://sonarsource.github.io/rspec/#/rspec/S1066/javascript
        "sonarjs/no-collapsible-if": "error",

        // Simplify `if (x) return true; else return false;` → `return x`
        // https://sonarsource.github.io/rspec/#/rspec/S1125/javascript
        "sonarjs/no-redundant-boolean": "error",

        // Detect collections that are populated but never read — dead code
        // https://sonarsource.github.io/rspec/#/rspec/S4030/javascript
        "sonarjs/no-unused-collection": "error",

        // Return value directly instead of storing in temp variable first
        // https://sonarsource.github.io/rspec/#/rspec/S1488/javascript
        "sonarjs/prefer-immediate-return": "error",

        // Simplify boolean return patterns — `return cond` instead of `if/else`
        // https://sonarsource.github.io/rspec/#/rspec/S1126/javascript
        "sonarjs/prefer-single-boolean-return": "error",

        // Detect identical sub-expressions on both sides of operator (x && x)
        // https://sonarsource.github.io/rspec/#/rspec/S1764/javascript
        "sonarjs/no-identical-expressions": "error",

        // Simplify `!(a === b)` → `a !== b` — more readable
        // https://sonarsource.github.io/rspec/#/rspec/S1940/javascript
        "sonarjs/no-inverted-boolean-check": "error",

        // Detect size/length comparisons that are always true/false
        // https://sonarsource.github.io/rspec/#/rspec/S3981/javascript
        "sonarjs/no-collection-size-mischeck": "error",

        // Detect duplicate conditions in if/else-if chains — copy-paste bug
        // https://sonarsource.github.io/rspec/#/rspec/S1862/javascript
        "sonarjs/no-identical-conditions": "error",

        // Detect identical code in if and else branches — refactoring leftover
        // https://sonarsource.github.io/rspec/#/rspec/S1871/javascript
        "sonarjs/no-duplicated-branches": "error",

        // Detect .filter()/.map()/.slice() called without using the result
        // https://sonarsource.github.io/rspec/#/rspec/S2201/javascript
        "sonarjs/no-ignored-return": "error",

        // Detect redundant return/break/continue at end of block
        // https://sonarsource.github.io/rspec/#/rspec/S3626/javascript
        "sonarjs/no-redundant-jump": "error",

        // Prevent .only() from being committed — blocks CI for others
        // https://sonarsource.github.io/rspec/#/rspec/S6426/javascript
        "sonarjs/no-exclusive-tests": "error",

        // Detect `const sorted = arr.sort()` — .sort() mutates the original
        // https://sonarsource.github.io/rspec/#/rspec/S4043/javascript
        "sonarjs/no-misleading-array-reverse": "error",

        // Require initial value for .reduce() — crashes on empty arrays without it
        // https://sonarsource.github.io/rspec/#/rspec/S6959/javascript
        "sonarjs/reduce-initial-value": "error",

        // Disallow async operations in constructors — use factory methods
        // https://sonarsource.github.io/rspec/#/rspec/S7059/javascript
        "sonarjs/no-async-constructor": "error",

        // Detect `field?: string | undefined` — the `?` already implies undefined
        // https://sonarsource.github.io/rspec/#/rspec/S4782/javascript
        "sonarjs/no-redundant-optional": "error",

        // Detect `string | number | string` — duplicate constituents in unions
        // https://sonarsource.github.io/rspec/#/rspec/S4621/javascript
        "sonarjs/no-duplicate-in-composite": "error",
      },
    },
  ]
}
