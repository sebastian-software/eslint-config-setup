import type { FlatConfigArray } from "../types.ts"

export function declarationsOverride(): FlatConfigArray {
  return [
    {
      name: "@effective/eslint/declarations",
      files: ["**/*.d.ts"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-empty-object-type": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/no-namespace": "off",
        "import-x/no-duplicates": "off",
        "unused-imports/no-unused-imports": "off",

        // AI mode rules that don't apply to declaration files
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/naming-convention": "off",
        "unicorn/prevent-abbreviations": "off",
        "unicorn/filename-case": "off",
      },
    },
  ]
}
