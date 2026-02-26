import jsdocPlugin from "eslint-plugin-jsdoc"

import type { FlatConfigArray } from "../types.ts"

export function jsdocConfig(): FlatConfigArray {
  return [
    {
      ...jsdocPlugin.configs["flat/recommended-typescript-error"],
      name: "@effective/eslint/jsdoc",
      rules: {
        ...jsdocPlugin.configs["flat/recommended-typescript-error"].rules,

        // Relax: don't require JSDoc on everything, just validate what exists
        "jsdoc/require-jsdoc": "off",
        "jsdoc/require-param-description": "warn",
        "jsdoc/require-returns-description": "warn",
        "jsdoc/check-tag-names": "error",
        "jsdoc/check-types": "error",
        "jsdoc/no-undefined-types": "error",
        "jsdoc/valid-types": "error",
      },
    },
  ]
}
