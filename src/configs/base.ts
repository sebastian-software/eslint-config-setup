import eslint from "@eslint/js"

import type { FlatConfigArray } from "../types.ts"

export function baseConfig(): FlatConfigArray {
  return [
    {
      ...eslint.configs.recommended,
      name: "@effective/eslint/base",
      rules: {
        ...eslint.configs.recommended.rules,

        // Best practices beyond recommended
        "accessor-pairs": ["error", { enforceForClassMembers: true }],
        "array-callback-return": ["error", { allowImplicit: true }],
        "no-constructor-return": "error",
        "no-promise-executor-return": "error",
        "no-self-compare": "error",
        "no-template-curly-in-string": "error",
        "no-unreachable-loop": "error",
        "no-unused-private-class-members": "error",
        "require-atomic-updates": "error",

        // Style consistency (always active)
        curly: "error",
        eqeqeq: "error",
        "guard-for-in": "error",
        "no-var": "error",
        "prefer-const": "error",
        "prefer-object-has-own": "error",
        "prefer-object-spread": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "prefer-template": "error",
        "symbol-description": "error",
      },
    },
  ]
}
