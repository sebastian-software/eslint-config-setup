import tseslint from "typescript-eslint"

import type { ConfigOptions, FlatConfigArray } from "../types.ts"

export function typescriptConfig(opts: ConfigOptions): FlatConfigArray {
  const typeChecked = opts.strict
    ? tseslint.configs.strictTypeChecked
    : tseslint.configs.recommendedTypeChecked

  return [
    ...typeChecked as FlatConfigArray,
    ...tseslint.configs.stylisticTypeChecked as FlatConfigArray,
    {
      name: "@effective/eslint/typescript",
      languageOptions: {
        parserOptions: {
          projectService: true,
        },
      },
      rules: {
        "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { fixStyle: "inline-type-imports" },
        ],
        "@typescript-eslint/consistent-type-exports": [
          "error",
          { fixMixedExportsWithInlineTypeSpecifier: true },
        ],
        "@typescript-eslint/no-import-type-side-effects": "error",
        "@typescript-eslint/no-unnecessary-qualifier": "error",
        "@typescript-eslint/no-useless-empty-export": "error",
      },
    },
    {
      name: "@effective/eslint/typescript-js-compat",
      files: ["**/*.{js,mjs,cjs}"],
      ...tseslint.configs.disableTypeChecked,
    },
  ]
}
