import eslint from "@eslint/js"

import type { FlatConfigArray } from "../types.ts"

/**
 * Base ESLint config — extends `eslint.configs.recommended` with additional
 * best-practice rules for error prevention and modern JS style.
 *
 * Preset: @eslint/js recommended
 * @see https://eslint.org/docs/latest/rules/
 */
export function baseConfig(): FlatConfigArray {
  return [
    {
      ...eslint.configs.recommended,
      name: "@effective/eslint/base",
      rules: {
        // All rules from eslint/recommended (60+ rules covering common errors)
        // https://eslint.org/docs/latest/config/configuration-files#using-predefined-configurations
        ...eslint.configs.recommended.rules,

        // ── Beyond recommended: error prevention ──────────────────────

        // Enforce getter/setter pairs — prevents incomplete property accessors
        // https://eslint.org/docs/latest/rules/accessor-pairs
        "accessor-pairs": ["error", { enforceForClassMembers: true }],

        // Require return in array method callbacks — prevents silent bugs in .map/.filter
        // https://eslint.org/docs/latest/rules/array-callback-return
        "array-callback-return": ["error", { allowImplicit: true }],

        // Disallow returning values from constructors — constructors should not return
        // https://eslint.org/docs/latest/rules/no-constructor-return
        "no-constructor-return": "error",

        // Disallow returning values from Promise executors — use resolve/reject instead
        // https://eslint.org/docs/latest/rules/no-promise-executor-return
        "no-promise-executor-return": "error",

        // Disallow self-comparison (x === x) — always a bug, use Number.isNaN instead
        // https://eslint.org/docs/latest/rules/no-self-compare
        "no-self-compare": "error",

        // Detect template literal syntax in regular strings — likely a forgotten backtick
        // https://eslint.org/docs/latest/rules/no-template-curly-in-string
        "no-template-curly-in-string": "error",

        // Detect loops that can only iterate once — logic error indicator
        // https://eslint.org/docs/latest/rules/no-unreachable-loop
        "no-unreachable-loop": "error",

        // Detect unused private class members — dead code in classes
        // https://eslint.org/docs/latest/rules/no-unused-private-class-members
        "no-unused-private-class-members": "error",

        // Detect race conditions with shared variables in async code
        // https://eslint.org/docs/latest/rules/require-atomic-updates
        "require-atomic-updates": "error",

        // ── Beyond recommended: modern JS style ───────────────────────

        // Require braces around all control flow — prevents dangling-statement bugs
        // https://eslint.org/docs/latest/rules/curly
        curly: "error",

        // Require strict equality (===) — prevents type coercion surprises
        // https://eslint.org/docs/latest/rules/eqeqeq
        eqeqeq: "error",

        // Require hasOwnProperty check in for-in — prevents prototype chain iteration
        // https://eslint.org/docs/latest/rules/guard-for-in
        "guard-for-in": "error",

        // Disallow var — use let/const for block scoping
        // https://eslint.org/docs/latest/rules/no-var
        "no-var": "error",

        // Prefer const for variables never reassigned — signals intent
        // https://eslint.org/docs/latest/rules/prefer-const
        "prefer-const": "error",

        // Prefer Object.hasOwn() over Object.prototype.hasOwnProperty.call()
        // https://eslint.org/docs/latest/rules/prefer-object-has-own
        "prefer-object-has-own": "error",

        // Prefer { ...obj } over Object.assign({}, obj) — more readable
        // https://eslint.org/docs/latest/rules/prefer-object-spread
        "prefer-object-spread": "error",

        // Prefer rest parameters over `arguments` object — typed and array-like
        // https://eslint.org/docs/latest/rules/prefer-rest-params
        "prefer-rest-params": "error",

        // Prefer spread syntax over Function.prototype.apply() — cleaner syntax
        // https://eslint.org/docs/latest/rules/prefer-spread
        "prefer-spread": "error",

        // Prefer template literals over string concatenation — more readable
        // https://eslint.org/docs/latest/rules/prefer-template
        "prefer-template": "error",

        // Require description for Symbol() — aids debugging
        // https://eslint.org/docs/latest/rules/symbol-description
        "symbol-description": "error",
      },
    },
  ]
}
